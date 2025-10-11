<script lang="ts">
  // Main app layout (authenticated area)
  // This wraps both (shop) and (account) groups
  let { children } = $props();
</script>

<div class="app-layout">
  {@render children()}
</div>

<style>
  .app-layout {
    /* App-wide authenticated styles */
  }
</style>