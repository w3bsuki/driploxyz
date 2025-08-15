<script lang="ts">
  import { Button } from '@repo/ui';
  import { onMount } from 'svelte';
  import { createClient } from '$lib/supabase/client';
  import * as i18n from '@repo/i18n';

  let showBanner = $state(false);
  let earlyBirdCount = $state(0);
  let loading = $state(true);

  const supabase = createClient();

  onMount(async () => {
    // Check if user previously dismissed banner first
    const dismissed = localStorage.getItem('earlyBirdBannerDismissed');
    if (dismissed === 'true') {
      showBanner = false;
      loading = false;
      return;
    }

    try {
      // Check discount eligibility via API
      const response = await fetch('/api/subscriptions/discount');
      
      if (response.ok) {
        const discountInfo = await response.json();
        showBanner = discountInfo.eligible;
        
        // Get actual count of early bird users
        const { count } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .gt('discount_percent', 0);
          
        earlyBirdCount = count || 0;
      } else {
        showBanner = false;
      }
    } catch (error) {
      console.error('Error checking early bird status:', error);
      showBanner = false;
    } finally {
      loading = false;
    }
  });

  function dismissBanner() {
    showBanner = false;
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem('earlyBirdBannerDismissed', 'true');
  }
</script>

{#if !loading && showBanner}
  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      <!-- Mobile Layout -->
      <div class="sm:hidden">
        <div class="grid grid-cols-[1fr_auto_auto] items-center gap-3">
          <div class="flex items-center space-x-3">
            <div class="text-xl">🚀</div>
            <div>
              <div class="text-sm font-bold">
                {i18n.banner_welcomeToDriplo()} - {i18n.banner_sellBuySecond()}
              </div>
            </div>
          </div>
          
          <Button 
            href="/sell"
            variant="outline"
            size="sm"
            class="!bg-white !text-blue-600 !border-white font-bold shadow-sm hover:!bg-blue-50 !px-4"
          >
            {i18n.banner_register()}
          </Button>
          
          <button 
            onclick={dismissBanner}
            class="text-white hover:text-gray-200 p-2"
            aria-label="Dismiss"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">🚀</div>
          <div>
            <div class="text-base font-bold leading-tight">
              {i18n.banner_welcomeToDriplo()}
            </div>
            <div class="text-sm opacity-90 leading-tight mt-1">
              {i18n.banner_sellBuySecond()} - {i18n.banner_joinCommunity()}
            </div>
          </div>
        </div>
        
        <Button 
          href="/sell"
          variant="outline"
          size="md"
          class="!bg-white !text-blue-600 !border-white font-bold shadow-sm hover:!bg-blue-50"
        >
          {i18n.banner_register()}
        </Button>
        
        <button 
          onclick={dismissBanner}
          class="text-white hover:text-gray-200 p-2"
          aria-label="Dismiss"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}