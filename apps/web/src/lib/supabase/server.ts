import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a Supabase client for server-side use with service role key
 * This bypasses RLS and should only be used in secure server contexts
 */
export const createServiceClient = () => {
  if (!publicEnv.PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createServerClient(
    publicEnv.PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
};

/**
 * Create a Supabase client for server-side use with anon key
 * This respects RLS policies and should be used for user-facing operations
 */
export const createClient = (event?: RequestEvent) => {
  if (!publicEnv.PUBLIC_SUPABASE_URL || !publicEnv.PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createServerClient(
    publicEnv.PUBLIC_SUPABASE_URL,
    publicEnv.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event?.cookies.get(key),
        set: (key, value, options) => event?.cookies.set(key, value, { path: '/', ...options }),
        remove: (key, options) => event?.cookies.delete(key, { path: '/', ...options }),
      },
    }
  );
};