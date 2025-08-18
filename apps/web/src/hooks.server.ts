import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

// Initialize Sentry
Sentry.init({
  dsn: '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

const supabase: Handle = async ({ event, resolve }) => {
  // Production logging for debugging
  const isProd = process.env.NODE_ENV === 'production';
  const userAgent = event.request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  
  if (isProd) {
    console.log('[HOOK_START]', {
      path: event.url.pathname,
      method: event.request.method,
      userAgent: userAgent.substring(0, 100),
      isMobile,
      hasSupabaseUrl: !!PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!PUBLIC_SUPABASE_ANON_KEY,
      cookieCount: event.cookies.getAll().length
    });
  }
  
  // CRITICAL: Fail fast with clear error message
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[CRITICAL] Missing Supabase environment variables', {
      url: !!PUBLIC_SUPABASE_URL,
      key: !!PUBLIC_SUPABASE_ANON_KEY,
      isMobile,
      userAgent: userAgent.substring(0, 50)
    });
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
              // Mobile Safari fix: less restrictive cookie settings
              event.cookies.set(name, value, { 
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: event.url.protocol === 'https:',
                // Remove httpOnly for auth cookies to prevent mobile issues
                httpOnly: options?.httpOnly !== false
              });
            });
          },
        },
      }
    );
  } catch (err) {
    console.error('[SUPABASE_INIT_ERROR]', {
      error: err,
      isMobile,
      userAgent: userAgent.substring(0, 50),
      path: event.url.pathname
    });
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
        if (isProd) console.log('[AUTH] JWT validation failed');
        return { session: null, user: null };
      }

      return { session, user };
    } catch (err) {
      console.error('[AUTH_ERROR]', err);
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
  try {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;

    // Skip auth checks for public and API routes
    const publicRoutes = ['/api/health', '/api/debug'];
    if (publicRoutes.some(route => event.url.pathname.startsWith(route))) {
      return resolve(event);
    }

    // Protect routes that require authentication
    if (!session && event.route.id?.startsWith('/(protected)')) {
      throw redirect(303, '/login');
    }

    // Redirect authenticated users away from auth pages
    if (session && event.route.id?.startsWith('/(auth)')) {
      throw redirect(303, '/');
    }
  } catch (err) {
    if (err instanceof redirect) throw err;
    console.error('[AUTH_GUARD_ERROR]', err);
  }

  return resolve(event);
};

export const handle = sequence(sentryHandle(), supabase, authGuard);

// Sentry error handler
export const handleError: HandleServerError = handleErrorWithSentry();