import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const REDIRECT_PATHS_TO_SKIP = [
  '/onboarding',
  '/api',
  '/login', 
  '/signup',
  '/logout',
  '/auth'
];

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
  const { session, user } = await safeGetSession();

  // Production debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('[LAYOUT_LOAD]', {
      path: url.pathname,
      hasSession: !!session,
      userId: user?.id?.substring(0, 8)
    });
  }

  let profile = null;
  
  if (user && supabase) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[PROFILE_FETCH_ERROR]', profileError);
      }
      
      profile = data;
      
      // Single consolidated redirect check with comprehensive guards
      const shouldRedirect = 
        profile && 
        profile.onboarding_completed !== true && 
        !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));
      
      if (shouldRedirect) {
        console.log('[REDIRECT] Sending to onboarding');
        throw redirect(303, '/onboarding');
      }
    } catch (err) {
      if (err instanceof redirect) throw err;
      console.error('[PROFILE_ERROR]', err);
    }
  }

  return {
    session,
    user,
    profile,
    supabase: null, // We'll create browser client in +layout.ts
  };
};