<script lang="ts">
  // Shop layout - wrap shop pages with shop-specific UI
  import { page } from '$app/state';

  let { children } = $props();
</script>

<div class="shop-layout">
  <!-- Shop header/nav could go here -->
  {@render children()}
  <!-- Shop footer could go here -->
</div>

<style>
  .shop-layout {
    /* Shop-specific styles */
  }
</style>