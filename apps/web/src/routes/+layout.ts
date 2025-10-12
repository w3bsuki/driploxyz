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
   * Use secure authentication pattern: getUser() first for security
   * On the client, getUser() validates the JWT with Supabase servers
   * On the server, this data is safely validated by +layout.server.ts
   */
  let session: import('@supabase/supabase-js').Session | null = null;
  let user: import('@supabase/supabase-js').User | null = null;

  try {
    // Use secure authentication: getUser() first
    const userPromise = Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('User timeout')), 3000))
    ]);

    const userResult = await userPromise;

    if (userResult.data?.user && typeof userResult.data.user === 'object' && 'id' in userResult.data.user) {
      user = userResult.data.user;

      // User is valid, now get session efficiently
      const sessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 3000))
      ]);

      const sessionResult = await sessionPromise;
      const sessionData = sessionResult.data?.session;
      session = sessionData && typeof sessionData === 'object' && 'access_token' in sessionData ? sessionData : null;
    }
  } catch (error) {
    console.error('Error loading user session:', error);
    // Clear both user and session on any error for security
    user = null;
    session = null;
  }

  // Try to load top-level categories for sticky search/pills
  let mainCategories: Array<{ id: string; name: string; slug: string; level?: number; parent_id?: string | null; sort_order?: number }> = [];
  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id,name,slug,level,parent_id,sort_order')
      .eq('level', 1)
      .order('sort_order', { ascending: true });
    if (catData) mainCategories = catData as Array<{ id: string; name: string; slug: string; level?: number; parent_id?: string | null; sort_order?: number }>;
  } catch {
    // Non-fatal: keep empty mainCategories
  }

  return {
    session,
    user,
    profile: data?.profile || null,
    language: data?.language || 'en',
    country: data?.country || 'BG',
    region: data?.region,
    detectedRegion: data?.detectedRegion,
    shouldPromptRegionSwitch: data?.shouldPromptRegionSwitch,
    currency: data?.currency,
    mainCategories
  };
};
