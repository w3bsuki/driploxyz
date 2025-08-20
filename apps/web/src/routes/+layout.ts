import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { LayoutLoad } from './$types';
import type { Database } from '@repo/database';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  // Create the appropriate client based on the environment
  const supabase = isBrowser()
    ? createBrowserClient<Database>(
        env.PUBLIC_SUPABASE_URL,
        env.PUBLIC_SUPABASE_ANON_KEY,
        {
          global: { fetch }
        }
      )
    : createServerClient<Database>(
        env.PUBLIC_SUPABASE_URL,
        env.PUBLIC_SUPABASE_ANON_KEY,
        {
          global: { fetch },
          cookies: {
            getAll() {
              return data.cookies;
            }
          }
        }
      );

  // Session is already set by SSR, no need to manually set it
  // This was causing auth issues on Vercel

  return {
    supabase,
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null,
    language: data?.language || 'en', // Pass through the language from server
  };
};
