<script lang="ts">
  const browser = typeof window !== 'undefined';

  interface Props {
    show?: boolean;
    onAccept?: () => void;
    onDecline?: () => void;
    onCustomize?: () => void;
    class?: string;
  }

  let { 
    show = $bindable(true), 
    onAccept, 
    onDecline, 
    onCustomize,
    class: className = '' 
  }: Props = $props();

  const CONSENT_COOKIE = 'cookie-consent';
  let hasConsent = $state(false);

  // Check if user already gave consent
  if (browser) {
    try {
      const consent = document.cookie
        .split(';')
        .find(row => row.trim().startsWith(CONSENT_COOKIE))
        ?.split('=')[1];
      
      if (consent) {
        hasConsent = true;
        show = false;
      }
    } catch (e) {
      // Cookie check failed
    }
  }

  function setCookieConsent(value: string) {
    if (!browser) return;
    
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1); // 1 year
      
      document.cookie = `${CONSENT_COOKIE}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
    } catch (e) {
      console.warn('Failed to set consent cookie:', e);
    }
  }

  function handleAccept() {
    setCookieConsent('accepted');
    hasConsent = true;
    show = false;
    onAccept?.();
  }

  function handleDecline() {
    setCookieConsent('declined');
    hasConsent = false;
    show = false;
    onDecline?.();
  }

  function handleCustomize() {
    onCustomize?.();
  }
</script>

{#if show && !hasConsent}
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg {className}">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-900 mb-1">
            🍪 We use cookies
          </h3>
          <p class="text-sm text-gray-600">
            We use essential cookies to make our site work. We'd also like to set optional cookies to help us improve our website and analyze site usage. 
            <a href="/privacy" class="text-blue-600 hover:text-blue-800 underline">Learn more about cookies</a>
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onclick={handleDecline}
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Decline optional
          </button>
          
          {#if onCustomize}
            <button
              onclick={handleCustomize}
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Customize
            </button>
          {/if}
          
          <button
            onclick={handleAccept}
            class="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}