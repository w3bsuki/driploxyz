import type { RequestEvent } from '@sveltejs/kit';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (event: RequestEvent) => string;
  message?: string;
}

// Simple in-memory rate limiter (production should use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = (event) => event.locals.clientIp ?? event.getClientAddress(),
    message = 'Too many requests'
  } = options;

  return async (event: RequestEvent) => {
    const key = keyGenerator(event);
    const now = Date.now();

    const current = requestCounts.get(key);

    if (!current || now > current.resetTime) {
      // Reset or create new window
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      throw new Response(message, { status: 429 });
    }

    current.count += 1;
    return true;
  };
}

// Pre-configured rate limiters for common use cases
export const authRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts'
});

export const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: 'API rate limit exceeded'
});

export const searchRateLimit = rateLimit({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute - Phase 5 spec: 20 req/min per IP
  message: 'Search rate limit exceeded. Please wait before searching again.'
});

export const uploadRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  message: 'Upload rate limit exceeded'
});