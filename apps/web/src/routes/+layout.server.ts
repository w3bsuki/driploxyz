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
  depends('app:homepage');
  depends('app:products');
  depends('app:categories');
  depends('app:profiles');
  
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

  // CRITICAL FIX: Always get language from cookie FIRST, then locals
  // This ensures language persists through auth invalidations
  const cookieLocale = cookies.get('locale');
  const language = cookieLocale || locals.locale || 'en';
  
  console.log('🌍 Layout Server: Cookie locale =', cookieLocale, ', locals.locale =', locals.locale, ', final =', language);
  
  // Ensure we're always returning a valid language
  if (!['en', 'bg', 'ru', 'ua'].includes(language)) {
    console.warn('🌍 Layout Server: Invalid language detected, falling back to English:', language);
  }
  
  return {
    session,
    user,
    profile,
    language, // Always return the determined language
    cookies: cookies.getAll(), // Pass cookies for SSR hydration
  };
};
