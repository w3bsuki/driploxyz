<script lang="ts">
  import type { LanguageTag } from '@repo/i18n';
  
  interface Props {
    detectedLocale: LanguageTag;
    detectedCountry?: string | null;
    currentLocale: LanguageTag;
    onAccept: () => void;
    onDismiss: () => void;
  }
  
  let { detectedLocale, detectedCountry, currentLocale, onAccept, onDismiss }: Props = $props();
  
  const localeNames: Record<LanguageTag, string> = {
    en: 'English',
    bg: 'Български',
    ru: 'Русский',
    ua: 'Українська'
  };
  
  const countryNames: Record<string, string> = {
    BG: 'Bulgaria',
    RU: 'Russia',
    UA: 'Ukraine',
    US: 'United States',
    GB: 'United Kingdom'
  };
</script>

<div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
  <button
    onclick={onDismiss}
    class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
    aria-label="Dismiss"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  
  <div class="pr-8">
    <h3 class="font-semibold text-gray-900 mb-2">
      Language Detection
    </h3>
    
    <p class="text-sm text-gray-600 mb-3">
      {#if detectedCountry && countryNames[detectedCountry]}
        We detected you're visiting from <strong>{countryNames[detectedCountry]}</strong>.
      {:else}
        Based on your browser settings,
      {/if}
      would you like to switch to <strong>{localeNames[detectedLocale]}</strong>?
    </p>
    
    <div class="flex gap-2">
      <button
        onclick={onAccept}
        class="flex-1 px-4 py-2 bg-black text-white text-sm font-medium rounded-sm hover:bg-gray-800 transition-colors"
      >
        Switch to {localeNames[detectedLocale]}
      </button>
      
      <button
        onclick={onDismiss}
        class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 transition-colors"
      >
        Keep {localeNames[currentLocale]}
      </button>
    </div>
  </div>
</div>