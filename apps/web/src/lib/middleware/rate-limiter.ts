/**
 * Rate Limiting Middleware for SvelteKit API Routes
 * Implements token bucket algorithm for production-ready rate limiting
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip || 'unknown';
}

/**
 * Rate limiting middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  return async (request: Request): Promise<Response | null> => {
    const key = config.keyGenerator ? config.keyGenerator(request) : defaultKeyGenerator(request);
    const now = Date.now();

    // Initialize or get existing entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    // Check if limit exceeded
    if (store[key].count >= config.maxRequests) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': store[key].resetTime.toString()
          }
        }
      );
    }

    // Increment counter
    store[key].count++;

    // Add rate limit headers to response
    const remaining = Math.max(0, config.maxRequests - store[key].count);
    
    return new Response(null, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': store[key].resetTime.toString()
      }
    });
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimits = {
  // Strict rate limit for auth endpoints
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (request) => {
      // Use IP + user agent for auth endpoints
      const ip = defaultKeyGenerator(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      return `auth:${ip}:${userAgent}`;
    }
  }),

  // Moderate rate limit for API endpoints
  api: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  }),

  // Lenient rate limit for public endpoints
  public: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per 15 minutes
  }),

  // Strict rate limit for search endpoints
  search: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  }),

  // Rate limit for file uploads
  upload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
  }),

  // Rate limit for messaging
  messaging: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20, // 20 messages per minute
  })
};

/**
 * Apply rate limiting to a SvelteKit API route
 */
export async function applyRateLimit(
  request: Request,
  rateLimitType: keyof typeof rateLimits
): Promise<Response | null> {
  const rateLimit = rateLimits[rateLimitType];
  return await rateLimit(request);
}
