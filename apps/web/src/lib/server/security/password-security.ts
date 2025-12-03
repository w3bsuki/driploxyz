/**
 * Password Security Service
 * =========================
 * Production-grade password security with:
 * - HaveIBeenPwned breach detection (k-anonymity model)
 * - Password strength validation
 * - Common password blocklist
 * 
 * @module security/password-security
 */

import { dev } from '$app/environment';

// Common passwords to reject immediately
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  'qwerty', 'abc123', 'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'michael', 'princess',
  'football', 'shadow', 'superman', 'qazwsx', 'passw0rd', 'qwerty123',
  'driplo', 'driplo123', 'marketplace', 'seller2025'
]);

/**
 * Result of password security check
 */
export interface PasswordSecurityResult {
  isSecure: boolean;
  breachCount: number;
  issues: string[];
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
}

/**
 * Check if password has been exposed in data breaches using HaveIBeenPwned API
 * Uses k-anonymity model - only first 5 chars of SHA-1 hash are sent to API
 * 
 * @param password - The password to check
 * @returns Number of times the password has been found in breaches (0 = safe)
 */
export async function checkPasswordBreach(password: string): Promise<number> {
  try {
    // Hash the password using SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Split hash: first 5 chars (prefix) and rest (suffix)
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    // Query HIBP API with k-anonymity
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'Driplo-Security-Check',
        'Add-Padding': 'true' // Helps prevent timing attacks
      }
    });
    
    if (!response.ok) {
      // If HIBP is down, allow the password but log the issue
      if (dev) {
        console.warn('[Security] HIBP API unavailable:', response.status);
      }
      return 0;
    }
    
    const text = await response.text();
    const lines = text.split('\r\n');
    
    // Search for our hash suffix in the response
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix && count) {
        return parseInt(count, 10);
      }
    }
    
    return 0; // Password not found in breaches
  } catch (error) {
    // Fail open - if we can't check, allow the password
    if (dev) {
      console.error('[Security] HIBP check failed:', error);
    }
    return 0;
  }
}

/**
 * Check password against common password list
 */
export function isCommonPassword(password: string): boolean {
  const normalized = password.toLowerCase().trim();
  return COMMON_PASSWORDS.has(normalized);
}

/**
 * Calculate password strength score
 * @returns Score from 0-100
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 10) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character diversity
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  
  // Penalties
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
  if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/^(123|abc|qwe|password)/i.test(password)) score -= 20; // Common patterns
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine password strength category
 */
export function getPasswordStrengthLevel(score: number): 'weak' | 'fair' | 'strong' | 'very-strong' {
  if (score < 30) return 'weak';
  if (score < 50) return 'fair';
  if (score < 70) return 'strong';
  return 'very-strong';
}

/**
 * Comprehensive password security check
 * Validates password strength AND checks for breaches
 * 
 * @param password - The password to validate
 * @param options - Configuration options
 */
export async function validatePasswordSecurity(
  password: string,
  options: {
    checkBreach?: boolean;
    minLength?: number;
    requireUppercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    maxBreachCount?: number; // Allow passwords with up to N breach occurrences
  } = {}
): Promise<PasswordSecurityResult> {
  const {
    checkBreach = true,
    minLength = 8,
    requireUppercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
    maxBreachCount = 0 // Default: reject any breached password
  } = options;

  const issues: string[] = [];
  let isSecure = true;

  // Length check
  if (password.length < minLength) {
    issues.push(`Password must be at least ${minLength} characters`);
    isSecure = false;
  }

  // Uppercase check
  if (requireUppercase && !/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
    isSecure = false;
  }

  // Numbers check
  if (requireNumbers && !/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
    isSecure = false;
  }

  // Special characters check
  if (requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character');
    isSecure = false;
  }

  // Common password check
  if (isCommonPassword(password)) {
    issues.push('This password is too common. Please choose a more unique password.');
    isSecure = false;
  }

  // Calculate strength
  const strengthScore = calculatePasswordStrength(password);
  const strength = getPasswordStrengthLevel(strengthScore);

  // Breach check (only if other validations pass to save API calls)
  let breachCount = 0;
  if (checkBreach && isSecure) {
    breachCount = await checkPasswordBreach(password);
    if (breachCount > maxBreachCount) {
      issues.push(
        breachCount > 1000000
          ? 'This password has been exposed in major data breaches. Please choose a different password.'
          : `This password has been found in ${breachCount.toLocaleString()} data breaches. Please choose a different password.`
      );
      isSecure = false;
    }
  }

  return {
    isSecure,
    breachCount,
    issues,
    strength
  };
}

/**
 * Quick check for signup/login forms
 * Returns true if password is safe to use
 */
export async function isPasswordSafe(password: string): Promise<{
  safe: boolean;
  reason?: string;
  breachCount?: number;
}> {
  // Quick checks first
  if (password.length < 8) {
    return { safe: false, reason: 'Password too short' };
  }

  if (isCommonPassword(password)) {
    return { safe: false, reason: 'Password is too common' };
  }

  // Check breaches
  const breachCount = await checkPasswordBreach(password);
  if (breachCount > 0) {
    return {
      safe: false,
      reason: 'Password found in data breach',
      breachCount
    };
  }

  return { safe: true };
}
