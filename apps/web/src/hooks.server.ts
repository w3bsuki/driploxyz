import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';
import type { Database } from '$lib/types/database.types';

const supabase: Handle = async ({ event, resolve }) => {
  // Fallback for missing environment variables
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured');
    event.locals.supabase = null as any;
    event.locals.safeGetSession = async () => ({ session: null, user: null });
    return resolve(event);
  }

  event.locals.supabase = createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return event.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, { ...options, path: '/' })
          );
        },
      },
    }
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
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

    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
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

  // Protect routes that require authentication
  if (!session && event.route.id?.startsWith('/(protected)')) {
    throw redirect(303, '/login');
  }

  // Redirect authenticated users away from auth pages
  if (session && event.route.id?.startsWith('/(auth)')) {
    throw redirect(303, '/');
  }

  return resolve(event);
};

export const handle = sequence(supabase, authGuard);