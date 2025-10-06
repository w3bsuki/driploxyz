import { createServerClient } from '@supabase/ssr';
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
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://koowfhsaqmarfdkwsfiz.supabase.co';
  const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTczNDAsImV4cCI6MjA3MTA5MzM0MH0.-lbQpF21xixgkdFtjx8Slqbe0go9h5ojN8GCGYDBDHo';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: (key) => event?.cookies.get(key),
        set: (key, value, options) => event?.cookies.set(key, value, { path: '/', ...options }),
        remove: (key, options) => event?.cookies.delete(key, { path: '/', ...options }),
      },
    }
  );
};
