/**
 * Smart rate limiter that doesn't annoy normal users
 * Uses in-memory storage (no Redis needed for V1)
 */

import type { RequestEvent } from '@sveltejs/kit';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts = new Map<string, AttemptRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request should be rate limited
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    // No previous attempts
    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return true;
    }

    // Currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // Window expired, reset
    if (now - record.firstAttempt > config.windowMs) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return true;
    }

    // Within window, increment count
    record.count++;

    // Check if exceeded limit
    if (record.count > config.maxAttempts) {
      // Block for specified duration or 15 minutes
      record.blockedUntil = now + (config.blockDurationMs || 15 * 60 * 1000);
      return false;
    }

    return true;
  }

  /**
   * Reset attempts for a key (e.g., after successful login)
   */
  reset(key: string) {
    this.attempts.delete(key);
  }

  /**
   * Clean up old entries to prevent memory leak
   */
  private cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, record] of this.attempts.entries()) {
      if (now - record.firstAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.attempts.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Preset configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - strict limits
  login: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000
  },
  
  signup: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000
  },
  
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000
  },
  
  // Financial endpoints - very strict
  payment: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  
  checkout: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 10 * 60 * 1000
  },
  
  // User actions - moderate limits
  favorites: {
    maxAttempts: 50,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 2 * 60 * 1000 // 2 minutes
  },
  
  followers: {
    maxAttempts: 30,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000
  },
  
  messaging: {
    maxAttempts: 20,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000
  },
  
  // Product operations - balanced limits
  productMutations: {
    maxAttempts: 20,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 5 * 60 * 1000
  },
  
  productUploads: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 10 * 60 * 1000
  },
  
  // Admin endpoints - very strict
  admin: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  
  // General API endpoints - generous limits
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000
  },
  
  // Read-only endpoints - very generous
  apiRead: {
    maxAttempts: 300,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 1 * 60 * 1000 // 1 minute
  },
  
  // Heavy operations - strict limits
  heavyOps: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  }
};

/**
 * Helper function to use in API routes
 */
export function checkRateLimit(
  identifier: string, 
  endpoint: keyof typeof RATE_LIMIT_CONFIGS
): { allowed: boolean; retryAfter?: number } {
  const config = RATE_LIMIT_CONFIGS[endpoint];
  const allowed = rateLimiter.check(identifier, config);
  
  if (!allowed) {
    const record = rateLimiter['attempts'].get(identifier);
    const retryAfter = record?.blockedUntil 
      ? Math.ceil((record.blockedUntil - Date.now()) / 1000)
      : config.windowMs / 1000;
    
    return { allowed: false, retryAfter };
  }
  
  return { allowed: true };
}

/**
 * Utility to create rate limit error response
 */
export function rateLimitResponse(retryAfter: number, message?: string) {
  return {
    error: 'Rate limit exceeded',
    message: message || `Too many requests. Please try again in ${retryAfter} seconds.`,
    retryAfter,
    type: 'RATE_LIMIT_ERROR'
  };
}

/**
 * Middleware wrapper for rate limiting API routes
 */
export function withRateLimit(
  endpoint: keyof typeof RATE_LIMIT_CONFIGS,
  options?: {
    keyGenerator?: (request: Request, clientAddress: string, locals?: Record<string, unknown>) => string;
    customMessage?: string;
  }
) {
  return function (handler: (event: RequestEvent) => Promise<Response>) {
    return async function rateLimitedHandler(event: RequestEvent) {
      try {
        const { request, getClientAddress, locals } = event;
        
        // Generate rate limit key
        const clientIp = getClientAddress();
        const defaultKey = `${endpoint}:${clientIp}`;
        const rateLimitKey = options?.keyGenerator 
          ? options.keyGenerator(request, clientIp, locals)
          : defaultKey;
        
        // Check rate limit
        const { allowed, retryAfter } = checkRateLimit(rateLimitKey, endpoint);
        
        if (!allowed) {
          return new Response(
            JSON.stringify(rateLimitResponse(retryAfter!, options?.customMessage)),
            { 
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter!.toString()
              }
            }
          );
        }
        
        // Call original handler
        return await handler(event);
        
      } catch {
        // If rate limiting fails, allow the request through (fail open)
        return await handler(event);
      }
    };
  };
}

/**
 * Quick rate limit check with JSON response
 */
export async function enforceRateLimit(
  _request: Request,
  getClientAddress: () => string,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS,
  customKey?: string
): Promise<Response | null> {
  const clientIp = getClientAddress();
  const rateLimitKey = customKey || `${endpoint}:${clientIp}`;
  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, endpoint);
  
  if (!allowed) {
    return new Response(
      JSON.stringify(rateLimitResponse(retryAfter!)),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter!.toString()
        }
      }
    );
  }
  
  return null; // No rate limit exceeded
}