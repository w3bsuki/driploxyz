import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import { authLogger } from '$lib/utils/log';

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
  const staticPaths = [
    '/favicon.ico', '/_app/', '/images/', '/assets/', '/robots.txt', '/sitemap.xml',
    '/.well-known/', '/manifest.json', '/sw.js', '/workbox-', '/icon-', '/apple-touch-icon'
  ];
  const staticExtensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2'];
  
  // Quick static content detection
  const isStaticContent = publicRoutes.some(route => pathname.startsWith(route)) || 
                         staticPaths.some(path => pathname.startsWith(path)) ||
                         staticExtensions.some(ext => pathname.endsWith(ext));
  
  if (isStaticContent) {
    // Set null auth context for static/public routes to avoid downstream issues
    event.locals.session = null;
    event.locals.user = null;
    return;
  }

  // Only validate session for routes that actually need it
  const needsAuth = routeId?.startsWith('/(protected)') || routeId?.startsWith('/(admin)');
  const isAuthRoute = routeId?.startsWith('/(auth)');

  // For public routes that don't need auth, skip session validation to avoid recursion
  if (!needsAuth && !isAuthRoute) {
    // Set null auth context for public routes - session will be handled by layout if needed
    event.locals.session = null;
    event.locals.user = null;
    return;
  }

  // For auth routes (login, signup, etc), allow session validation in their own load functions
  if (isAuthRoute) {
    // Don't validate session here to avoid recursion - let the auth layout handle it
    return;
  }

  // For routes that need auth, check if session cache exists to avoid recursion
  const locals = event.locals as any;
  if (locals.__sessionCache !== undefined) {
    // Session already validated, use cached values
    event.locals.session = locals.__sessionCache.session;
    event.locals.user = locals.__sessionCache.user;
    return;
  }

  // Validate session for routes that need it (only if not already cached)
  const authStartTime = performance.now();
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Performance monitoring for auth-critical paths
  const authDuration = performance.now() - authStartTime;
  if (authDuration > 500 && isDebug) {
    authLogger.warn('Slow auth validation', { 
      pathname, 
      duration: parseFloat(authDuration.toFixed(2))
    });
  }

  // Redirect unauthenticated users from protected routes
  if (!session && needsAuth) {
    if (isDebug) authLogger.info('Redirecting unauthenticated user to login', {
      from: pathname,
      to: '/login'
    });

    try {
      redirect(303, '/login');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      authLogger.error('Critical auth redirect error', {
        pathname,
        error: error instanceof Error ? error.message : String(error)
      });
      // In auth guard context, we can't return an error response, so re-throw
      throw new Error('Authentication system error');
    }
  }

  // Session health monitoring for authenticated users
  if (session && user && isDebug) {
    const sessionExpiresAt = new Date(session.expires_at || 0).getTime();
    const timeUntilExpiry = sessionExpiresAt - Date.now();
    
    if (timeUntilExpiry <= 0) {
      authLogger.warn('Session appears expired but validation passed - potential issue', {
        sessionId: session.access_token?.substring(0, 8),
        expiresAt: session.expires_at
      });
    } else if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
      authLogger.info('Session expiring soon', {
        minutesUntilExpiry: Math.floor(timeUntilExpiry / 1000 / 60),
        sessionId: session.access_token?.substring(0, 8)
      });
    }
  }
}