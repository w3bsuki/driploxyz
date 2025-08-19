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

export const load: LayoutServerLoad = async ({ url, cookies, depends, locals, fetch }) => {
  depends('supabase:auth');
  
  // Use the session from hooks instead of creating new client
  const { session, user } = await locals.safeGetSession();
  const supabase = locals.supabase;
  

  let profile = null;
  
  if (user && supabase) {
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

    // Check if user needs onboarding
    const shouldRedirect =
      profile &&
      profile.onboarding_completed !== true &&
      !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));

    if (shouldRedirect) {
      throw redirect(303, '/onboarding');
    }
  }

  // Get current language
  const language = cookies.get('locale') || 'en';
  
  return {
    session,
    user,
    profile,
    language,
    cookies: cookies.getAll(), // Pass cookies for SSR hydration
  };
};
