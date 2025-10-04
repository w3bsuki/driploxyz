/**
 * Rate limiting utilities for API endpoints
 */

// Rate limit configuration interface
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
  message?: string; // Optional custom error message
}

// Rate limit storage interface
interface RateLimitStorage {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, value: { count: number; resetTime: number }): Promise<void>;
  increment(key: string): Promise<{ count: number; resetTime: number }>;
}

// In-memory rate limit storage (for development)
class MemoryRateLimitStorage implements RateLimitStorage {
  private storage = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.storage.set(key, value);
  }

  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const current = this.storage.get(key);
    if (!current) {
      const resetTime = Date.now() + 60000; // Default 1 minute window
      const newValue = { count: 1, resetTime };
      this.storage.set(key, newValue);
      return newValue;
    }

    // Check if the window has expired
    if (Date.now() > current.resetTime) {
      const resetTime = Date.now() + 60000; // Default 1 minute window
      const newValue = { count: 1, resetTime };
      this.storage.set(key, newValue);
      return newValue;
    }

    const newValue = { count: current.count + 1, resetTime: current.resetTime };
    this.storage.set(key, newValue);
    return newValue;
  }
}


// Rate limiter class
export class RateLimiter {
  private storage: RateLimitStorage;
  private configs = new Map<string, RateLimitConfig>();

  constructor(storage?: RateLimitStorage) {
    // Use memory storage by default, Redis in production
    this.storage = storage || new MemoryRateLimitStorage();
    
    // Set default rate limit configurations
    this.setConfig('default', {
      windowMs: 60000, // 1 minute
      maxRequests: 60,
      message: 'Too many requests, please try again later.'
    });
    
    this.setConfig('auth', {
      windowMs: 900000, // 15 minutes
      maxRequests: 5,
      message: 'Too many authentication attempts, please try again later.'
    });
    
    this.setConfig('search', {
      windowMs: 60000, // 1 minute
      maxRequests: 30,
      message: 'Too many search requests, please try again later.'
    });
    
    this.setConfig('api', {
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      message: 'API rate limit exceeded, please try again later.'
    });
    
    this.setConfig('contact', {
      windowMs: 3600000, // 1 hour
      maxRequests: 10,
      message: 'Too many contact requests, please try again later.'
    });
  }

  /**
   * Set a rate limit configuration for a specific endpoint type
   */
  setConfig(type: string, config: RateLimitConfig): void {
    this.configs.set(type, config);
  }

  /**
   * Get a rate limit configuration for a specific endpoint type
   */
  getConfig(type: string): RateLimitConfig {
    return this.configs.get(type) || this.configs.get('default')!;
  }

  /**
   * Check if a request should be rate limited
   */
  async checkLimit(
    identifier: string,
    type: string = 'default'
  ): Promise<{ allowed: boolean; resetTime?: number; message?: string }> {
    const config = this.getConfig(type);
    const key = `${type}:${identifier}`;
    
    try {
      const result = await this.storage.increment(key);
      
      if (result.count > config.maxRequests) {
        return {
          allowed: false,
          resetTime: result.resetTime,
          message: config.message
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow the request if there's an error
      return { allowed: true };
    }
  }

  /**
   * Reset the rate limit for a specific identifier
   */
  async resetLimit(identifier: string, type: string = 'default'): Promise<void> {
    const key = `${type}:${identifier}`;
    try {
      await this.storage.set(key, { count: 0, resetTime: Date.now() });
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }

  /**
   * Get the current rate limit status for a specific identifier
   */
  async getStatus(
    identifier: string,
    type: string = 'default'
  ): Promise<{ count: number; maxRequests: number; resetTime: number; windowMs: number }> {
    const config = this.getConfig(type);
    const key = `${type}:${identifier}`;
    
    try {
      const result = await this.storage.get(key);
      
      if (!result) {
        return {
          count: 0,
          maxRequests: config.maxRequests,
          resetTime: Date.now() + config.windowMs,
          windowMs: config.windowMs
        };
      }
      
      return {
        count: result.count,
        maxRequests: config.maxRequests,
        resetTime: result.resetTime,
        windowMs: config.windowMs
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return {
        count: 0,
        maxRequests: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        windowMs: config.windowMs
      };
    }
  }
}

// Create a singleton rate limiter instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get the rate limiter instance
 */
export function getRateLimiter(storage?: RateLimitStorage): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(storage);
  }
  return rateLimiterInstance;
}

/**
 * Middleware function to check rate limits
 */
export function createRateLimitMiddleware(type: string = 'default') {
  const rateLimiter = getRateLimiter();
  
  return async (_request: Request, identifier: string) => {
    const result = await rateLimiter.checkLimit(identifier, type);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimiter.getConfig(type).maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
          }
        }
      );
    }
    
    return null; // Continue with the request
  };
}

/**
 * Rate limiting utility for SvelteKit endpoints
 */
export async function checkRateLimit(
  request: Request,
  type: string = 'default',
  identifier?: string
): Promise<{ success: boolean; response?: Response }> {
  const rateLimiter = getRateLimiter();
  
  // Use IP address as identifier if none provided
  const id = identifier || getClientIdentifier(request);
  
  const result = await rateLimiter.checkLimit(id, type);
  
  if (!result.allowed) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimiter.getConfig(type).maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
          }
        }
      )
    };
  }
  
  return { success: true };
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: Request): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user ID from JWT token if available
      const token = authHeader.replace('Bearer ', '');
      if (token && token.split('.').length > 1) {
        const parts = token.split('.');
        if (parts[1]) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.sub) {
            return `user:${payload.sub}`;
          }
        }
      }
    } catch (_e) {
      // Ignore errors and fall back to IP
    }
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Add rate limit headers to response
 */
export async function addRateLimitHeaders(
  response: Response,
  type: string,
  identifier: string
): Promise<Response> {
  const rateLimiter = getRateLimiter();
  const status = await rateLimiter.getStatus(identifier, type);
  
  response.headers.set('X-RateLimit-Limit', status.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, status.maxRequests - status.count).toString());
  response.headers.set('X-RateLimit-Reset', new Date(status.resetTime).toISOString());
  
  return response;
}