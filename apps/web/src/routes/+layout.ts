import { isBrowser } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import { createBrowserSupabase, createServerSupabase } from '$lib/auth';
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
  const noop = () => {};
  const noopSerialize = () => '';

  const supabase = isBrowser()
    ? createBrowserSupabase()
    : createServerSupabase(
        {
          get: () => undefined,
          getAll: () => data.cookies || [],
          set: noop,
          delete: noop,
          serialize: noopSerialize
        } as unknown as Cookies,
        fetch
      );

  /**
   * It's safe to use getSession() here because on the client, getSession() is safe,
   * and on the server, it reads session from LayoutData which was safely checked
   * using safeGetSession() in +layout.server.ts
   */
  let session: import('@supabase/supabase-js').Session | null = null;
  let user: import('@supabase/supabase-js').User | null = null;
  
  try {
    const sessionPromise = supabase.auth.getSession();
    const userPromise = supabase.auth.getUser();
    
    // Add timeout to prevent hanging
    const [sessionResult, userResult] = await Promise.allSettled([
      Promise.race([sessionPromise, new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      )]),
      Promise.race([userPromise, new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User timeout')), 3000)
      )])
    ]);
    
    if (sessionResult.status === 'fulfilled') {
      const sessionData = (sessionResult.value as { data: { session: import('@supabase/supabase-js').Session | null } })?.data?.session;
      session = sessionData && typeof sessionData === 'object' && 'access_token' in sessionData ? sessionData : null;
    }
    if (userResult.status === 'fulfilled') {
      const userData = (userResult.value as { data: { user: import('@supabase/supabase-js').User | null } })?.data?.user;
      user = userData && typeof userData === 'object' && 'id' in userData ? userData : null;
    }
  } catch (error) {
    console.error('Error loading user session:', error);
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
    supabase,
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
