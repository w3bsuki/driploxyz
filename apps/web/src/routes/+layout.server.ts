import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';
import { COUNTRY_CONFIGS, shouldSuggestCountrySwitch, type CountryCode } from '$lib/country/detection';
import { getCanonicalAndHreflang } from '$lib/seo';
import { getUserProfile, needsOnboardingRedirect } from '$lib/auth/index';

/**
 * Check if user has existing cookie consent
 */
function hasExistingCookieConsent(cookies: Parameters<LayoutServerLoad>[0]['cookies']): boolean {
  try {
    const consentCookie = cookies.get('driplo_consent');
    if (!consentCookie) return false;

    const consent = JSON.parse(decodeURIComponent(consentCookie));

    // Check if consent needs renewal (365 days)
    if (consent.timestamp) {
      const age = Date.now() - consent.timestamp;
      return age <= 365 * 24 * 60 * 60 * 1000;
    }

    // Old consent format without timestamp needs renewal
    return false;
  } catch {
    return false;
  }
}

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
  return getUserProfile(supabase, userId);
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
  // Fallback in case auth setup failed
  const { session, user } = locals.safeGetSession ? await locals.safeGetSession() : { session: null, user: null };
  const supabase = locals.supabase;
  const language = locals.locale || 'bg';
  const country = locals.country || 'BG';
  const countryConfig = COUNTRY_CONFIGS[country];
  const currency = countryConfig.currency;

  // Generate SEO data (synchronous)
  const seoData = getCanonicalAndHreflang(event);

  // Check if cookie consent banner should be shown (server-side for immediate display)
  const shouldShowCookieConsent = !hasExistingCookieConsent(cookies);

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

      // Check if user needs onboarding redirect using consolidated auth logic
      if (needsOnboardingRedirect(user, profile, url.pathname)) {
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
        shouldShowCookieConsent,

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
        shouldShowCookieConsent,

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
    shouldShowCookieConsent,

    // Resolved data (awaited to prevent type issues)
    profile: null,
    detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
    region: country === 'GB' ? 'UK' : 'BG',
    shouldPromptRegionSwitch: false
  };
}) satisfies LayoutServerLoad;
