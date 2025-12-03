/**
 * Account Lockout Service
 * =======================
 * Persistent account lockout after failed authentication attempts
 * 
 * Features:
 * - Progressive lockout duration (5min → 15min → 1hr → 24hr)
 * - Per-account and per-IP tracking
 * - Automatic cleanup of old records
 * - Lockout bypass for trusted IPs (admin whitelist)
 * 
 * @module security/account-lockout
 */

import { dev } from '$app/environment';

interface LockoutRecord {
  failedAttempts: number;
  lastFailedAt: number;
  lockedUntil: number | null;
  lockoutLevel: number; // 0-3, determines lockout duration
}

interface LockoutConfig {
  maxAttempts: number;
  lockoutDurations: number[]; // Progressive durations in ms
  windowMs: number; // Time window for counting attempts
  cleanupIntervalMs: number;
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDurations: [
    5 * 60 * 1000,     // Level 0: 5 minutes
    15 * 60 * 1000,    // Level 1: 15 minutes
    60 * 60 * 1000,    // Level 2: 1 hour
    24 * 60 * 60 * 1000 // Level 3: 24 hours
  ],
  windowMs: 15 * 60 * 1000, // 15 minute window
  cleanupIntervalMs: 5 * 60 * 1000 // Cleanup every 5 minutes
};

/**
 * In-memory lockout storage
 * Note: For production with multiple instances, use Redis
 */
class AccountLockoutService {
  private records = new Map<string, LockoutRecord>();
  private config: LockoutConfig;
  private cleanupInterval: NodeJS.Timeout;

  // Trusted IPs that bypass lockout (for admin/testing)
  private trustedIPs = new Set<string>([
    '127.0.0.1',
    '::1'
  ]);

  constructor(config: Partial<LockoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      this.config.cleanupIntervalMs
    );
  }

  /**
   * Check if an account/IP is currently locked out
   */
  isLockedOut(key: string): { locked: boolean; retryAfter?: number; remainingAttempts?: number } {
    // Trusted IPs bypass lockout
    if (this.trustedIPs.has(key)) {
      return { locked: false, remainingAttempts: this.config.maxAttempts };
    }

    const record = this.records.get(key);
    const now = Date.now();

    if (!record) {
      return { locked: false, remainingAttempts: this.config.maxAttempts };
    }

    // Check if currently locked
    if (record.lockedUntil && now < record.lockedUntil) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
      return { locked: true, retryAfter };
    }

    // If lockout expired, clear it but keep the level
    if (record.lockedUntil && now >= record.lockedUntil) {
      record.lockedUntil = null;
      record.failedAttempts = 0;
    }

    // Check if attempts window expired
    if (now - record.lastFailedAt > this.config.windowMs) {
      record.failedAttempts = 0;
    }

    const remainingAttempts = Math.max(0, this.config.maxAttempts - record.failedAttempts);
    return { locked: false, remainingAttempts };
  }

  /**
   * Record a failed authentication attempt
   * Returns lockout info if threshold exceeded
   */
  recordFailedAttempt(key: string): { locked: boolean; retryAfter?: number; message?: string } {
    // Trusted IPs bypass lockout
    if (this.trustedIPs.has(key)) {
      return { locked: false };
    }

    const now = Date.now();
    let record = this.records.get(key);

    if (!record) {
      record = {
        failedAttempts: 0,
        lastFailedAt: now,
        lockedUntil: null,
        lockoutLevel: 0
      };
      this.records.set(key, record);
    }

    // Reset attempts if window expired
    if (now - record.lastFailedAt > this.config.windowMs) {
      record.failedAttempts = 0;
    }

    // Increment failed attempts
    record.failedAttempts++;
    record.lastFailedAt = now;

    // Check if we should lock out
    if (record.failedAttempts >= this.config.maxAttempts) {
      // Get lockout duration based on level
      const lockoutIndex = Math.min(record.lockoutLevel, this.config.lockoutDurations.length - 1);
      const lockoutDuration = this.config.lockoutDurations[lockoutIndex] ?? 15 * 60 * 1000; // Default 15min
      
      record.lockedUntil = now + lockoutDuration;
      record.lockoutLevel = Math.min(
        record.lockoutLevel + 1,
        this.config.lockoutDurations.length - 1
      );
      record.failedAttempts = 0;

      const retryAfter = Math.ceil(lockoutDuration / 1000);
      const minutes = Math.ceil(lockoutDuration / 60000);

      if (dev) {
        console.log(`[Security] Account locked: ${key} for ${minutes} minutes (level ${record.lockoutLevel})`);
      }

      return {
        locked: true,
        retryAfter,
        message: `Too many failed attempts. Account locked for ${minutes} minutes.`
      };
    }

    const remainingAttempts = this.config.maxAttempts - record.failedAttempts;
    return {
      locked: false,
      message: `${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining`
    };
  }

  /**
   * Record a successful authentication (clears lockout progress)
   */
  recordSuccess(key: string): void {
    const record = this.records.get(key);
    if (record) {
      record.failedAttempts = 0;
      record.lockedUntil = null;
      // Don't reset lockoutLevel - keeps progressive lockout for repeat offenders
    }
  }

  /**
   * Fully reset an account (e.g., after password change)
   */
  resetAccount(key: string): void {
    this.records.delete(key);
  }

  /**
   * Add an IP to trusted list (for admin use)
   */
  addTrustedIP(ip: string): void {
    this.trustedIPs.add(ip);
  }

  /**
   * Remove IP from trusted list
   */
  removeTrustedIP(ip: string): void {
    this.trustedIPs.delete(ip);
  }

  /**
   * Get lockout statistics for monitoring
   */
  getStats(): {
    totalRecords: number;
    lockedAccounts: number;
    recentFailures: number;
  } {
    const now = Date.now();
    let lockedAccounts = 0;
    let recentFailures = 0;

    for (const record of this.records.values()) {
      if (record.lockedUntil && now < record.lockedUntil) {
        lockedAccounts++;
      }
      if (now - record.lastFailedAt < 60000) {
        recentFailures += record.failedAttempts;
      }
    }

    return {
      totalRecords: this.records.size,
      lockedAccounts,
      recentFailures
    };
  }

  /**
   * Clean up old records to prevent memory leak
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, record] of this.records.entries()) {
      // Remove records that are:
      // - Not locked and haven't had activity in 24 hours
      // - Lockout expired more than 24 hours ago
      const isExpired = now - record.lastFailedAt > maxAge;
      const lockoutExpired = record.lockedUntil && now - record.lockedUntil > maxAge;

      if (isExpired && (!record.lockedUntil || lockoutExpired)) {
        this.records.delete(key);
      }
    }

    if (dev && this.records.size > 0) {
      console.log(`[Security] Lockout cleanup: ${this.records.size} records remaining`);
    }
  }

  /**
   * Destroy the service and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.records.clear();
  }
}

// Singleton instances for different contexts
export const accountLockout = new AccountLockoutService();

// Stricter lockout for IP-based blocking
export const ipLockout = new AccountLockoutService({
  maxAttempts: 10,
  lockoutDurations: [
    15 * 60 * 1000,    // 15 minutes
    60 * 60 * 1000,    // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
    24 * 60 * 60 * 1000 // 24 hours
  ]
});

/**
 * Helper to generate composite lockout key
 */
