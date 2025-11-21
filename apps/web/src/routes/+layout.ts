import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { Database } from '@repo/database';
import type { LayoutLoad } from './$types';

/**
 * Layout load - creates Supabase client for browser and SSR
 * Follows official Supabase SSR pattern for SvelteKit
 */
export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  depends('supabase:auth');

  const supabase = isBrowser()
    ? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch }
      })
    : createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          getAll() {
            return data.cookies;
          }
        }
      });

  // SECURITY: Always validate the user via getUser() (contacts Auth server)
  const { data: { user } } = await supabase.auth.getUser();

  // Retrieve session (may be null). Do not trust session.user; use `user` above.
  const { data: { session } } = await supabase.auth.getSession();

  return {
    ...data,
    supabase,
    session,
    user
  };
};
