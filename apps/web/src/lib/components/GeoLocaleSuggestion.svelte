<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Button } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { goto } from '$app/navigation';
  
  let showBanner = $state(false);
  let detectedCountry = $state<string | null>(null);
  let dismissedKey = 'geo-locale-dismissed';
  
  $effect(() => {
    if (!browser) return;
    
    // Check if already dismissed
    if (sessionStorage.getItem(dismissedKey)) return;
    
    // Check if already on the right locale
    const currentPath = $page.url.pathname;
    const currentLocale = i18n.getLocale();
    
    // Detect country via IP (using Cloudflare headers or similar)
    detectCountry();
  });
  
  async function detectCountry() {
    // Use the country detection from layout server
    const detectedCountry = $page.data.country || $page.data.detectedRegion;
    
    if (detectedCountry) {
      handleCountryDetection(detectedCountry);
    }
  }
  
  function handleCountryDetection(country: string) {
    detectedCountry = country;
    const currentPath = $page.url.pathname;
    const currentLocale = i18n.getLocale();
    
    // Show banner for UK visitors not on /uk path
    if ((country === 'GB' || country === 'UK') && currentLocale !== 'en' && !currentPath.startsWith('/uk')) {
      showBanner = true;
    }
    
    // Show banner for Bulgarian visitors not on Bulgarian (root)
    if (country === 'BG' && currentLocale !== 'bg' && currentPath.startsWith('/uk')) {
      showBanner = true;
    }
  }
  
  function switchToSuggestedLocale() {
    const currentPath = $page.url.pathname.replace(/^\/(uk|bg)/, '');
    
    if (detectedCountry === 'GB' || detectedCountry === 'UK') {
      goto(`/uk${currentPath}`);
    } else if (detectedCountry === 'BG') {
      goto(currentPath || '/');
    }
    
    dismissBanner();
  }
  
  function dismissBanner() {
    showBanner = false;
    sessionStorage.setItem(dismissedKey, 'true');
  }
</script>

{#if showBanner}
  <div class="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xl p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">
              {detectedCountry === 'GB' || detectedCountry === 'UK' ? '🇬🇧' : '🇧🇬'}
            </span>
            <h3 class="font-semibold">
              {#if detectedCountry === 'GB' || detectedCountry === 'UK'}
                Welcome from the UK!
              {:else if detectedCountry === 'BG'}
                Добре дошли от България!
              {/if}
            </h3>
          </div>
          <p class="text-sm text-white/90 mb-3">
            {#if detectedCountry === 'GB' || detectedCountry === 'UK'}
              Visit our UK site for prices in GBP and local shipping
            {:else if detectedCountry === 'BG'}
              Посетете българската версия за цени в BGN
            {/if}
          </p>
          <div class="flex gap-2">
            <Button
              onclick={() => switchToSuggestedLocale()}
              variant="primary"
              size="sm"
              class="bg-white text-blue-600 hover:bg-gray-100"
            >
              {#if detectedCountry === 'GB' || detectedCountry === 'UK'}
                Go to UK Site
              {:else}
                Към BG сайта
              {/if}
            </Button>
            <Button
              onclick={() => dismissBanner()}
              variant="ghost"
              size="sm"
              class="text-white/80 hover:text-white"
            >
              Stay here
            </Button>
          </div>
        </div>
        <button
          onclick={() => dismissBanner()}
          class="text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

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
</style>