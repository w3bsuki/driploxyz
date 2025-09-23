/**
 * Security Middleware for SvelteKit API Routes
 * Comprehensive security measures for production
 */

import { applyRateLimit } from './rate-limiter.js';
import { createMethodNotAllowedResponse, logger } from './error-handler.js';

/**
 * Security headers for all API responses
 */
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent iframe embedding (clickjacking protection)
  'X-Frame-Options': 'DENY',

  // Enable XSS filtering
  'X-XSS-Protection': '1; mode=block',

  // Force HTTPS for 1 year
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restrict browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',

  // Content Security Policy - Production ready
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://browser.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: *.supabase.co *.stripe.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss: *.supabase.co *.stripe.com *.sentry.io",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...SECURITY_HEADERS
    }
  });

  return newResponse;
}

/**
 * Validate request method
 */
export function validateMethod(request: Request, allowedMethods: string[]): Response | null {
  if (!allowedMethods.includes(request.method)) {
    return createMethodNotAllowedResponse(allowedMethods);
  }
  return null;
}

/**
 * Extract and validate user ID from request
 */
export function extractUserId(request: Request): string | null {
  // In a real implementation, you would extract from JWT token
  // For now, we'll check for a user header (set by auth middleware)
  return request.headers.get('x-user-id');
}

/**
 * Check if user is authenticated
 */
export function requireAuth(request: Request): { userId: string } | Response {
  const userId = extractUserId(request);
  
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      }
    );
  }

  return { userId };
}

/**
 * Check if user has required role
 */
export function requireRole(request: Request, allowedRoles: string[]): { userId: string; role: string } | Response {
  const authResult = requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const userRole = request.headers.get('x-user-role');
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return new Response(
      JSON.stringify({
        error: 'Insufficient permissions',
        code: 'AUTHORIZATION_ERROR',
        timestamp: new Date().toISOString()
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return { userId: authResult.userId, role: userRole };
}

/**
 * Validate request size
 */
export function validateRequestSize(request: Request, maxSize: number = 1024 * 1024): Response | null {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return new Response(
      JSON.stringify({
        error: 'Request too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: Math.round(maxSize / 1024 / 1024) + 'MB',
        timestamp: new Date().toISOString()
      }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}

/**
 * Validate content type
 */
export function validateContentType(request: Request, allowedTypes: string[] = ['application/json']): Response | null {
  const contentType = request.headers.get('content-type');
  
  if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
    return new Response(
      JSON.stringify({
        error: 'Unsupported media type',
        code: 'UNSUPPORTED_MEDIA_TYPE',
        allowedTypes,
        timestamp: new Date().toISOString()
      }),
      {
        status: 415,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}

/**
 * Comprehensive security middleware
 */
export async function applySecurity(
  request: Request,
  options: {
    rateLimit?: 'auth' | 'api' | 'public' | 'search' | 'upload' | 'messaging';
    requireAuth?: boolean;
    allowedRoles?: string[];
    allowedMethods?: string[];
    maxRequestSize?: number;
    allowedContentTypes?: string[];
  } = {}
): Promise<Response | { userId?: string; role?: string }> {
  const {
    rateLimit,
    requireAuth: needsAuth = false,
    allowedRoles = [],
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    maxRequestSize = 1024 * 1024,
    allowedContentTypes = ['application/json']
  } = options;

  // 1. Validate HTTP method
  const methodValidation = validateMethod(request, allowedMethods);
  if (methodValidation) {
    return addSecurityHeaders(methodValidation);
  }

  // 2. Validate request size
  const sizeValidation = validateRequestSize(request, maxRequestSize);
  if (sizeValidation) {
    return addSecurityHeaders(sizeValidation);
  }

  // 3. Validate content type
  const contentTypeValidation = validateContentType(request, allowedContentTypes);
  if (contentTypeValidation) {
    return addSecurityHeaders(contentTypeValidation);
  }

  // 4. Apply rate limiting
  if (rateLimit) {
    const rateLimitResponse = await applyRateLimit(request, rateLimit);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
  }

  // 5. Check authentication
  if (needsAuth) {
    if (allowedRoles.length > 0) {
      const roleCheck = requireRole(request, allowedRoles);
      if (roleCheck instanceof Response) {
        return addSecurityHeaders(roleCheck);
      }
      return roleCheck;
    } else {
      const authCheck = requireAuth(request);
      if (authCheck instanceof Response) {
        return addSecurityHeaders(authCheck);
      }
      return authCheck;
    }
  }

  return {};
}

/**
 * Security middleware for specific endpoint types
 */
export const securityConfigs = {
  // Public endpoints (no auth required)
  public: {
    rateLimit: 'public' as const,
    allowedMethods: ['GET'],
    allowedContentTypes: ['application/json']
  },

  // API endpoints (auth required)
  api: {
    rateLimit: 'api' as const,
    requireAuth: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedContentTypes: ['application/json']
  },

  // Authentication endpoints
  auth: {
    rateLimit: 'auth' as const,
    allowedMethods: ['POST'],
    allowedContentTypes: ['application/json'],
    maxRequestSize: 1024 // 1KB for auth requests
  },

  // Search endpoints
  search: {
    rateLimit: 'search' as const,
    allowedMethods: ['GET'],
    allowedContentTypes: ['application/json']
  },

  // File upload endpoints
  upload: {
    rateLimit: 'upload' as const,
    requireAuth: true,
    allowedMethods: ['POST'],
    allowedContentTypes: ['multipart/form-data'],
    maxRequestSize: 10 * 1024 * 1024 // 10MB for uploads
  },

  // Messaging endpoints
  messaging: {
    rateLimit: 'messaging' as const,
    requireAuth: true,
    allowedMethods: ['GET', 'POST'],
    allowedContentTypes: ['application/json']
  },

  // Admin endpoints
  admin: {
    rateLimit: 'api' as const,
    requireAuth: true,
    allowedRoles: ['admin'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedContentTypes: ['application/json']
  }
};

/**
 * Apply security configuration to request
 */
export async function applySecurityConfig(
  request: Request,
  configName: keyof typeof securityConfigs
): Promise<Response | { userId?: string; role?: string }> {
  const config = securityConfigs[configName];
  return await applySecurity(request, config);
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  request: Request,
  details?: Record<string, unknown>
) {
  const requestInfo = {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  };

  logger.warn(`Security event: ${event}`, requestInfo, undefined, undefined);
  
  if (details) {
    logger.info(`Security event details: ${JSON.stringify(details)}`, requestInfo);
  }
}
