<script lang="ts">
  interface Props {
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { className = '', children }: Props = $props();
</script>

<dl class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-x-6 {className}">
  {#if children}{@render children()}{/if}
</dl>

<style>
  /* The layout is handled by Tailwind utility classes. */
</style>

