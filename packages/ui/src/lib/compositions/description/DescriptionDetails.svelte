<script lang="ts">
  interface Props {
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { className = '', children }: Props = $props();
</script>

<dd class="text-sm text-gray-900 font-medium mt-0.5 {className}">
  {#if children}{@render children()}{/if}
</dd>

