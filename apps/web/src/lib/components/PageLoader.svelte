<script lang="ts">
  interface Props {
    show?: boolean;
    delay?: number;
    fullScreen?: boolean;
    message?: string;
  }
  
  let { 
    show = false, 
    delay = 500,
    fullScreen = false,
    message = ''
  }: Props = $props();
  
  let showLoader = $state(false);
  let timer: NodeJS.Timeout | undefined;
  
  // Show loader after delay to avoid flash on fast operations
  $effect(() => {
    if (show) {
      timer = setTimeout(() => {
        showLoader = true;
      }, delay);
    } else {
      clearTimeout(timer);
      showLoader = false;
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  // Safety: Hide loader after 30 seconds to prevent UI blocking
  $effect(() => {
    if (showLoader) {
      const safetyTimer = setTimeout(() => {
        showLoader = false;
      }, 30000);
      
      return () => clearTimeout(safetyTimer);
    }
  });
</script>

{#if showLoader}
  {#if fullScreen}
    <!-- Full screen loader for major operations -->
    <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        {#if message}
          <p class="text-sm text-gray-600">{message}</p>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Corner spinner for non-blocking indication -->
    <div class="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
      {#if message}
        <p class="text-sm text-gray-600">{message}</p>
      {/if}
    </div>
  {/if}
{/if}