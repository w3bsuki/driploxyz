<script lang="ts">
  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();
</script>

<dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500 {className}">
  <slot />
</dt>

