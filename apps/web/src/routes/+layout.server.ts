import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getServerSession, createSupabaseServerClient } from '$lib/server/auth';

const REDIRECT_PATHS_TO_SKIP = [
  '/onboarding',
  '/api',
  '/login', 
  '/signup',
  '/logout',
  '/auth'
];

export const load: LayoutServerLoad = async ({ url, cookies }) => {
  // Always create fresh Supabase client and get session
  const { session, user } = await getServerSession(cookies);
  const supabase = createSupabaseServerClient(cookies);

  let profile = null;
  
  if (user && supabase) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Ignore profile not found errors (PGRST116)
      if (profileError && profileError.code !== 'PGRST116') {
        // Log and continue without failing the whole request
        console.warn('Profile fetch failed:', profileError.message);
      }

      profile = data;
    } catch (err) {
      // Non-fatal: continue without profile if fetch fails
      console.warn('Profile fetch threw:', err);
    }

    // Perform redirect decision outside try/catch to avoid swallowing it
    const shouldRedirect =
      profile &&
      profile.onboarding_completed !== true &&
      !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));

    if (shouldRedirect) {
      throw redirect(303, '/onboarding');
    }
  }

  return {
    session,
    user,
    profile,
    cookies: cookies.getAll(), // Pass cookies for SSR hydration
  };
};
