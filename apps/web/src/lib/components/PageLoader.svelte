<script lang="ts">
  import { navigating } from '$app/stores';
  import { LoadingSpinner } from '@repo/ui';
  
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
  <LoadingSpinner fullscreen={true} size="lg" color="#6366f1" />
{/if}