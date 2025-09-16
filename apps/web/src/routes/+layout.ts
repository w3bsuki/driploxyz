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
  let session = null;
  let user = null;
  
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
      session = sessionResult.value.data.session;
    }
    if (userResult.status === 'fulfilled') {
      user = userResult.value.data.user;
    }
  } catch (error) {
    console.error('Auth timeout in layout:', error);
  }

  // Try to load top-level categories for sticky search/pills
  let mainCategories: Array<{ id: string; name: string; slug: string; level?: number; parent_id?: string | null; sort_order?: number }> = [];
  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id,name,slug,level,parent_id,sort_order')
      .eq('level', 1)
      .order('sort_order', { ascending: true });
    if (catData) mainCategories = catData as any;
  } catch (e) {
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
