import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  // Create browser client for client-side operations
  const supabase = createBrowserClient<Database>(
    env.PUBLIC_SUPABASE_URL, 
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
    }
  );

  return {
    supabase,
    session: data?.session || null,
    user: data?.user || null,
  };
};