import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { setAuthState, setProfile, setAuthLoading } from '$lib/stores/auth';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  const supabase = createBrowserClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
    }
  );

  // Set auth state in stores
  setAuthState(data.user, data.session);
  setProfile(data.profile);
  setAuthLoading(false);

  return {
    supabase,
    session: data.session,
    user: data.user,
    profile: data.profile
  };
};