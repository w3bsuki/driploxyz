import { createServerClient } from '@supabase/ssr';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Create a Supabase client for server-side use with service role key
 * WARNING: This bypasses RLS and should only be used in secure server contexts
 * NEVER import this in client-side code or expose to users
 * Only use for admin operations where RLS bypass is explicitly required
 * 
 * This file uses .server.js naming convention to ensure it's never bundled in client code
 */
export const createServiceClient = () => {
  if (!PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role environment variables not configured');
  }
  
  return createServerClient(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
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
 * Direct service client instance for server-only operations
 * Use this for admin operations that need to bypass RLS
 */
export const supabaseServiceClient = createServiceClient();