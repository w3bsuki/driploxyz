<script lang="ts">
  // Shop layout - wrap shop pages with shop-specific UI
  import { page } from '$app/state';
  import { BottomNav } from '@repo/ui';

  let { children } = $props();
</script>

<div class="shop-layout">
  <!-- Mobile bottom nav -->
  {#if page.url.pathname && page.url.pathname.startsWith('/')}
    <BottomNav currentPath={page.url.pathname} />
  {/if}

  <!-- Shop header/nav could go here -->
  {@render children()}
  <!-- Shop footer could go here -->
</div>

<style>
  .shop-layout {
    /* Shop-specific styles */
  }
</style>