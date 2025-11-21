<script lang="ts">
  // Marketing layout - wrap marketing pages with marketing-specific UI
  let { children } = $props();
</script>

<div class="marketing-layout">
  <!-- Simpler header for marketing pages -->
  {@render children()}
  <!-- Marketing-focused footer -->
</div>

