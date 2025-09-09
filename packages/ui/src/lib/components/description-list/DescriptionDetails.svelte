<script lang="ts">
  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();
</script>

<dd class="text-sm text-gray-900 font-medium mt-0.5 {className}">
  <slot />
</dd>

