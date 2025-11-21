<script lang="ts">
  import { Button } from '@repo/ui';
  // import { goto } from '$app/navigation'; // Not used, region switching handled via window.location
  
  type RegionCode = 'UK' | 'BG';

  interface Props {
    show: boolean;
    onClose: () => void;
    onSwitch: () => void;
    detectedRegion: RegionCode | string; // Allow any string but validate below
    currentRegion: RegionCode | string;  // Allow any string but validate below
  }

  let { show, onClose, onSwitch, detectedRegion: rawDetectedRegion, currentRegion: rawCurrentRegion }: Props = $props();

  // Validate and normalize region values with fallbacks
  const detectedRegion: RegionCode = rawDetectedRegion === 'UK' || rawDetectedRegion === 'BG' ? rawDetectedRegion : 'BG';
  const currentRegion: RegionCode = rawCurrentRegion === 'UK' || rawCurrentRegion === 'BG' ? rawCurrentRegion : 'BG';
  
  function handleSwitch() {
    // Set cookie and redirect to subdomain
    fetch('/api/region/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region: detectedRegion })
    }).then(() => {
      onSwitch();
      
      // Redirect to the appropriate subdomain
      const currentUrl = new URL(window.location.href);
      const hostname = currentUrl.hostname;
      
      // Remove any existing subdomain
      const baseDomain = hostname.replace(/^(uk\.|bg\.|www\.)/, '');
      
      // Build the new URL with subdomain
      let newUrl;
      if (detectedRegion === 'UK') {
        newUrl = `${currentUrl.protocol}//uk.${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      } else if (detectedRegion === 'BG') {
        newUrl = `${currentUrl.protocol}//bg.${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      } else {
        newUrl = currentUrl.href;
      }
      
      // Redirect to new subdomain
      window.location.href = newUrl;
    });
  }
  
  const regionInfo = {
    UK: {
      flag: '🇬🇧',
      currency: 'GBP (£)',
      language: 'English',
      shipping: 'UK domestic shipping',
      benefits: [
        'View listings from UK sellers',
        'Prices in British Pounds',
        'UK shipping options',
        'Local payment methods'
      ]
    },
    BG: {
      flag: '🇧🇬',
      currency: 'BGN (лв)',
      language: 'Bulgarian/English',
      shipping: 'Bulgaria & EU shipping',
      benefits: [
        'View listings from Bulgarian sellers',
        'Prices in Bulgarian Lev',
        'EU shipping options',
        'Local payment methods'
      ]
    }
  };
  
  const detected = regionInfo[detectedRegion] || regionInfo.BG; // Safe fallback to BG if region is invalid
  // const current = regionInfo[currentRegion]; // Defined but not used
</script>

{#if show}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <button 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      onclick={() => onClose()}
      onkeydown={(e) => e.key === 'Escape' && onClose()}
      aria-label="Close modal"
    ></button>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <!-- Close button -->
        <button
          onclick={() => onClose()}
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Content -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--surface-brand-strong)]/10 mb-4">
            <span class="text-2xl">{detected.flag}</span>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Welcome to Driplo!
          </h3>
          
          <p class="text-gray-600 mb-6">
            We detected you're browsing from the {detectedRegion === 'UK' ? 'United Kingdom' : 'Bulgaria'}. 
            Switch to the {detectedRegion} version for a better experience?
          </p>
          
          <!-- Region benefits -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 class="font-medium text-gray-900 mb-2">
              {detectedRegion} Version Benefits:
            </h4>
            <ul class="space-y-1 text-sm text-gray-600">
              {#each detected.benefits as benefit}
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              {/each}
            </ul>
          </div>
          
          <!-- Region details -->
          <div class="grid grid-cols-2 gap-3 text-sm mb-6">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-gray-500 mb-1">Currency</div>
              <div class="font-medium">{detected.currency}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-gray-500 mb-1">Shipping</div>
              <div class="font-medium">{detected.shipping}</div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3">
            <Button
              variant="ghost"
              class="flex-1"
              onclick={() => onClose()}
            >
              Stay on {currentRegion} version
            </Button>
            <Button
              variant="primary"
              class="flex-1"
              onclick={() => handleSwitch()}
            >
              Switch to {detectedRegion} {detected.flag}
            </Button>
          </div>
          
          <!-- Remember preference note -->
          <p class="text-xs text-gray-500 mt-4">
            We'll remember your preference for future visits
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}