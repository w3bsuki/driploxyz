<script lang="ts">
  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();
</script>

<dl class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-x-6 {className}">
  <slot />
  
</dl>

<style>
  /* The layout is handled by Tailwind utility classes. */
</style>

