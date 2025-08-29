<script lang="ts">
  import { navigating } from '$app/stores';
  import { browser } from '$app/environment';

  let isActive = $state(false);
  let progress = $state(0);
  let timer: any = null;

  function start() {
    isActive = true;
    progress = 0;
    clearInterval(timer);
    // Ease towards 80% while navigating
    timer = setInterval(() => {
      progress = Math.min(progress + Math.max(1, (80 - progress) * 0.1), 80);
    }, 100);
  }

  function finish() {
    // Complete, then hide after a short delay
    progress = 100;
    clearInterval(timer);
    setTimeout(() => {
      isActive = false;
      progress = 0;
    }, 200);
  }

  $effect(() => {
    if (!browser) return;
    const unsub = navigating.subscribe((n) => {
      if (n) start();
      else finish();
    });
    return () => unsub();
  });
</script>

{#if isActive}
  <div class="fixed left-0 right-0 z-[60] pointer-events-none" style="top: var(--app-header-offset, 0px);">
    <div 
      class="h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 shadow-sm transition-[width] duration-150 ease-out"
      style={`width:${progress}%;`}
    />
  </div>
{/if}

<style>
  /* Avoid repaints by isolating the progress element */
  div > div {
    will-change: width;
  }
  @media (prefers-reduced-motion: reduce) {
    .transition-\[width\] {
      transition: none !important;
    }
  }
  /* Ensure safe overlap with sticky headers */
  :global(.sticky) + .fixed {
    top: 0;
  }
</style>
