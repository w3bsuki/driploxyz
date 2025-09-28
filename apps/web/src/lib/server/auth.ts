import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from '@repo/database';

/**
 * Create a Supabase client for server-side operations
 * This ensures consistent auth handling across all server contexts
 */
export function createSupabaseServerClient(cookies: Cookies, fetch?: typeof globalThis.fetch) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public configuration');
  }

  type CookieSetOptions = Parameters<Cookies['set']>[2];
  type CookiePayload = { name: string; value: string; options?: CookieSetOptions };

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },
        setAll(cookiesToSet) {
          (cookiesToSet as CookiePayload[]).forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              ...options,
              path: '/'
            });
          });
        }
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
    // Use getUser() as the primary method for security
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { session: null, user: null };
    }

    // Only get session after user validation for consistency
    const { data: { session } } = await supabase.auth.getSession();

    return { session, user };
  } catch {
    return { session: null, user: null };
  }
}