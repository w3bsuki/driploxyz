/**
 * Security Module Index
 * =====================
 * Central export for all security-related utilities
 * 
 * @module security
 */

// Rate Limiting
export {
  rateLimiter,
  RATE_LIMIT_CONFIGS,
  checkRateLimit,
  rateLimitResponse,
  withRateLimit,
  enforceRateLimit
} from './rate-limiter';

// Account Lockout
export {
  accountLockout,
  ipLockout,
  getLockoutKey,
  checkLockout,
  recordAuthFailure,
  recordAuthSuccess
} from './account-lockout';

// Password Security
export {
  checkPasswordBreach,
  isCommonPassword,
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  validatePasswordSecurity,
  isPasswordSafe,
  type PasswordSecurityResult
} from './password-security';
