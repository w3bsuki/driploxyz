import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '@repo/database';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  /**
   * Declare dependency so layout can be invalidated on auth changes
   */
  depends('supabase:auth');

  /**
   * Create Supabase client following official SSR pattern
   * Uses browser client on client-side, server client with cookie bridging on server-side
   */
  const supabase = isBrowser()
    ? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch }
      })
    : createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          getAll() {
            return data.cookies || [];
          },
          setAll() {
            // Server-side cookie setting is handled by hooks
          }
        }
      });

  /**
   * It's safe to use getSession() here because on the client, getSession() is safe,
   * and on the server, it reads session from LayoutData which was safely checked
   * using safeGetSession() in +layout.server.ts
   */
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    session,
    supabase,
    user,
    profile: data?.profile || null,
    language: data?.language || 'en',
    country: data?.country || 'BG',
    region: data?.region,
    detectedRegion: data?.detectedRegion,
    shouldPromptRegionSwitch: data?.shouldPromptRegionSwitch,
    currency: data?.currency
  };
};
