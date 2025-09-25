import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';
import { COUNTRY_CONFIGS, shouldSuggestCountrySwitch, type CountryCode } from '$lib/country/detection';
import { getCanonicalAndHreflang } from '$lib/seo';

const REDIRECT_PATHS_TO_SKIP = [
  '/onboarding',
  '/api',
  '/login',
  '/signup',
  '/logout',
  '/auth'
];

/**
 * Stream profile data - non-blocking promise for better performance
 */
async function streamProfileData(supabase: App.Locals['supabase'], userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, onboarding_completed, account_type, subscription_tier, region')
      .eq('id', userId)
      .single();

    // Ignore profile not found errors (PGRST116)
    if (error && error.code !== 'PGRST116') {
      if (dev) {
        console.warn('Profile fetch failed:', error);
      }
      return null;
    }

    return data;
  } catch (err) {
    if (dev) {
      console.warn('Profile streaming error:', err);
    }
    return null;
  }
}

/**
 * Stream region detection data - non-blocking for performance
 */
async function streamRegionData(event: Parameters<LayoutServerLoad>[0], currentCountry: string) {
  try {
    const { detectCountryFromIP } = await import('$lib/country/detection');
    return detectCountryFromIP(event);
  } catch (err) {
    if (dev) {
      console.warn('Region detection failed:', err);
    }
    return currentCountry;
  }
}

export const load = (async (event) => {
  const { url, cookies, depends, locals } = event;

  // Granular dependency tracking for better invalidation
  depends('supabase:auth');     // Auth state changes
  depends('app:profile');       // Profile data changes
  depends('app:preferences');   // User preferences changes

  // CRITICAL DATA - Load immediately and block page render
  const { session, user } = await locals.safeGetSession();
  const supabase = locals.supabase;
  const language = locals.locale || 'bg';
  const country = locals.country || 'BG';
  const countryConfig = COUNTRY_CONFIGS[country];
  const currency = countryConfig.currency;

  // Generate SEO data (synchronous)
  const seoData = getCanonicalAndHreflang(event);

  // STREAMED DATA - Non-blocking promises for better performance
  const profilePromise = user && supabase
    ? streamProfileData(supabase, user.id)
    : Promise.resolve(null);

  const regionPromise = streamRegionData(event, country);

  // SMART STREAMING - Only await profile for protected paths that need onboarding check
  if (user) {
    const isProtectedPath = !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));

    if (isProtectedPath) {
      // For protected paths, we need profile immediately for onboarding redirect
      // But we can still parallelize region detection
      const [profile, detectedCountry] = await Promise.all([
        profilePromise,
        regionPromise
      ]);

      const needsOnboarding = user && (!profile || profile.onboarding_completed !== true);
      if (needsOnboarding) {
        redirect(303, '/onboarding');
      }

      // Return with loaded data for protected paths
      return {
        // Critical data (loaded immediately)
        session,
        user,
        language,
        country,
        currency,
        seo: seoData,
        cookies: cookies.getAll(),

        // Loaded data for protected paths
        profile,
        detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
        region: profile?.region || (country === 'GB' ? 'UK' : 'BG'),
        shouldPromptRegionSwitch:
          !cookies.get('region_prompt_dismissed') &&
          !profile?.region &&
          shouldSuggestCountrySwitch(country as CountryCode, detectedCountry as CountryCode)
      };
    } else {
      // For non-protected paths (auth, api, etc), await region data to prevent Promise issues
      const [profile, detectedCountry] = await Promise.all([
        profilePromise,
        regionPromise
      ]);

      return {
        // Critical data (loaded immediately)
        session,
        user,
        language,
        country,
        currency,
        seo: seoData,
        cookies: cookies.getAll(),

        // Resolved data (awaited to prevent type issues)
        profile,
        detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
        region: profile?.region || (country === 'GB' ? 'UK' : 'BG'),
        shouldPromptRegionSwitch:
          !cookies.get('region_prompt_dismissed') &&
          !profile?.region &&
          shouldSuggestCountrySwitch(country as CountryCode, detectedCountry as CountryCode)
      };
    }
  }

  // No user - return minimal data with resolved region detection
  const detectedCountry = await regionPromise;

  return {
    // Critical data
    session,
    user,
    language,
    country,
    currency,
    seo: seoData,
    cookies: cookies.getAll(),

    // Resolved data (awaited to prevent type issues)
    profile: null,
    detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
    region: country === 'GB' ? 'UK' : 'BG',
    shouldPromptRegionSwitch: false
  };
}) satisfies LayoutServerLoad;
