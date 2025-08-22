<script lang="ts">
  import { Button } from '@repo/ui';
  import { browser } from '$app/environment';
  
  let isOnline = $state(browser ? navigator.onLine : true);
  let retryCount = $state(0);
  
  $effect(() => {
    if (!browser) return;
    
    // Check initial online status
    isOnline = navigator.onLine;
    
    // Listen for online/offline events
    const handleOnline = () => {
      isOnline = true;
      retryCount = 0;
    };
    
    const handleOffline = () => {
      isOnline = false;
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  function retry() {
    retryCount++;
    
    // Try to navigate back to the previous page or home
    if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      window.location.href = '/';
    }
  }
  
  function goHome() {
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>You're offline - Driplo</title>
  <meta name="description" content="You're currently offline. Check your internet connection and try again." />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full text-center">
    <!-- Icon -->
    <div class="mx-auto w-24 h-24 mb-6">
      {#if isOnline}
        <!-- Online icon -->
        <svg class="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      {:else}
        <!-- Offline icon -->
        <svg class="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12" />
        </svg>
      {/if}
    </div>

    <!-- Status -->
    {#if isOnline}
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">You're back online!</h1>
        <p class="text-gray-600">Your internet connection has been restored.</p>
      </div>
    {:else}
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">You're offline</h1>
        <p class="text-gray-600 mb-4">
          Check your internet connection and try again.
        </p>
        
        {#if retryCount > 0}
          <p class="text-sm text-gray-500">
            Attempted {retryCount} {retryCount === 1 ? 'time' : 'times'}
          </p>
        {/if}
      </div>
    {/if}

    <!-- Actions -->
    <div class="space-y-3">
      {#if isOnline}
        <Button onclick={retry} variant="primary" class="w-full">
          Continue where you left off
        </Button>
      {:else}
        <Button onclick={retry} variant="primary" class="w-full">
          Try again
        </Button>
      {/if}
      
      <Button onclick={goHome} variant="outline" class="w-full">
        Go to homepage
      </Button>
    </div>

    <!-- Tips -->
    <div class="mt-8 p-4 bg-white rounded-lg border border-gray-200">
      <h3 class="font-medium text-gray-900 mb-2">While you're offline:</h3>
      <ul class="text-sm text-gray-600 space-y-1 text-left">
        <li>• Check your WiFi connection</li>
        <li>• Try switching to mobile data</li>
        <li>• Some cached pages may still work</li>
        <li>• Your browsing data is saved locally</li>
      </ul>
    </div>

    <!-- Connection status indicator -->
    <div class="mt-6 flex items-center justify-center space-x-2">
      <div class="w-2 h-2 rounded-full {isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
      <span class="text-xs text-gray-500">
        {isOnline ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>