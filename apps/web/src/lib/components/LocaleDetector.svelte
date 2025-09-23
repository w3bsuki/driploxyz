<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { LocaleDetectionBanner } from '@repo/ui';
  import { getLocale, setLocale } from '@repo/i18n';
  import type { LanguageTag } from '@repo/i18n';
  import {
    detectUserLocale,
    storeLocalePreference,
    getStoredLocalePreference,
    dismissLocaleBanner,
    wasLocaleBannerDismissed
  } from '$lib/locale/detection';
  
  let showBanner = $state(false);
  let detectedLocale = $state<LanguageTag>('en');
  let detectedCountry = $state<string | null>(null);
  let currentLocale = $state<LanguageTag>(getLocale());
  
  // Detect and handle locale on component mount
  $effect(async () => {
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
      await goto(page.url.pathname, { replaceState: true });
      return;
    }
    
    // Check if banner was already dismissed
    if (wasLocaleBannerDismissed()) {
      return;
    }
    
    // Detect user's locale
    const detection = await detectUserLocale();
    detectedLocale = detection.detectedLocale;
    detectedCountry = detection.detectedCountry;
    
    // Show banner if detected locale differs from current
    if (detection.detectedLocale !== currentLocale && detection.confidence !== 'low') {
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