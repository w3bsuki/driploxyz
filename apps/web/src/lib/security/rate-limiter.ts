/**
 * Smart rate limiter that doesn't annoy normal users
 * Uses in-memory storage (no Redis needed for V1)
 */

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
  // Login: 10 attempts per 15 minutes (normal users might forget password)
  login: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000
  },
  
  // Signup: 5 attempts per hour (prevent spam accounts)
  signup: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000
  },
  
  // Password reset: 3 attempts per hour per email
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000
  },
  
  // API calls: 100 per minute (for general API endpoints)
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000
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