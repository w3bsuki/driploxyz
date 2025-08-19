import { createServerClient } from '@supabase/ssr';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { env } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';

// Service role client moved to separate .server.js file for security
// This ensures it's never bundled in client code
// Import from '$lib/server/supabase.server.js' instead

/**
 * Create a Supabase client for server-side use with anon key
 * This respects RLS policies and should be used for user-facing operations
 */
export const createServerSupabaseClient = (event?: RequestEvent) => {
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createServerClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event?.cookies.get(key),
        set: (key, value, options) => event?.cookies.set(key, value, { path: '/', ...options }),
        remove: (key, options) => event?.cookies.delete(key, { path: '/', ...options }),
      },
    }
  );
};