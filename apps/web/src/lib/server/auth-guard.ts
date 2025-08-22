import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Debug flag for controlled logging
const isDebug = dev;

/**
 * Auth guard handler for protecting routes
 * Validates sessions and handles redirects for protected routes
 */
export async function setupAuthGuard(event: RequestEvent): Promise<void> {
  // CRITICAL AUTH PATTERN: This MUST stay exactly as is
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Performance optimization: Skip auth checks for static assets and public routes
  const pathname = event.url.pathname;
  const publicRoutes = ['/api/health', '/api/debug', '/api/webhooks'];
  const staticPaths = ['/favicon.ico', '/_app/', '/images/', '/assets/'];
  
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      staticPaths.some(path => pathname.startsWith(path))) {
    return;
  }

  // Only protect explicitly protected routes - preserving existing logic
  if (!session && event.route.id?.startsWith('/(protected)')) {
    if (isDebug) console.log(`🔒 Redirecting unauthenticated user from ${pathname} to /login`);
    throw redirect(303, '/login');
  }

  // Performance: Add session context for downstream handlers
  if (session && user) {
    // Add performance metadata for monitoring
    const sessionExpiresAt = new Date(session.expires_at || 0).getTime();
    const timeUntilExpiry = sessionExpiresAt - Date.now();
    if (isDebug && timeUntilExpiry > 0) {
      console.log(`⏱️ Session expires in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
    }
  }

  // Let individual page load functions handle their own redirect logic
  // to avoid conflicts and redirect loops
}