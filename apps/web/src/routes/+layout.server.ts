import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';
import {
  COUNTRY_CONFIGS,
  shouldSuggestCountrySwitch,
  type CountryCode,
  getLocaleForCountry
} from '$lib/country/constants';
import { getCanonicalAndHreflang } from '$lib/seo';
import { getUserProfile, needsOnboardingRedirect } from '$lib/auth/index';
import { COOKIES } from '$lib/cookies/constants';

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
    const preDetected = (event.locals as { detectedCountry?: CountryCode }).detectedCountry;
    if (preDetected) {
      return preDetected;
    }
    const { detectCountryFromIP } = await import('$lib/server/country/detection.server');
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
  // Use the Supabase client from hooks - already configured with proper SSR cookie handling
  const { session, user } = await locals.safeGetSession();
  const supabase = locals.supabase;
  const language = locals.locale || 'bg';
  const country = (locals.country || 'BG') as CountryCode;
  const countryConfig = COUNTRY_CONFIGS[country];
  const currency = countryConfig.currency;
  const defaultDetectedCountry = ((locals as { detectedCountry?: CountryCode }).detectedCountry || country) as CountryCode;
  const defaultSuggestedLocale = (locals as { suggestedLocale?: string }).suggestedLocale || getLocaleForCountry(defaultDetectedCountry as CountryCode);
  const localeBannerDismissed = cookies.get(COOKIES.LOCALE_PROMPT_DISMISSED) === 'true';

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

  const resolvedDetectedCountry = (detectedCountry as CountryCode | null) || defaultDetectedCountry;
  const suggestedLocale = getLocaleForCountry(resolvedDetectedCountry as CountryCode) || defaultSuggestedLocale;
      const shouldShowLocaleBanner = !localeBannerDismissed && suggestedLocale !== language;

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
  detectedCountry: (profile?.country_code as CountryCode | undefined) || country,
        suggestedLocale,
        shouldShowLocaleBanner,

        // Loaded data for protected paths
        profile,
        detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
  region: profile?.region || ((profile?.country_code as CountryCode | undefined) === 'GB' ? 'UK' : (resolvedDetectedCountry as CountryCode === 'GB' ? 'UK' : 'BG')),
        shouldPromptRegionSwitch:
          !cookies.get('region_prompt_dismissed') &&
          !profile?.region &&
          shouldSuggestCountrySwitch(country as CountryCode, resolvedDetectedCountry as CountryCode)
      };
    } else {
      // For non-protected paths (auth, api, etc), await region data to prevent Promise issues
      const [profile, detectedCountry] = await Promise.all([
        profilePromise,
        regionPromise
      ]);

  const resolvedDetectedCountry = (detectedCountry as CountryCode | null) || defaultDetectedCountry;
  const suggestedLocale = getLocaleForCountry(resolvedDetectedCountry as CountryCode) || defaultSuggestedLocale;
      const shouldShowLocaleBanner = !localeBannerDismissed && suggestedLocale !== language;

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
        detectedCountry: resolvedDetectedCountry,
        suggestedLocale,
        shouldShowLocaleBanner,

        // Resolved data (awaited to prevent type issues)
        profile,
        detectedRegion: detectedCountry === 'GB' ? 'UK' : 'BG',
  region: profile?.region || ((profile?.country_code as CountryCode | undefined) === 'GB' ? 'UK' : (resolvedDetectedCountry as CountryCode === 'GB' ? 'UK' : 'BG')),
        shouldPromptRegionSwitch:
          !cookies.get('region_prompt_dismissed') &&
          !profile?.region &&
          shouldSuggestCountrySwitch(country as CountryCode, resolvedDetectedCountry as CountryCode)
      };
    }
  }

  // No user - return minimal data with resolved region detection
  const detectedCountry = await regionPromise;
  const resolvedDetectedCountry = (detectedCountry as CountryCode | null) || defaultDetectedCountry;
  const suggestedLocale = getLocaleForCountry(resolvedDetectedCountry as CountryCode) || defaultSuggestedLocale;
  const shouldShowLocaleBanner = !localeBannerDismissed && suggestedLocale !== language;

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
    detectedCountry: resolvedDetectedCountry,
    suggestedLocale,
    shouldShowLocaleBanner,

    // Resolved data (awaited to prevent type issues)
    profile: null,
    detectedRegion: resolvedDetectedCountry === 'GB' ? 'UK' : 'BG',
    region: country === 'GB' ? 'UK' : 'BG',
    shouldPromptRegionSwitch: false
  };
}) satisfies LayoutServerLoad;
