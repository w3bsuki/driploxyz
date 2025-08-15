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
  <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-2xl animate-bounce">🎉</div>
          <div>
            <div class="text-sm font-medium">
              {i18n.banner_limitedTime()}: <strong>50% {i18n.banner_percentOff()}</strong> Premium Plans!
            </div>
            <div class="text-xs opacity-90">
              Limited to first 100 users • {100 - earlyBirdCount} spots remaining
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <Button 
            href="/dashboard/upgrade"
            size="sm"
            class="bg-white text-green-600 hover:bg-gray-100 font-medium"
          >
{i18n.banner_shopNow()}
          </Button>
          <button 
            onclick={dismissBanner}
            class="text-white hover:text-gray-200 p-1"
            aria-label="{i18n.messages_dismiss()}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}