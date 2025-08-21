<script lang="ts">
  import { Button, Card } from '@repo/ui';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  interface SharePlatform {
    name: string;
    icon: string;
    color: string;
    action: () => void;
  }
  
  let isVisible = $state(false);
  let showStats = $state(false);
  let showTips = $state(false);
  let showShare = $state(false);
  
  const productId = $derived($page.url.searchParams.get('id'));
  const isProcessing = $derived($page.url.searchParams.get('status') === 'processing');
  const isTemp = $derived(productId?.startsWith('temp_'));
  
  const stats = $derived([
    { icon: '👁', label: isProcessing ? 'Publishing...' : 'Getting views' },
    { icon: '💬', label: isProcessing ? 'Almost ready...' : 'Ready for offers' },
    { icon: '📦', label: isProcessing ? 'Finalizing...' : 'Ready to ship' }
  ]);
  
  const tips = [
    'Respond to messages within 1 hour',
    'Consider reasonable offers',
    'Ship within 24 hours of sale',
    'Keep your listing photos updated'
  ];
  
  const sharePlatforms: SharePlatform[] = [
    {
      name: 'Twitter',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      color: 'bg-black hover:bg-gray-800',
      action: () => {
        const url = `${window.location.origin}/product/${productId}`;
        const text = 'Check out my new listing on Driplo!';
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        const url = `${window.location.origin}/product/${productId}`;
        const text = 'Check out my new listing on Driplo!';
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const url = `${window.location.origin}/product/${productId}`;
        navigator.clipboard.writeText(url);
        // TODO: Show toast notification
      }
    }
  ];
  
  onMount(() => {
    // Stagger animations
    requestAnimationFrame(() => {
      isVisible = true;
      setTimeout(() => showStats = true, 200);
      setTimeout(() => showTips = true, 400);
      setTimeout(() => showShare = true, 600);
    });
    
    // Auto-redirect after 7 seconds (only if not processing)
    const timer = setTimeout(() => {
      if (productId && !isTemp) {
        goto(`/product/${productId}`);
      }
    }, 7000);
    
    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>Success! Item Listed - Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-green-50 via-white to-white">
  <!-- Mobile Header -->
  <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-xs border-b border-gray-100 px-4 py-3">
    <div class="flex items-center justify-between max-w-lg mx-auto">
      <h1 class="text-lg font-semibold">Listing Complete</h1>
      <button 
        onclick={() => goto('/')}
        class="p-2 -mr-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
  
  <div class="px-4 py-6 max-w-lg mx-auto">
    <!-- Success Animation -->
    <div class="flex justify-center mb-6 transform transition-all duration-700 {isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}">
      <div class="relative">
        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <!-- Pulse rings -->
        <div class="absolute inset-0 rounded-full bg-green-400 opacity-25 animate-ping"></div>
        <div class="absolute inset-0 rounded-full bg-green-400 opacity-25 animate-ping animation-delay-200"></div>
      </div>
    </div>
    
    <!-- Success Message -->
    <div class="text-center mb-8 transform transition-all duration-500 {isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {isProcessing ? 'Publishing your item...' : 'Your item is live!'}
      </h2>
      <p class="text-gray-600">
        {isProcessing ? 'Just a moment while we finalize your listing' : 'Buyers can now discover and purchase your item'}
      </p>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3 mb-6 transform transition-all duration-500 {showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}">
      {#each stats as stat}
        <Card padding={false} class="text-center py-4">
          <div class="text-2xl mb-1">{stat.icon}</div>
          <div class="text-xs text-gray-600 px-2">{stat.label}</div>
        </Card>
      {/each}
    </div>
    
    <!-- Pro Tips -->
    <Card class="mb-6 transform transition-all duration-500 {showTips ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}">
      <div class="flex items-start space-x-3">
        <div class="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 mb-2">Quick Tips for Success</h3>
          <ul class="space-y-1.5">
            {#each tips as tip}
              <li class="flex items-start">
                <span class="text-green-500 mr-2 shrink-0">✓</span>
                <span class="text-sm text-gray-600">{tip}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </Card>
    
    <!-- Action Buttons -->
    <div class="space-y-3 mb-6">
      <Button 
        variant="primary" 
        size="lg" 
        onclick={() => !isTemp && productId && goto(`/product/${productId}`)}
        disabled={isTemp}
        class="w-full py-4 text-base font-semibold"
      >
        {#if isProcessing}
          <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Publishing...
        {:else}
          View Your Listing
        {/if}
      </Button>
      
      <Button 
        variant="secondary" 
        size="lg" 
        onclick={() => goto('/sell')}
        class="w-full py-4 text-base"
      >
        List Another Item
      </Button>
    </div>
    
    <!-- Share Section -->
    {#if !isProcessing}
      <div class="transform transition-all duration-500 {showShare ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}">
        <p class="text-center text-sm text-gray-600 mb-4">Share your listing</p>
        <div class="flex justify-center space-x-3">
          {#each sharePlatforms as platform}
            <button
              onclick={platform.action}
              class="w-12 h-12 rounded-full {platform.color} text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Share on {platform.name}"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d={platform.icon} />
              </svg>
            </button>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Auto-redirect notice -->
    {#if !isProcessing}
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">Redirecting to your listing in a moment...</p>
        <div class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
          <div class="h-full bg-green-500 rounded-full animate-progress"></div>
        </div>
      </div>
    {:else}
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">Finalizing your listing...</p>
        <div class="mt-2 flex justify-center">
          <svg class="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes progress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
  
  .animate-progress {
    animation: progress 7s linear forwards;
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  
  .touch-manipulation {
    touch-action: manipulation;
  }
</style>