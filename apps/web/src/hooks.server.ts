import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
// import { authLimiter, apiLimiter } from '$lib/server/rate-limiter';
// import { CSRFProtection } from '$lib/server/csrf';

// Debug flag for controlled logging - use dev mode as default
const isDebug = dev;

// Try to get Sentry DSN - optional in some environments
let SENTRY_DSN: string | undefined;
try {
  // Use static import instead of dynamic import at top level
  SENTRY_DSN = process.env.SENTRY_DSN;
} catch {
  // DSN not available - Sentry won't be initialized
}

// Only initialize Sentry if DSN is present
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: dev ? 'development' : 'production',
    tracesSampleRate: dev ? 1.0 : 0.1,
    debug: dev,
    integrations: [
      // Basic integrations - avoid deprecated ones that might not be available
    ],
    beforeSend(event) {
      // Don't send errors in development
      if (dev) return null;
      
      // Filter sensitive data
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('password') || error?.value?.includes('token')) {
          return null; // Don't send sensitive auth errors
        }
      }
      
      return event;
    }
  });
}

const supabase: Handle = async ({ event, resolve }) => {
  // Mobile detection for cookie compatibility
  const userAgent = event.request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  
  // CRITICAL: Fail fast with clear error message
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw error(500, 'Server configuration error. Please contact support.');
  }

  try {
    event.locals.supabase = createServerClient<Database>(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return event.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Use Supabase's cookie options as-is
              event.cookies.set(name, value, {
                ...options,
                path: '/'
              });
            });
          },
        },
        global: {
          fetch: event.fetch // Critical for Vercel deployment
        }
      }
    );
  } catch (err) {
    throw error(500, 'Failed to initialize authentication');
  }

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    try {
      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession();

      if (!session) {
        return { session: null, user: null };
      }

      const {
        data: { user },
        error,
      } = await event.locals.supabase.auth.getUser();

      if (error || !user) {
        return { session: null, user: null };
      }

      return { session, user };
    } catch (err) {
      return { session: null, user: null };
    }
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

// Temporarily disabled due to rate limiter syntax issues
// const rateLimiter: Handle = async ({ event, resolve }) => {
//   // Apply rate limiting to auth endpoints
//   if (event.url.pathname.includes('/login') || event.url.pathname.includes('/signup')) {
//     const status = await authLimiter.check(event);
//     if (status.limited) {
//       const retryAfter = Math.round(status.retryAfter / 1000);
//       throw error(429, `Too many attempts. Please try again in ${retryAfter} seconds.`);
//     }
//   }
  
//   // Apply rate limiting to API endpoints
//   if (event.url.pathname.startsWith('/api/')) {
//     const status = await apiLimiter.check(event);
//     if (status.limited) {
//       const retryAfter = Math.round(status.retryAfter / 1000);
//       throw error(429, `Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
//     }
//   }
  
//   return resolve(event);
// };

// Temporarily disabled
// const csrfProtection: Handle = async ({ event, resolve }) => {
//   // Skip CSRF for GET requests and public APIs
//   if (event.request.method === 'GET' || 
//       event.url.pathname.startsWith('/api/webhook') ||
//       event.url.pathname.startsWith('/api/health')) {
//     return resolve(event);
//   }
  
//   // Check CSRF token for state-changing requests
//   if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
//     // SuperForms handles CSRF for forms, but we add extra layer for APIs
//     if (event.url.pathname.startsWith('/api/')) {
//       const isValid = await CSRFProtection.check(event);
//       if (!isValid && !dev) {
//         throw error(403, 'Invalid CSRF token');
//       }
//     }
//   }
  
//   // Add CSRF token to locals for forms
//   event.locals.csrfToken = await CSRFProtection.getToken(event);
  
//   return resolve(event);
// };

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Skip auth checks for public and API routes
  const publicRoutes = ['/api/health', '/api/debug'];
  if (publicRoutes.some(route => event.url.pathname.startsWith(route))) {
    return resolve(event);
  }

  // Only protect explicitly protected routes
  if (!session && event.route.id?.startsWith('/(protected)')) {
    throw redirect(303, '/login');
  }

  // Let individual page load functions handle their own redirect logic
  // to avoid conflicts and redirect loops
  return resolve(event);
};

export const handle = SENTRY_DSN ? sequence(sentryHandle(), supabase, authGuard) : sequence(supabase, authGuard);

// Sentry error handler (only if DSN configured)
export const handleError: HandleServerError = SENTRY_DSN ? handleErrorWithSentry() : (async ({ error, event }) => {
  // Log errors in development only
  if (dev) {
    console.error('[SERVER_ERROR]', error);
  }
  return {
    message: error instanceof Error && error.message.includes('Supabase') 
      ? 'Authentication service error. Please try again.' 
      : 'Internal Server Error'
  };
});
