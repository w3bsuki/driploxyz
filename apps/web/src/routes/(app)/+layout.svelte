<script lang="ts">
  // Main app layout (authenticated area)
  // This wraps both (shop) and (account) groups
  let { children } = $props();
</script>

<div class="app-layout">
  {@render children()}
  <!-- Mobile bottom nav -->
  {#if false}
    <!-- reserved: app-wide bottom nav if needed -->
  {/if}

</div>

