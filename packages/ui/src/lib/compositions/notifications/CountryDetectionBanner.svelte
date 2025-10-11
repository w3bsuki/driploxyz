<script lang="ts">
  export type CountryCode = 'BG' | 'GB' | 'US' | 'RU' | 'UA' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'RO';
  
  interface Props {
    detectedCountry: CountryCode;
    currentCountry: CountryCode;
    onAccept: () => void;
    onDismiss: () => void;
  }
  
  let { detectedCountry, currentCountry, onAccept, onDismiss }: Props = $props();
  
  const countryNames: Record<CountryCode, string> = {
    BG: 'Bulgaria',
    GB: 'United Kingdom',
    US: 'United States',
    RU: 'Russia',
    UA: 'Ukraine',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    NL: 'Netherlands',
    PL: 'Poland',
    RO: 'Romania'
  };
  
  const countryFlags: Record<CountryCode, string> = {
    BG: '🇧🇬',
    GB: '🇬🇧',
    US: '🇺🇸',
    RU: '🇷🇺',
    UA: '🇺🇦',
    DE: '🇩🇪',
    FR: '🇫🇷',
    ES: '🇪🇸',
    IT: '🇮🇹',
    NL: '🇳🇱',
    PL: '🇵🇱',
    RO: '🇷🇴'
  };
</script>

<div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-sm md:shadow-lg p-4 z-50 animate-slide-up">
  <button
    onclick={onDismiss}
    class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-500 transition-colors"
    aria-label="Dismiss"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  
  <div class="pr-8">
    <div class="flex items-center gap-3 mb-3">
      <span class="text-2xl">{countryFlags[detectedCountry]}</span>
      <div>
        <h3 class="font-semibold text-gray-900">
          Shopping from {countryNames[detectedCountry]}?
        </h3>
        <p class="text-sm text-gray-500">
          Switch to see local products and prices
        </p>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button
        onclick={onAccept}
        class="flex-1 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
      >
        Switch to {countryNames[detectedCountry]}
      </button>
      
      <button
        onclick={onDismiss}
        class="flex-1 px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
      >
        Keep {countryNames[currentCountry]}
      </button>
    </div>
  </div>
</div>

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .animate-slide-up {
      animation: none;
    }
  }
</style>