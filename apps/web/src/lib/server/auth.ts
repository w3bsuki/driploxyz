import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from '$lib/types/database.types';

/**
 * Create a Supabase client for server-side operations
 * This ensures consistent auth handling across all server contexts
 */
export function createSupabaseServerClient(cookies: Cookies, fetch?: typeof globalThis.fetch) {
  return createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              ...options,
              path: '/'
            });
          });
        },
      },
      global: {
        fetch: fetch || globalThis.fetch
      }
    }
  );
}

/**
 * Get session with proper validation
 * Use this in all server-side contexts for consistent auth
 */
export async function getServerSession(cookies: Cookies) {
  const supabase = createSupabaseServerClient(cookies);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { session: null, user: null };
    }
    
    // Validate the session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { session: null, user: null };
    }
    
    return { session, user };
  } catch (err) {
    return { session: null, user: null };
  }
}