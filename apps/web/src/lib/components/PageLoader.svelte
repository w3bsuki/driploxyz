<script lang="ts">
  import { navigating } from '$app/stores';
  
  let showLoader = $state(false);
  let timer: NodeJS.Timeout | undefined;
  
  // Show loader after 150ms delay to avoid flash on fast navigations
  $effect(() => {
    if ($navigating) {
      timer = setTimeout(() => {
        showLoader = true;
      }, 150);
    } else {
      clearTimeout(timer);
      showLoader = false;
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  // Safety: Hide loader after 10 seconds to prevent UI blocking
  $effect(() => {
    if (showLoader) {
      const safetyTimer = setTimeout(() => {
        showLoader = false;
      }, 10000);
      
      return () => clearTimeout(safetyTimer);
    }
  });
</script>

{#if showLoader}
  <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
  </div>
{/if}