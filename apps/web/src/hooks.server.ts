import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

const supabase: Handle = async ({ event, resolve }) => {
  // Production logging for debugging
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    console.log('[HOOK_START]', {
      path: event.url.pathname,
      method: event.request.method,
      userAgent: event.request.headers.get('user-agent')?.substring(0, 50),
      hasSupabaseUrl: !!PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!PUBLIC_SUPABASE_ANON_KEY
    });
  }
  
  // CRITICAL: Fail fast with clear error message
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[CRITICAL] Missing Supabase environment variables', {
      url: !!PUBLIC_SUPABASE_URL,
      key: !!PUBLIC_SUPABASE_ANON_KEY
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

export const handle = sequence(supabase, authGuard);