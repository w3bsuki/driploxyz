<script lang="ts">
  import { isBrowser } from '../../utils/runtime.js';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    onConsentChange?: (consent: ConsentState) => void;
    enableLocationDetection?: boolean;
  }
  
  let { 
    onConsentChange,
    enableLocationDetection = true 
  }: Props = $props();
  
  interface ConsentState {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp?: number;
  }

  interface RequestConsentEventDetail {
    reason?: string;
    pendingLanguage?: string;
  }
  
  // Simple cookie manager for @repo/ui compatibility
  class SimpleCookieManager {
    private static instance: SimpleCookieManager;
    
    static getInstance(): SimpleCookieManager {
      if (!SimpleCookieManager.instance) {
        SimpleCookieManager.instance = new SimpleCookieManager();
      }
      return SimpleCookieManager.instance;
    }
    
    getConsent(): ConsentState | null {
      if (!isBrowser) return null;
      try {
        const consent = document.cookie
          .split(';')
          .find(row => row.trim().startsWith('driplo_consent='))
          ?.split('=')[1];
        return consent ? JSON.parse(decodeURIComponent(consent)) : null;
      } catch {
        return null;
      }
    }
    
    updateConsent(consent: ConsentState): void {
      if (!isBrowser) return;
      const consentWithTimestamp = { ...consent, timestamp: Date.now() };
      try {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `driplo_consent=${encodeURIComponent(JSON.stringify(consentWithTimestamp))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      } catch (e) {
        
      }
    }
  }
  
  // Simple locale manager
  class SimpleLocaleManager {
    private static instance: SimpleLocaleManager;
    
    static getInstance(): SimpleLocaleManager {
      if (!SimpleLocaleManager.instance) {
        SimpleLocaleManager.instance = new SimpleLocaleManager();
      }
      return SimpleLocaleManager.instance;
    }
    
    getLocale(): string {
      return i18n.getLocale();
    }
  }
  
  let showBanner = $state(false);
  let showPreferences = $state(false);
  let showLanguageSelector = $state(false);
  let consentManager: SimpleCookieManager;
  let localeManager: SimpleLocaleManager;
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
    { code: 'bg', name: 'Български', flag: '🇧🇬' }
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
  
  $effect(() => {
    if (!isBrowser) return;
    
    consentManager = SimpleCookieManager.getInstance();
    localeManager = SimpleLocaleManager.getInstance();
    
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
      if (existingConsent.timestamp) {
        const age = Date.now() - existingConsent.timestamp;
        if (age > 365 * 24 * 60 * 60 * 1000) {
          showBanner = true;
        }
      } else {
        // No timestamp means old consent format - show banner for renewal
        showBanner = true;
      }
    } else {
      // First visit - detect location for language suggestion
      if (enableLocationDetection) {
        detectLocation();
      }
      showBanner = true;
      showLanguageSelector = enableLocationDetection;
    }
    
    // Get current locale
    const currentLocale = localeManager.getLocale();
    selectedLocale = currentLocale;
    
    // Listen for requests to show cookie consent (e.g., for language switching)
    const handleCookieConsentRequest: EventListener = (event) => {
      const customEvent = event as CustomEvent<RequestConsentEventDetail>;

      const pendingLang = sessionStorage?.getItem('pendingLanguageSwitch');
      if (pendingLang) {
        selectedLocale = pendingLang;
        sessionStorage?.removeItem('pendingLanguageSwitch');
      }

      if (customEvent.detail?.pendingLanguage && customEvent.detail.pendingLanguage !== selectedLocale) {
        selectedLocale = customEvent.detail.pendingLanguage;
      }

      showLanguageSelector = !!(pendingLang || customEvent.detail?.pendingLanguage);
      showBanner = true;
      showPreferences = true;
    };
    
    (window as EventTarget).addEventListener('requestCookieConsent', handleCookieConsentRequest);
    
    return () => {
      (window as EventTarget).removeEventListener('requestCookieConsent', handleCookieConsentRequest);
    };
  });
  
  async function detectLocation() {
    if (!enableLocationDetection) return;
    
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      detectedCountry = data.country_code;
      
      // Set the detected country name
      detectedCountryName = (detectedCountry && countryNames[detectedCountry]) || data.country_name || detectedCountry || 'Unknown';
      
      // Map country to language
      const countryToLang: Record<string, string> = {
        'GB': 'en', // UK uses English
        'UK': 'en', // UK uses English
        'US': 'en', // US uses English
        'BG': 'bg', 'ES': 'es', 'FR': 'fr', 'DE': 'de', 
        'IT': 'it', 'RU': 'ru', 'UA': 'ua'
      };
      
      if (detectedCountry && countryToLang[detectedCountry]) {
        selectedLocale = countryToLang[detectedCountry];
      }
      
      // Set country cookie if detected (for UK/Bulgaria separation)
      if (detectedCountry === 'GB' || detectedCountry === 'UK') {
        // Set country cookie to GB for UK visitors
        document.cookie = `country=GB; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!isBrowser || location.protocol === 'https:' ? '; Secure' : ''}`;
      } else if (detectedCountry === 'BG') {
        // Set country cookie to BG for Bulgarian visitors
        document.cookie = `country=BG; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!isBrowser || location.protocol === 'https:' ? '; Secure' : ''}`;
      }
      
      // Also check for existing country cookie to sync region
      const countryCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('country='))
        ?.split('=')[1];
      
      if (countryCookie && countryCookie !== detectedCountry) {
        // Could handle country mismatch here
      }
    } catch (error) {
      // Fallback to isBrowser language
      const isBrowserLang = navigator.language.split('-')[0].toLowerCase();
      if (languages.find(l => l.code === isBrowserLang)) {
        selectedLocale = isBrowserLang;
      }
    }
  }
  
  async function acceptAll() {
    const consent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    // Update consent first
    consentManager.updateConsent(consent);
    onConsentChange?.(consent);
    
    // Check if there's a pending language switch that can now be completed
    const pendingLang = sessionStorage?.getItem('pendingLanguageSwitch');
    
    // Save language preference if language selector was shown or there's a pending switch
    if ((showLanguageSelector && selectedLocale) || pendingLang) {
      const targetLang = pendingLang || selectedLocale;
      saveLanguageAndRedirect(targetLang);
    } else {
      showBanner = false;
      showLanguageSelector = false;
    }
  }
  
  async function acceptNecessary() {
    const consent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    
    // Update consent
    consentManager.updateConsent(consent);
    onConsentChange?.(consent);
    
    // Force reload to refresh cookie state
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    showBanner = false;
    showLanguageSelector = false;
  }
  
  async function savePreferences() {
    // Update consent
    consentManager.updateConsent(preferences);
    onConsentChange?.(preferences);
    
    // Check if there's a pending language switch that can now be completed
    const pendingLang = sessionStorage?.getItem('pendingLanguageSwitch');
    
    // Save language if functional cookies enabled
    if (preferences.functional && ((showLanguageSelector && selectedLocale) || pendingLang)) {
      const targetLang = pendingLang || selectedLocale;
      saveLanguageAndRedirect(targetLang);
    } else {
      showBanner = false;
      showPreferences = false;
      showLanguageSelector = false;
    }
  }
  
  function saveLanguageAndRedirect(targetLang: string) {
    try {
      // Set cookie first
      document.cookie = `PARAGLIDE_LOCALE=${targetLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!isBrowser || location.protocol === 'https:' ? '; Secure' : ''}`;
      
      // Clear the pending language switch
      sessionStorage?.removeItem('pendingLanguageSwitch');
      
      // Close banner
      showBanner = false;
      showPreferences = false;
      showLanguageSelector = false;
      
      // Wait a moment for cookies and consent to be properly set before redirecting
      setTimeout(() => {
        // Redirect to proper URL with language prefix
        const currentUrl = new URL(window.location.href);
        let newPath = currentUrl.pathname;
        
        // Remove existing locale prefix if any
        newPath = newPath.replace(/^\/(?:bg|uk)(?=\/|$)/, '');
        
        // Use /uk for English; Bulgarian uses no prefix (root)
        if (targetLang === 'bg') {
          newPath = (newPath === '/' ? '/' : newPath);
        } else if (targetLang === 'en') {
          newPath = '/uk' + (newPath === '/' ? '' : newPath);
        }
        // Also include locale query to allow server to persist cookie immediately
        const qs = new URLSearchParams(currentUrl.search);
        qs.set('locale', targetLang);
        
        // Build final URL
        const finalUrl = `${currentUrl.protocol}//${currentUrl.host}${newPath}${qs.toString() ? `?${qs.toString()}` : ''}${currentUrl.hash}`;
        
        // Navigate to the new URL
        window.location.href = finalUrl;
      }, 150);
      
    } catch (e) {
      // Fallback: Set the locale cookie directly and refresh
      document.cookie = `PARAGLIDE_LOCALE=${targetLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${!isBrowser || location.protocol === 'https:' ? '; Secure' : ''}`;
      
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  }
  
  function togglePreferences() {
    showPreferences = !showPreferences;
  }
