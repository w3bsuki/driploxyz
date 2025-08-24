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
  
  // CRITICAL: Always get fresh session data on each request
  // This ensures auth state is current after login/logout
  const { session, user } = await locals.safeGetSession();
  const supabase = locals.supabase;
  
  // Log auth state for debugging
  console.log('[Layout Load] Auth state:', {
    hasUser: !!user,
    userId: user?.id,
    pathname: url.pathname
  });
  

  let profile = null;
  
  if (user && supabase) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, onboarding_completed, account_type, subscription_tier')
      .eq('id', user.id)
      .single();

    // Ignore profile not found errors (PGRST116)
    if (profileError && profileError.code !== 'PGRST116') {
      // Log and continue without failing the whole request
      console.warn('Profile fetch failed:', profileError.message);
    }

    profile = data;

    // FORCE ONBOARDING CHECK - NO EXCEPTIONS
    // If user exists but has no profile or onboarding not completed -> ONBOARDING
    const needsOnboarding = user && (!profile || profile.onboarding_completed !== true);
    const isProtectedPath = !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));
    
    if (needsOnboarding && isProtectedPath) {
      console.log('[ONBOARDING CHECK] User needs onboarding:', {
        userId: user.id,
        hasProfile: !!profile,
        onboardingCompleted: profile?.onboarding_completed,
        currentPath: url.pathname
      });
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
  
  // Get country from locals (set by server hooks)
  const country = locals.country || 'BG';
  
  return {
    session,
    user,
    profile,
    language, // Always return the determined language
    country, // Pass country for country-based filtering
    cookies: cookies.getAll(), // Pass cookies for SSR hydration
  };
};
