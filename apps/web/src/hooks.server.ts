import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { Database } from '$lib/types/database.types';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

// Initialize Sentry
Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,
  environment: privateEnv.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

const supabase: Handle = async ({ event, resolve }) => {
  // Production logging for debugging
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    console.log('[HOOK_START]', {
      path: event.url.pathname,
      method: event.request.method,
      userAgent: event.request.headers.get('user-agent')?.substring(0, 50),
      hasSupabaseUrl: !!env.PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!env.PUBLIC_SUPABASE_ANON_KEY
    });
  }
  
  // CRITICAL: Fail fast with clear error message
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[CRITICAL] Missing Supabase environment variables', {
      url: !!env.PUBLIC_SUPABASE_URL,
      key: !!env.PUBLIC_SUPABASE_ANON_KEY
    });
    throw error(500, 'Server configuration error. Please contact support.');
  }

  try {
    event.locals.supabase = createServerClient<Database>(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return event.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Mobile Safari fix: explicit cookie attributes
              event.cookies.set(name, value, { 
                ...options, 
                path: '/',
                sameSite: 'lax',
                secure: event.url.protocol === 'https:',
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
              });
            });
          },
        },
      }
    );
  } catch (err) {
    console.error('[SUPABASE_INIT_ERROR]', err);
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