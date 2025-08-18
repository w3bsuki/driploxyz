import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  // Create browser client for client-side operations
  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        getAll() {
          if (!browser) return [];
          return document.cookie
            .split(';')
            .map(c => c.trim())
            .filter(c => c.length > 0)
            .map(c => {
              const [name, ...rest] = c.split('=');
              return { name, value: rest.join('=') };
            });
        },
        setAll(cookiesToSet) {
          if (!browser) return;
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`;
            if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
            if (options?.path) cookieString += `; Path=${options.path}`;
            if (options?.domain) cookieString += `; Domain=${options.domain}`;
            if (options?.secure) cookieString += '; Secure';
            if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
            document.cookie = cookieString;
          });
        },
      },
    }
  );

  return {
    supabase,
    session: data?.session || null,
    user: data?.user || null,
  };
};