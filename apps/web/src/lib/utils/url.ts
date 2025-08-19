/**
 * Get the site URL for redirects and callbacks
 * Handles Vercel preview deployments automatically
 */
export function getSiteURL(): string {
  // In production, use the configured site URL
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL;
  }
  
  // Auto-detect Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Auto-detect Vercel branch URL (preview deployments)
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  
  // Fallback to localhost for development
  return process.env.PUBLIC_APP_URL || 'http://localhost:5173';
}

/**
 * Get the redirect URL for auth callbacks
 * @param path - The path to redirect to after auth
 */
export function getAuthRedirectURL(path: string = '/'): string {
  const baseURL = getSiteURL();
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
}