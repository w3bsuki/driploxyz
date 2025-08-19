import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';

// Debug flag for controlled logging - use dev mode as default
const isDebug = dev;

// Try to get Sentry DSN - may not be defined in all environments
let SENTRY_DSN: string | undefined;
try {
  SENTRY_DSN = process.env.SENTRY_DSN;
} catch {
  // Environment variable not available
}

// Only initialize Sentry if DSN is present
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
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
              // Check if this is an auth cookie that requires special handling
              const isAuthCookie = name.includes('sb-') || name.includes('supabase');
              
              // Critical: Set proper cookie configuration for auth to work
              event.cookies.set(name, value, {
                ...options,
                path: '/', // MUST be set for auth to work across routes
                sameSite: isAuthCookie ? 'lax' : (options?.sameSite || 'lax'), // Lax for auth, strict for others
                secure: event.url.protocol === 'https:', // Secure on HTTPS (production)
                httpOnly: isAuthCookie ? false : (options?.httpOnly ?? true), // Auth cookies need client access
                maxAge: options?.maxAge || (60 * 60 * 24 * 7) // 1 week default
                // DO NOT set domain - let browser handle it correctly
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
