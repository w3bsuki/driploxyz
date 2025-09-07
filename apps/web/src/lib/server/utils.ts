/**
 * JWT validation utility
 * Validates JWT token structure and expiration
 */
export const validateJWT = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1] || ''));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now; // Check if token hasn't expired
  } catch {
    return false; // Invalid token format
  }
};

/**
 * Mobile detection utility
 * Detects mobile devices based on User-Agent string
 */
export const detectMobile = (userAgent: string): boolean => {
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

/**
 * SSR timeout wrapper for resilient data loading
 * Wraps promises with timeout to prevent hanging in dev/production
 * Falls back to provided fallback value on timeout
 */
export const withTimeout = async <T>(
  promise: Promise<T>, 
  timeoutMs = 3000,
  fallback: T
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn(`withTimeout: Operation failed or timed out, using fallback:`, error);
    return fallback;
  }
};