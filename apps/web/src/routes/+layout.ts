import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  // Create browser client for client-side operations with proper cookie handling
  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    { 
      global: { fetch },
      cookies: {
        getAll() {
          // In browser context, we need to provide cookie functions
          // This prevents the SSR error about missing cookie options
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';').map(c => {
              const [name, value] = c.trim().split('=');
              return { name, value };
            });
            return cookies;
          }
          return [];
        },
        setAll(cookies) {
          // In browser context, set cookies
          if (typeof document !== 'undefined') {
            cookies.forEach(({ name, value, options }) => {
              let cookieString = `${name}=${value}`;
              if (options?.path) cookieString += `; path=${options.path}`;
              if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
              if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
              if (options?.secure) cookieString += '; secure';
              document.cookie = cookieString;
            });
          }
        }
      }
    }
  );

  return {
    supabase,
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null,
  };
};
