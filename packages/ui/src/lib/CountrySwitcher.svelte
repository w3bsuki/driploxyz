<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  export type CountryCode = 'BG' | 'GB' | 'US' | 'RU' | 'UA' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'RO';
  
  interface Props {
    currentCountry: CountryCode;
    showFlag?: boolean;
    variant?: 'dropdown' | 'inline' | 'modal';
    onCountryChange?: (country: CountryCode) => void;
  }
  
  let { 
    currentCountry, 
    showFlag = true,
    variant = 'dropdown',
    onCountryChange
  }: Props = $props();
  
  let isOpen = $state(false);
  
  const countries = [
    { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦', currency: 'UAH' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
    { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN' },
    { code: 'RO', name: 'Romania', flag: '🇷🇴', currency: 'RON' }
  ] as const;
  
  const currentCountryData = $derived(
    countries.find(c => c.code === currentCountry) || countries[0]
  );
  
  async function switchCountry(countryCode: CountryCode) {
    isOpen = false;
    
    if (onCountryChange) {
      onCountryChange(countryCode);
    } else {
      // Default behavior: reload page with country parameter
      const url = new URL($page.url);
      url.searchParams.set('country', countryCode);
      await goto(url.toString(), { invalidateAll: true });
    }
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.country-switcher')) {
      isOpen = false;
    }
  }
  
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

{#if variant === 'dropdown'}
  <div class="country-switcher relative">
    <button
      onclick={toggleDropdown}
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {#if showFlag}
        <span class="text-lg">{currentCountryData.flag}</span>
      {/if}
      <span class="hidden sm:inline">{currentCountryData.name}</span>
      <span class="sm:hidden">{currentCountryData.code}</span>
      <svg class="w-4 h-4 ml-1 transition-transform {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    {#if isOpen}
      <div class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-sm md:shadow-lg z-50">
        <div class="py-1">
          {#each countries as country}
            <button
              onclick={() => switchCountry(country.code as CountryCode)}
              class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 {country.code === currentCountry ? 'bg-gray-50 font-medium' : ''}"
            >
              {#if showFlag}
                <span class="text-lg">{country.flag}</span>
              {/if}
              <span class="flex-1 text-left">{country.name}</span>
              <span class="text-xs text-gray-500">{country.currency}</span>
              {#if country.code === currentCountry}
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
{:else if variant === 'inline'}
  <div class="country-switcher flex flex-wrap gap-2">
    {#each countries as country}
      <button
        onclick={() => switchCountry(country.code as CountryCode)}
        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {
          country.code === currentCountry 
            ? 'bg-black text-white' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }"
      >
        {#if showFlag}
          <span>{country.flag}</span>
        {/if}
        <span>{country.code}</span>
      </button>
    {/each}
  </div>
  
{:else if variant === 'modal'}
  <button
    onclick={() => isOpen = true}
    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-900"
  >
    {#if showFlag}
      <span class="text-lg">{currentCountryData.flag}</span>
    {/if}
    <span>{currentCountryData.code}</span>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  </button>
  
  {#if isOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Select Your Country</h2>
          <button
            onclick={() => isOpen = false}
            class="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p class="text-sm text-gray-500 mb-4">
          Choose your country to see relevant products and prices in your local currency.
        </p>
        
        <div class="grid grid-cols-2 gap-2">
          {#each countries as country}
            <button
              onclick={() => switchCountry(country.code as CountryCode)}
              class="flex items-center gap-2 p-3 rounded-md border transition-colors {
                country.code === currentCountry 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }"
            >
              {#if showFlag}
                <span class="text-xl">{country.flag}</span>
              {/if}
              <div class="text-left flex-1">
                <div class="font-medium text-sm">{country.name}</div>
                <div class="text-xs text-gray-500">{country.currency}</div>
              </div>
              {#if country.code === currentCountry}
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .country-switcher {
    font-family: inherit;
  }
</style>