import { createServerClient } from '@supabase/ssr';
import { env as publicEnv } from '$env/dynamic/public';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { Database } from '@repo/database';
import type { RequestEvent } from '@sveltejs/kit';
import { authLogger } from '$lib/utils/log';

/**
 * Setup Supabase client with auth handling for hooks
 * Simplified following official Supabase SvelteKit documentation
 */
export async function setupAuth(event: RequestEvent): Promise<void> {
  // Skip during build time
  if (building) {
    return;
  }
  
  // Check for required configuration
  const PUBLIC_SUPABASE_URL = publicEnv.PUBLIC_SUPABASE_URL;
  const PUBLIC_SUPABASE_ANON_KEY = publicEnv.PUBLIC_SUPABASE_ANON_KEY;

  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw error(500, 'Server configuration error. Please contact support.');
  }

  // Create Supabase client
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
   * Safe session getter with per-request caching and proper validation order
   * Following Supabase best practices: getSession() first, then validate if needed
   */
  event.locals.safeGetSession = async () => {
    // Check if we already cached the result for this request
    if ((event.locals as any).__sessionCache !== undefined) {
      return (event.locals as any).__sessionCache;
    }

    let result: { session: any; user: any } = { session: null, user: null };

    try {
      // Step 1: Get session from cookies/storage (cheap operation)
      const { data: { session }, error: sessionError } = await event.locals.supabase.auth.getSession();
      
      if (sessionError || !session) {
        // No session or session error - cache and return null result
        (event.locals as any).__sessionCache = result;
        return result;
      }

      // Step 2: Validate JWT by calling getUser() (expensive network call)
      const { data: { user }, error: userError } = await event.locals.supabase.auth.getUser();
      
      if (userError || !user) {
        // JWT validation failed - session is invalid
        (event.locals as any).__sessionCache = result;
        return result;
      }

      // Success - we have a valid session and user
      result = { session, user };
      
    } catch (error) {
      // Any unexpected error should result in no session
      authLogger.warn('Session validation error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      result = { session: null, user: null };
    }

    // Cache result for this request to avoid duplicate expensive calls
    (event.locals as any).__sessionCache = result;
    return result;
  };
}
