import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
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
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw error(500, 'Server configuration error. Please contact support.');
  }

  // Create Supabase client following official documentation pattern
  event.locals.supabase = createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce' // Use PKCE for better security
      },
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
      global: {
        fetch: event.fetch
      }
    }
  );

  /**
   * Safe session validation with JWT validation
   * Unlike `supabase.auth.getSession()`, this validates the JWT to ensure it's still valid.
   */
  event.locals.safeGetSession = async () => {
    const startTime = performance.now();

    try {
      // Get session first (no API call if cached in cookies)
      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession();

      if (!session) {
        return { session: null, user: null };
      }

      // Check if session is obviously expired to avoid unnecessary API call
      const now = Date.now() / 1000;
      if (session.expires_at && session.expires_at < now) {
        return { session: null, user: null };
      }

      // Validate JWT with getUser (this makes the API call)
      const {
        data: { user },
        error: authError,
      } = await event.locals.supabase.auth.getUser();

      if (authError) {
        // JWT validation failed
        return { session: null, user: null };
      }

      // Performance monitoring in development
      if (building === false) {
        const duration = performance.now() - startTime;
        if (duration > 1000) { // Log slow auth calls (>1s)
          console.warn(`🐌 Slow auth validation: ${duration.toFixed(2)}ms for ${event.url.pathname}`);
        }
      }

      return { session, user };
    } catch (error) {
      console.error('Auth session validation error:', error);
      return { session: null, user: null };
    }
  };
}