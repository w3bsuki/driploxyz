<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme';

  // Subscribe to theme changes and update root attributes
  $effect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', $theme.theme);
      root.setAttribute('data-brand', $theme.brand);
      root.setAttribute('data-accent', $theme.accent);
      root.setAttribute('data-neutral', $theme.neutral);
      root.setAttribute('data-solid', $theme.solid);
      root.setAttribute('data-solid-style', $theme.solidStyle);
      root.setAttribute('data-border', $theme.border);
      root.setAttribute('data-surface', $theme.surface);
      root.setAttribute('data-transition', $theme.transition);
      root.setAttribute('data-scaling', $theme.scaling);
    }
  });
</script>

<slot />