</script>

{#if showBanner}
  <!-- Semi-transparent backdrop -->
  <div class="fixed inset-0 bg-black/40 md:backdrop-blur-sm md:bg-black/30 z-[9998]" aria-hidden="true"></div>
  
  <!-- Main Banner Container -->
  <div class="fixed inset-x-0 bottom-0 z-[9999] max-h-[90vh] overflow-y-auto">
    <div class="bg-[color:var(--surface-base)]/95 border-t border-[color:var(--border-subtle)] shadow-xl backdrop-blur-xl">
      <div class="max-w-6xl mx-auto px-2 sm:px-4">
        
        {#if showLanguageSelector && !hasExistingConsent}
          <!-- Language Selection (First Time Visitors) -->
          <div class="p-6 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)]">
            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-[color:var(--text-primary)]">Welcome to Driplo! 🌍</h3>
              <p class="text-sm text-[color:var(--text-secondary)] mt-1">
                {#if detectedCountryName}
                  <span class="inline-flex items-center gap-1 bg-[color:var(--status-info-bg)] text-[color:var(--status-info-fg)] px-3 py-1 rounded-full text-sm font-medium mb-2">
                    📍 We detected you're visiting from <strong>{detectedCountryName}</strong>
                  </span>
                  <br>
                  Choose your preferred language:
                {:else if detectedCountry}
                  <span class="inline-flex items-center gap-1 bg-[color:var(--status-info-bg)] text-[color:var(--status-info-fg)] px-3 py-1 rounded-full text-sm font-medium mb-2">
                    📍 We detected you're visiting from <strong>{detectedCountry}</strong>
                  </span>
                  <br>
                  Choose your preferred language:
                {:else}
                  Choose your preferred language:
                {/if}
              </p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              {#each languages as lang}
                <button
                  onclick={() => selectedLocale = lang.code}
                  class="flex-1 min-h-[64px] p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    {selectedLocale === lang.code 
                      ? 'border-[color:var(--brand-primary)] bg-[color:var(--surface-brand-subtle)] shadow-lg ring-2 ring-[color:var(--brand-primary)]/20' 
                      : 'border-[color:var(--border-primary)] bg-[color:var(--surface-base)] hover:border-[color:var(--border-secondary)] hover:shadow-md'}"
                  title={`Choose ${lang.name}`}
                >
                  <div class="flex items-center justify-center gap-3">
                    <div class="text-3xl">{lang.flag}</div>
                    <div class="text-left flex-1">
                      <div class="text-sm font-semibold text-gray-900">{lang.name}</div>
                      <div class="text-xs text-gray-500">
                        {lang.code === 'en' ? 'United Kingdom' : 'България'}
                      </div>
                    </div>
                    {#if selectedLocale === lang.code}
                      <div class="ml-2">
                        <div class="w-6 h-6 bg-[color:var(--brand-primary)] rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Cookie Consent Section -->
        <div class="p-4 sm:p-6">
          <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
            
            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-start gap-3 sm:gap-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 bg-[color:var(--surface-strong)] rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <h2 class="text-lg sm:text-xl font-bold text-[color:var(--text-primary)] mb-2">
                    Privacy & Cookie Settings
                  </h2>
                  <p class="text-sm text-[color:var(--text-secondary)] leading-relaxed">
                    We use cookies to provide essential features, remember your preferences, 
                    and analyze how you use our platform. You control what we collect.
                    <a href="/privacy/cookies" class="link ml-1 font-medium">
                      Learn more
                    </a>
                  </p>
                  {#if detectedCountryName && (detectedCountry === 'GB' || detectedCountry === 'UK' || detectedCountry === 'BG')}
                    <div class="mt-3 p-2 bg-[color:var(--status-warning-bg)] border border-[color:var(--status-warning)] rounded-lg">
                      <p class="text-xs text-[color:var(--status-warning-fg)]">
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
                <div class="mt-6 space-y-3 bg-[color:var(--surface-secondary)] rounded-xl p-4">
                  
                  <!-- Essential (Always On) -->
                  <div class="bg-white rounded-lg p-3 border border-[color:var(--border-secondary)]">
                    <label class="flex items-start gap-3 cursor-not-allowed">
                      <input 
                        type="checkbox" 
                        checked={true}
                        disabled
                        class="mt-0.5 w-5 h-5 rounded border-[color:var(--border-primary)] cursor-not-allowed opacity-60"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-[color:var(--text-primary)]">Essential</div>
                        <p class="text-xs text-[color:var(--text-muted)] mt-0.5">
                          Authentication, security, basic functionality
                        </p>
                      </div>
                      <span class="text-xs bg-[color:var(--surface-tertiary)] text-[color:var(--text-muted)] px-2 py-1 rounded-full">
                        Required
                      </span>
                    </label>
                  </div>
                  
                  <!-- Functional -->
                  <div class="bg-white rounded-lg p-3 border border-[color:var(--border-secondary)]">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.functional}
                        class="mt-0.5 w-5 h-5 rounded border-[color:var(--border-primary)] text-[color:var(--primary)] focus:ring-[color:var(--state-focus)]"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-[color:var(--text-primary)]">Functional</div>
                        <p class="text-xs text-[color:var(--text-muted)] mt-0.5">
                          Language, theme, saved preferences
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Analytics -->
                  <div class="bg-white rounded-lg p-3 border border-[color:var(--border-secondary)]">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.analytics}
                        class="mt-0.5 w-5 h-5 rounded border-[color:var(--border-primary)] text-[color:var(--primary)] focus:ring-[color:var(--state-focus)]"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-[color:var(--text-primary)]">Analytics</div>
                        <p class="text-xs text-[color:var(--text-muted)] mt-0.5">
                          Usage statistics to improve our service
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Marketing -->
                  <div class="bg-white rounded-lg p-3 border border-[color:var(--border-secondary)]">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={preferences.marketing}
                        class="mt-0.5 w-5 h-5 rounded border-[color:var(--border-primary)] text-[color:var(--primary)] focus:ring-[color:var(--state-focus)]"
                      />
                      <div class="flex-1">
                        <div class="font-semibold text-sm text-[color:var(--text-primary)]">Marketing</div>
                        <p class="text-xs text-[color:var(--text-muted)] mt-0.5">
                          Personalized ads and campaigns
                        </p>
                      </div>
                    </label>
                  </div>
                  
                </div>
              {/if}
            </div>
            
            <!-- Actions -->
            <div class="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-64">
              <button
                onclick={acceptAll}
                class="min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold 
                       hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-lg text-sm"
              >
                Accept All
              </button>
              
              <button
                onclick={acceptNecessary}
                class="min-h-[44px] px-4 py-3 bg-white text-gray-700 rounded-xl font-semibold 
                       border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
              >
                Essential Only
              </button>
              
              {#if !showPreferences}
                <button
                  onclick={togglePreferences}
                  class="min-h-[44px] px-4 py-3 text-gray-500 hover:text-gray-700 
                         font-semibold transition-colors text-sm hover:bg-gray-50 rounded-xl"
                >
                  Customize
                </button>
              {:else}
                <button
                  onclick={savePreferences}
                  class="min-h-[44px] px-4 py-3 bg-blue-600 
                         text-white rounded-xl font-semibold hover:shadow-lg hover:bg-blue-700 transition-all text-sm"
                >
                  Save My Choices
                </button>
              {/if}
            </div>
            
          </div>
          
          <!-- GDPR Badge -->
          <div class="mt-4 pt-4 border-t border-[color:var(--border-secondary)] flex items-center justify-between text-xs">
            <div class="flex items-center gap-4 text-[color:var(--text-muted)]">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-[color:var(--status-success)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
              <span>•</span>
              <span>Your privacy matters</span>
            </div>
            <a href="/privacy" class="text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] transition-colors">
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