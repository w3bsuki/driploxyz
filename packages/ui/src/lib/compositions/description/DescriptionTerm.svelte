<script lang="ts">
  interface Props {
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { className = '', children }: Props = $props();
</script>

<dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500 {className}">
  {#if children}{@render children()}{/if}
</dt>

