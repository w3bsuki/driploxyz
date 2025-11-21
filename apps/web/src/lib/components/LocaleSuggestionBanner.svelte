<script lang="ts">
  import { browser } from '$app/environment';
  import { setLocale, type Locale } from '@repo/i18n';

  interface Props {
    detectedCountry: string;
    suggestedLocale: Locale;
    currentLocale: Locale;
  }

  let { detectedCountry, suggestedLocale, currentLocale }: Props = $props();

  // Check if banner was previously dismissed
  let dismissed = $state(false);
  
  $effect(() => {
    if (browser) {
      const key = `locale-banner-dismissed-${detectedCountry}-${suggestedLocale}`;
      dismissed = localStorage.getItem(key) === 'true';
    }
  });

  // Only show if locale differs from suggestion and not dismissed
  const shouldShow = $derived(!dismissed && suggestedLocale !== currentLocale);

  function handleDismiss() {
    if (browser) {
      const key = `locale-banner-dismissed-${detectedCountry}-${suggestedLocale}`;
      localStorage.setItem(key, 'true');
      dismissed = true;
    }
  }

  function handleSwitchLocale() {
    if (browser) {
      // Use Paraglide's setLocale which triggers page reload
      setLocale(suggestedLocale);
    }
  }

  const countryNames: Record<string, string> = {
    BG: 'България',
    GB: 'United Kingdom',
    UK: 'United Kingdom'
  };

  const localeNames: Record<Locale, string> = {
    bg: 'Български',
    en: 'English'
  };
</script>

{#if shouldShow}
  <div 
    class="fixed top-0 left-0 right-0 z-50 bg-brand-primary text-white shadow-lg"
    role="alert"
    aria-live="polite"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4 py-3">
        <div class="flex items-center gap-3 flex-1">
          <span class="text-2xl" aria-hidden="true">🌍</span>
          <div class="flex-1">
            <p class="text-sm sm:text-base font-medium">
              {detectedCountry && suggestedLocale ? `We detected you're in ${countryNames[detectedCountry] || detectedCountry}.` : ''}
            </p>
            <p class="text-xs sm:text-sm text-white/80 mt-0.5">
              {suggestedLocale ? `Switch to ${localeNames[suggestedLocale]}?` : ''}
            </p>
          </div>
        </div>

  <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={handleSwitchLocale}
            class="
              px-4 py-2 text-sm font-medium
              bg-white text-brand-primary
              rounded-lg
              hover:bg-white/90
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary
              transition-colors
              whitespace-nowrap
            "
          >
            {suggestedLocale ? `Use ${localeNames[suggestedLocale]}` : 'Switch'}
          </button>

          <button
            type="button"
            onclick={handleDismiss}
            class="
              p-2 text-white/80
              hover:text-white hover:bg-white/10
              rounded-lg
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary
              transition-colors
            "
        aria-label={"Dismiss"}
          >
        <span class="w-5 h-5 inline-block" aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Spacer to prevent content from being hidden under fixed banner -->
  <div class="h-[60px] sm:h-[52px]" aria-hidden="true"></div>
{/if}
