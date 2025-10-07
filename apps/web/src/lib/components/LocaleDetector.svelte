<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { LocaleDetectionBanner } from '@repo/ui';
  import type { LanguageTag } from '$lib/i18n-types';
  import { getLocale, setLocale } from '$lib/paraglide/runtime';

  let showBanner = $state(false);
  let detectedLocale = $state<LanguageTag>('en-US');
  let detectedCountry = $state<string | null>(null);
  let currentLocale = $state<LanguageTag>(getLocale());

  // Simple locale detection using browser language
  function detectBrowserLocale(): { locale: LanguageTag; country: string | null } {
    const browserLang = navigator.language;
    const country = navigator.language.split('-')[1] || null;

    // Map browser languages to supported locales
    const localeMap: Record<string, LanguageTag> = {
      'en': 'en-US',
      'en-US': 'en-US',
      'en-GB': 'en-GB',
      'bg': 'bg-BG',
      'bg-BG': 'bg-BG',
      'es': 'es-ES',
      'es-ES': 'es-ES'
    };

    return {
      locale: localeMap[browserLang] || 'en-US',
      country
    };
  }

  // localStorage helpers
  const LOCALE_STORAGE_KEY = 'preferred-locale';
  const BANNER_DISMISSED_KEY = 'locale-banner-dismissed';

  function getStoredLocalePreference(): LanguageTag | null {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      return stored as LanguageTag || null;
    } catch {
      return null;
    }
  }

  function storeLocalePreference(locale: LanguageTag): void {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Silently fail
    }
  }

  function wasLocaleBannerDismissed(): boolean {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function dismissLocaleBanner(): void {
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    } catch {
      // Silently fail
    }
  }

  // Detect and handle locale on component mount
  $effect(() => {
    // Skip if user is authenticated and has a stored preference in their profile
    const session = page.data.session;
    if (session?.user) {
      // User locale is handled by the profile
      return;
    }

    // Check if user has a stored preference in localStorage
    const storedPreference = getStoredLocalePreference();
    if (storedPreference && storedPreference !== currentLocale) {
      // Apply stored preference
      setLocale(storedPreference);
      goto(page.url.pathname, { replaceState: true });
      return;
    }

    // Check if banner was already dismissed
    if (wasLocaleBannerDismissed()) {
      return;
    }

    // Detect user's locale
    const detection = detectBrowserLocale();
    detectedLocale = detection.locale;
    detectedCountry = detection.country;

    // Show banner if detected locale differs from current
    if (detection.locale !== currentLocale) {
      showBanner = true;
    }
  });

  function handleAcceptLocale() {
    // Store preference
    storeLocalePreference(detectedLocale);

    // Switch locale
    setLocale(detectedLocale);

    // Hide banner
    showBanner = false;

    // Reload page with new locale
    goto(page.url.pathname, { replaceState: true });
  }

  function handleDismissLocale() {
    // Mark as dismissed
    dismissLocaleBanner();

    // Store current locale as preference
    storeLocalePreference(currentLocale);

    // Hide banner
    showBanner = false;
  }
</script>

{#if showBanner}
  <LocaleDetectionBanner
    {detectedLocale}
    {detectedCountry}
    {currentLocale}
    onAccept={handleAcceptLocale}
    onDismiss={handleDismissLocale}
  />
{/if}