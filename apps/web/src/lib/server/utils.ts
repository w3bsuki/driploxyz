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