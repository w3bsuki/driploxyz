<script lang="ts">
  import { navigating } from '$app/stores';
  
  let progress = $state(0);
  let timer: NodeJS.Timeout | undefined;
  
  // Use Svelte 5's $effect for reactive updates
  $effect(() => {
    if ($navigating) {
      // Start loading
      progress = 0;
      clearInterval(timer);
      
      // Animate progress bar
      timer = setInterval(() => {
        progress = Math.min(progress + Math.random() * 30, 90);
      }, 200);
    } else {
      // Navigation complete
      clearInterval(timer);
      progress = 100;
      
      // Reset after animation
      setTimeout(() => {
        progress = 0;
      }, 200);
    }
  });
  
  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  });
</script>

{#if $navigating}
  <div class="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
    <div 
      class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out shadow-sm"
      style="width: {progress}%"
    ></div>
  </div>
{/if}