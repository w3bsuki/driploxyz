import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Debug flag for controlled logging
const isDebug = dev;

/**
 * Optimized auth guard handler for protecting routes
 * Validates sessions efficiently and handles redirects for protected routes
 */
export async function setupAuthGuard(event: RequestEvent): Promise<void> {
  const pathname = event.url.pathname;
  const routeId = event.route.id;

  // Performance optimization: Skip all auth logic for static assets and public API routes
  const publicRoutes = ['/api/health', '/api/debug', '/api/webhooks'];
  const staticPaths = ['/favicon.ico', '/_app/', '/images/', '/assets/', '/robots.txt', '/sitemap.xml'];
  
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      staticPaths.some(path => pathname.startsWith(path))) {
    // Set null auth context for static/public routes to avoid downstream issues
    event.locals.session = null;
    event.locals.user = null;
    return;
  }

  // Only validate session for routes that actually need it
  const needsAuth = routeId?.startsWith('/(protected)') || routeId?.startsWith('/(admin)');
  const isAuthRoute = routeId?.startsWith('/(auth)');

  // For public routes that don't need auth, optionally validate session but don't block
  if (!needsAuth && !isAuthRoute) {
    // For non-protected routes, try to get session but don't fail if it's slow
    try {
      const { session, user } = await Promise.race([
        event.locals.safeGetSession(),
        new Promise<{ session: null; user: null }>((resolve) => 
          setTimeout(() => resolve({ session: null, user: null }), 2000)
        )
      ]);
      event.locals.session = session;
      event.locals.user = user;
    } catch (error) {
      // If auth fails on public routes, just set to null and continue
      event.locals.session = null;
      event.locals.user = null;
    }
    return;
  }

  // Validate session for routes that need it
  const authStartTime = performance.now();
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Performance monitoring for auth-critical paths
  const authDuration = performance.now() - authStartTime;
  if (authDuration > 500 && isDebug) {
    console.warn(`🐌 Auth validation took ${authDuration.toFixed(2)}ms for ${pathname}`);
  }

  // Redirect unauthenticated users from protected routes
  if (!session && needsAuth) {
    if (isDebug) console.log(`🔒 Redirecting unauthenticated user from ${pathname} to /login`);
    throw redirect(303, '/login');
  }

  // Session health monitoring for authenticated users
  if (session && user && isDebug) {
    const sessionExpiresAt = new Date(session.expires_at || 0).getTime();
    const timeUntilExpiry = sessionExpiresAt - Date.now();
    
    if (timeUntilExpiry <= 0) {
      console.warn('⚠️ Session appears expired but validation passed - potential issue');
    } else if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
      console.log(`⏰ Session expiring soon: ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
    }
  }
}