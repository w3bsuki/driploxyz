<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { ProductionCookieManager, ProductionLocaleManager, type ConsentState } from '$lib/cookies/production-cookie-system';
  import * as i18n from '@repo/i18n';
  
  let showBanner = $state(false);
  let showPreferences = $state(false);
  let showLanguageSelector = $state(false);
  let consentManager: ProductionCookieManager;
  let localeManager: ProductionLocaleManager;
  let hasExistingConsent = $state(false);
  
  let preferences = $state({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });
  
  let selectedLocale = $state('en');
  let detectedCountry = $state<string | null>(null);
  let detectedCountryName = $state<string | null>(null);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ua', name: 'Українська', flag: '🇺🇦' }
  ];
  
  const countryNames: Record<string, string> = {
    'GB': 'United Kingdom',
    'UK': 'United Kingdom', 
    'BG': 'Bulgaria',
    'US': 'United States',
    'ES': 'Spain',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'RU': 'Russia',
    'UA': 'Ukraine',
    'RO': 'Romania',
    'PL': 'Poland',
    'NL': 'Netherlands'
  };
  
  onMount(async () => {
    if (!browser) return;
    
    
    consentManager = ProductionCookieManager.getInstance();
    localeManager = ProductionLocaleManager.getInstance();
    
    // Check existing consent
    const existingConsent = consentManager.getConsent();
    
    if (existingConsent) {
      hasExistingConsent = true;
      preferences = {
        necessary: true,
        functional: existingConsent.functional,
        analytics: existingConsent.analytics,
        marketing: existingConsent.marketing
      };
      
      // Check if consent needs renewal (365 days)
      const age = Date.now() - existingConsent.timestamp;
      if (age > 365 * 24 * 60 * 60 * 1000) {
        showBanner = true;
      }
    } else {
      // First visit - detect location for language suggestion
      await detectLocation();
      showBanner = true;
      showLanguageSelector = true;
    }
    
    // Get current locale
    const currentLocale = localeManager.getLocale();
    selectedLocale = currentLocale;
    
    // Listen for requests to show cookie consent (e.g., for language switching)
    const handleCookieConsentRequest = (event: CustomEvent) => {
      
      // Check if there's a pending language switch
      const pendingLang = sessionStorage.getItem('pendingLanguageSwitch');
      if (pendingLang) {
        selectedLocale = pendingLang;
        showLanguageSelector = true;
      }
      
      // Show the banner
      showBanner = true;
      showPreferences = true; // Open preferences so user can see functional cookies toggle
    };
    
    window.addEventListener('requestCookieConsent', handleCookieConsentRequest);
    
    return () => {
      window.removeEventListener('requestCookieConsent', handleCookieConsentRequest);
    };
  });
  
  async function detectLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      detectedCountry = data.country_code;
      
      // Set the detected country name
      detectedCountryName = countryNames[detectedCountry] || data.country_name || detectedCountry;
      
      // Map country to language
      const countryToLang: Record<string, string> = {
        'GB': 'en', // UK uses English
        'UK': 'en', // UK uses English
        'US': 'en', // US uses English
        'BG': 'bg', 'ES': 'es', 'FR': 'fr', 'DE': 'de', 
        'IT': 'it', 'RU': 'ru', 'UA': 'ua'
      };
      
      if (countryToLang[detectedCountry]) {
        selectedLocale = countryToLang[detectedCountry];
      }
      
      // Set country cookie if detected (for UK/Bulgaria separation)
      if (detectedCountry === 'GB' || detectedCountry === 'UK') {
        // Set country cookie to GB for UK visitors
        document.cookie = `country=GB; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
      } else if (detectedCountry === 'BG') {
        // Set country cookie to BG for Bulgarian visitors
        document.cookie = `country=BG; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
      }
      
      // Also check for existing country cookie to sync region
      const countryCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('country='))
        ?.split('=')[1];
      
      if (countryCookie && countryCookie !== detectedCountry) {
      }
    } catch (error) {
      // Fallback to browser language
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      if (languages.find(l => l.code === browserLang)) {
        selectedLocale = browserLang;
      }
    }
  }
  
  async function acceptAll() {
    // Update consent first
    consentManager.updateConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    });
    
    // Check if there's a pending language switch that can now be completed
    const pendingLang = sessionStorage.getItem('pendingLanguageSwitch');
    
    // Save language preference if language selector was shown or there's a pending switch
    if (showLanguageSelector && selectedLocale || pendingLang) {
      const targetLang = pendingLang || selectedLocale;
      try {
        // Simple approach: Set cookie and refresh
        document.cookie = `locale=${targetLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
        
        // Clear the pending language switch
        sessionStorage.removeItem('pendingLanguageSwitch');
        
        // Close banner and refresh to apply language
        showBanner = false;
        showLanguageSelector = false;
        
        // Refresh to apply the language change
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
      } catch (e) {
        // Fallback: Set the locale cookie directly
        document.cookie = `locale=${targetLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
        
        // Force reload to apply language
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } else {
      showBanner = false;
      showLanguageSelector = false;
    }
  }
  
  async function acceptNecessary() {
    // Update consent
    consentManager.updateConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    });
    
    // Note: Language preference cannot be saved without functional cookies
    // But we still close the banner
    
    showBanner = false;
    showLanguageSelector = false;
  }
  
  async function savePreferences() {
    // Update consent
    consentManager.updateConsent(preferences);
    
    // Check if there's a pending language switch that can now be completed
    const pendingLang = sessionStorage.getItem('pendingLanguageSwitch');
    
    // Save language if functional cookies enabled
    if (preferences.functional && (showLanguageSelector && selectedLocale || pendingLang)) {
      const targetLang = pendingLang || selectedLocale;
      try {
        // Use the proper locale manager now that functional cookies are enabled
        await localeManager.setLocale(targetLang, true); // true = skip reload for instant switching
        
        // Clear the pending language switch
        sessionStorage.removeItem('pendingLanguageSwitch');
        
        // Trigger a manual UI update
        const { invalidateAll } = await import('$app/navigation');
        await invalidateAll();
        
        // Close banner
        showBanner = false;
        showPreferences = false;
        showLanguageSelector = false;
        
      } catch (e) {
        // Fallback: Set the locale cookie directly
        document.cookie = `locale=${targetLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
        
        // Force reload to apply language
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } else {
      showBanner = false;
      showPreferences = false;
      showLanguageSelector = false;
    }
  }
  
  async function saveLanguage() {
    if (selectedLocale) {
      try {
        // Simple approach: Set cookie and refresh
        document.cookie = `locale=${selectedLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!browser || location.protocol === 'https:' ? '; Secure' : ''}`;
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (e) {
        // Fallback: Force refresh anyway
        window.location.reload();
      }
    }
  }
  
  function togglePreferences() {
    showPreferences = !showPreferences;
  }
</script>

{#if showBanner}
  <!-- Semi-transparent backdrop -->
  <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" aria-hidden="true"></div>
  
  <!-- Main Banner Container -->
  <div class="fixed inset-x-0 bottom-0 z-[9999]">
    <div class="bg-white border-t-2 border-gray-200 shadow-2xl">
      <div class="max-w-6xl mx-auto">
        
        {#if showLanguageSelector && !hasExistingConsent}
          <!-- Language Selection (First Time Visitors) -->
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-gray-900">Welcome to Driplo! 🌍</h3>
              <p class="text-sm text-gray-600 mt-1">
                {#if detectedCountryName}
                  <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    📍 We detected you're visiting from <strong>{detectedCountryName}</strong>
                  </span>
                  <br>
                  Choose your preferred language:
                {:else if detectedCountry}
                  <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    📍 We detected you're visiting from <strong>{detectedCountry}</strong>
                  </span>
                  <br>
                  Choose your preferred language:
                {:else}
                  Choose your preferred language:
                {/if}
              </p>
            </div>
            
            <div class="grid grid-cols-4 sm:grid-cols-8 gap-2 max-w-2xl mx-auto">
              {#each languages as lang}
                <button
                  onclick={() => selectedLocale = lang.code}
                  class="p-2 rounded-lg border-2 transition-all hover:scale-105
                    {selectedLocale === lang.code 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'}"
                  title={lang.name}
                >
                  <div class="text-2xl">{lang.flag}</div>
                  <div class="text-xs mt-1 font-medium">{lang.code.toUpperCase()}</div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Cookie Consent Section -->
        <div class="p-6">
          <div class="flex flex-col lg:flex-row gap-6">
            
            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-gray-900 mb-2">
                    Privacy & Cookie Settings
                  </h2>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    We use cookies to provide essential features, remember your preferences, 
                    and analyze how you use our platform. You control what we collect.
                    <a href="/privacy/cookies" class="text-blue-600 hover:underline ml-1 font-medium">
                      Learn more
                    </a>
                  </p>
                  {#if detectedCountryName && (detectedCountry === 'GB' || detectedCountry === 'UK' || detectedCountry === 'BG')}
                    <div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p class="text-xs text-yellow-800">
                        💡 <strong>Tip:</strong> Shopping from {detectedCountryName}? 
                        Visit <a href={detectedCountry === 'BG' ? 'https://bg.driplo.xyz' : 'https://uk.driplo.xyz'} 
                              class="font-medium underline">
                          {detectedCountry === 'BG' ? 'bg.driplo.xyz' : 'uk.driplo.xyz'}
                        </a> to see local listings and prices in {detectedCountry === 'BG' ? 'BGN' : 'GBP'}.
                      </p>
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Cookie Categories (Expandable) -->
              {#if showPreferences}
                <div class="mt-6 space-y-3 bg-gray-50 rounded-xl p-4">
                  
                  <!-- Essential (Always On) -->
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <label class="flex items-start gap-3 cursor-not-allowed">
                      <input 
                        type="checkbox" 
                        checked={true}
                        disabled
                        class="mt-0.5 w-5 h-5 rounded border-gray-300 cursor-not-allowed opacity-60"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-900">Essential</div>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Authentication, security, basic functionality
                        </p>
                      </div>
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Required
                      </span>
                    </label>
                  </div>
                  
                  <!-- Functional -->
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.functional}
                        class="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-900">Functional</div>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Language, theme, saved preferences
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Analytics -->
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.analytics}
                        class="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-900">Analytics</div>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Usage statistics to improve our service
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Marketing -->
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.marketing}
                        class="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-900">Marketing</div>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Personalized ads and campaigns
                        </p>
                      </div>
                    </label>
                  </div>
                  
                </div>
              {/if}
            </div>
            
            <!-- Actions -->
            <div class="flex flex-row lg:flex-col gap-2 lg:w-64">
              <button
                onclick={acceptAll}
                class="flex-1 lg:flex-none px-5 py-3 bg-black text-white rounded-xl font-semibold 
                       hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg text-sm"
              >
                Accept All
              </button>
              
              <button
                onclick={acceptNecessary}
                class="flex-1 lg:flex-none px-5 py-3 bg-white text-gray-700 rounded-xl font-semibold 
                       border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-sm"
              >
                Essential Only
              </button>
              
              {#if !showPreferences}
                <button
                  onclick={togglePreferences}
                  class="flex-1 lg:flex-none px-5 py-3 text-gray-600 hover:text-gray-900 
                         font-semibold transition-colors text-sm"
                >
                  Customize
                </button>
              {:else}
                <button
                  onclick={savePreferences}
                  class="flex-1 lg:flex-none px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                         text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Save My Choices
                </button>
              {/if}
            </div>
            
          </div>
          
          <!-- GDPR Badge -->
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <div class="flex items-center gap-4 text-gray-500">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
              <span>•</span>
              <span>Your privacy matters</span>
            </div>
            <a href="/privacy" class="text-gray-500 hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
          </div>
          
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Smooth entrance animation */
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  div[class*="fixed inset-x-0 bottom-0"] {
    animation: slideUp 0.4s ease-out;
  }
</style>