export function getLockoutKey(identifier: string, ip: string): string {
  return `${identifier}:${ip}`;
}

/**
 * Check both account and IP lockout
 */
export function checkLockout(
  identifier: string,
  ip: string
): { locked: boolean; retryAfter?: number; message?: string } {
  // Check account-level lockout
  const accountKey = identifier.toLowerCase();
  const accountStatus = accountLockout.isLockedOut(accountKey);
  if (accountStatus.locked) {
    return {
      locked: true,
      retryAfter: accountStatus.retryAfter,
      message: 'Account temporarily locked due to failed login attempts'
    };
  }

  // Check IP-level lockout
  const ipStatus = ipLockout.isLockedOut(ip);
  if (ipStatus.locked) {
    return {
      locked: true,
      retryAfter: ipStatus.retryAfter,
      message: 'Too many login attempts from this IP address'
    };
  }

  return { locked: false };
}

/**
 * Record failed attempt on both account and IP
 */
export function recordAuthFailure(
  identifier: string,
  ip: string
): { locked: boolean; retryAfter?: number; message?: string } {
  const accountKey = identifier.toLowerCase();
  
  // Record on both
  const accountResult = accountLockout.recordFailedAttempt(accountKey);
  const ipResult = ipLockout.recordFailedAttempt(ip);

  // Return the stricter result
  if (accountResult.locked) {
    return accountResult;
  }
  if (ipResult.locked) {
    return ipResult;
  }

  // Return account result for remaining attempts message
  return accountResult;
}

/**
 * Record successful authentication
 */
export function recordAuthSuccess(identifier: string, ip: string): void {
  const accountKey = identifier.toLowerCase();
  accountLockout.recordSuccess(accountKey);
  ipLockout.recordSuccess(ip);
}
