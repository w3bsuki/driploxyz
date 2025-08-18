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
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }
      
      profile = data;
      
      // Single consolidated redirect check with comprehensive guards
      const shouldRedirect = 
        profile && 
        profile.onboarding_completed !== true && 
        !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));
      
      if (shouldRedirect) {
        throw redirect(303, '/onboarding');
      }
    } catch (err) {
      if (err instanceof redirect) throw err;
      // Profile errors are handled above
    }
  }

  return {
    session,
    user,
    profile,
    supabase: null, // We'll create browser client in +layout.ts
  };
};