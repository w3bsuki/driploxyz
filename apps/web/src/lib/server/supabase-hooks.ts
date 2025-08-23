import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { Database } from '@repo/database';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Setup Supabase client with auth handling for hooks
 * Simplified following official Supabase SvelteKit documentation
 */
export async function setupAuth(event: RequestEvent): Promise<void> {
  // Skip during build time
  if (building) {
    return;
  }
  
  // Check for required environment variables
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    throw error(500, 'Server configuration error. Please contact support.');
  }

  // Create Supabase client following official documentation pattern
  event.locals.supabase = createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { 
              ...options, 
              path: '/',
              secure: true,
              sameSite: 'lax',
              httpOnly: true
            });
          });
        },
      },
      global: {
        fetch: event.fetch
      }
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
      error: authError,
    } = await event.locals.supabase.auth.getUser();

    if (authError) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };
}