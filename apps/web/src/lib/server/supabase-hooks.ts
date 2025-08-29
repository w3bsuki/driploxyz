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
   * Safe session getter - validates JWT to prevent tampering
   * CRITICAL: Always call getUser() first on server to validate JWT signature
   */
  event.locals.safeGetSession = async () => {
    // First validate the JWT by calling getUser (makes request to Auth server)
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    
    if (error || !user) {
      return { session: null, user: null };
    }
    
    // Only get session after JWT validation passes
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    
    return { session, user };
  };
}