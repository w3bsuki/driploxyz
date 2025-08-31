/**
 * API Security Layer - Production hardening helpers
 * Provides withAuth, withValidation, withCsrf, rateLimit, respond utilities
 * Following V1 production readiness requirements
 */
import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { CSRFProtection } from './csrf';
import { rateLimiter } from '../security/rate-limiter';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

// Auth context passed to protected handlers
export interface AuthContext {
  user: Database['public']['Tables']['profiles']['Row'];
  session: any;
  supabase: SupabaseClient<Database>;
}

/**
 * Wraps handler with authentication requirement
 * Returns 401 if user not authenticated
 */
export function withAuth(
  handler: (event: RequestEvent, auth: AuthContext) => Promise<Response> | Response
) {
  return async (event: RequestEvent): Promise<Response> => {
    try {
      const { user, session } = await event.locals.safeGetSession();
      
      if (!user || !session) {
        return json({ success: false, error: 'Authentication required' }, { status: 401 });
      }

      // Get user profile
      const { data: profile, error: profileError } = await event.locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return json({ success: false, error: 'User profile not found' }, { status: 404 });
      }

      const authContext: AuthContext = {
        user: profile,
        session,
        supabase: event.locals.supabase
      };

      return await handler(event, authContext);
    } catch (err) {
      console.error('Auth middleware error:', err);
      return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Wraps handler with Zod schema validation
 * Validates request body against provided schema
 */
export function withValidation<T extends z.ZodSchema>(schema: T) {
  return function(
    handler: (
      event: RequestEvent, 
      validatedData: z.infer<T>
    ) => Promise<Response> | Response
  ) {
    return async (event: RequestEvent): Promise<Response> => {
      try {
        let requestData;
        
        // Handle both JSON and FormData requests
        const contentType = event.request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          requestData = await event.request.json();
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await event.request.formData();
          requestData = Object.fromEntries(formData);
        } else {
          // For GET requests, use URL search params
          requestData = Object.fromEntries(event.url.searchParams);
        }

        const result = schema.safeParse(requestData);
        
        if (!result.success) {
          const errors = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }));
          
          return json({
            success: false,
            error: 'Validation failed',
            details: errors
          }, { status: 400 });
        }

        return await handler(event, result.data);
      } catch (err) {
        console.error('Validation middleware error:', err);
        return json({ success: false, error: 'Invalid request data' }, { status: 400 });
      }
    };
  };
}

/**
 * Wraps handler with CSRF protection
 * Checks origin header for non-GET requests
 */
export function withCsrf(
  handler: (event: RequestEvent) => Promise<Response> | Response
) {
  return async (event: RequestEvent): Promise<Response> => {
    try {
      const isProtected = CSRFProtection.check(event.request, event.url.toString());
      
      if (!isProtected) {
        return json({ success: false, error: 'Invalid request origin' }, { status: 403 });
      }

      return await handler(event);
    } catch (err) {
      console.error('CSRF middleware error:', err);
      return json({ success: false, error: 'Security check failed' }, { status: 403 });
    }
  };
}

/**
 * Wraps handler with rate limiting
 * Uses IP-based rate limiting with configurable limits
 */
export function withRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000) {
  return function(
    handler: (event: RequestEvent) => Promise<Response> | Response
  ) {
    return async (event: RequestEvent): Promise<Response> => {
      try {
        const clientIP = event.getClientAddress();
        const key = `${identifier}:${clientIP}`;
        
        const allowed = rateLimiter.check(key, { maxAttempts: maxRequests, windowMs });
        
        if (!allowed) {
          return json({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }, { status: 429 });
        }

        return await handler(event);
      } catch (err) {
        console.error('Rate limit middleware error:', err);
        // Don't block requests on rate limiter errors
        return await handler(event);
      }
    };
  };
}

/**
 * Utility to create consistent JSON responses
 * Standardizes API response format
 */
export function respond<T = unknown>(
  data?: T,
  options: {
    success?: boolean;
    message?: string;
    status?: number;
    headers?: Record<string, string>;
  } = {}
): Response {
  const {
    success = true,
    message,
    status = success ? 200 : 400,
    headers = {}
  } = options;

  const responseData: ApiResponse<T> = {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message })
  };

  return json(responseData, { status, headers });
}

/**
 * Utility to create error responses
 * Standardizes API error format
 */
export function respondError(
  error: string | ApiError,
  status: number = 400
): Response {
  if (typeof error === 'string') {
    return json({
      success: false,
      error
    }, { status });
  }

  return json({
    success: false,
    error: error.message,
    code: error.code
  }, { status: error.status || status });
}

/**
 * Combines multiple middleware functions into one
 * Usage: combine(withAuth, withValidation(schema), withCsrf, withRateLimit('api'))
 */
export function combine(...middlewares: Array<(handler: any) => any>) {
  return function(handler: any) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

// Common validation schemas for reuse
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }),
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest')
  })
};

/**
 * Example usage:
 * 
 * export const POST = combine(
 *   withRateLimit('favorites', 50, 60000),
 *   withCsrf,
 *   withAuth,
 *   withValidation(z.object({ product_id: z.string().uuid() }))
 * )(async (event, auth, validatedData) => {
 *   // Handler implementation
 *   return respond({ success: true });
 * });
 */