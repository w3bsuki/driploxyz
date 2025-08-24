<script lang="ts">
  interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg';
  }

  let { size = 'md' }: Props = $props();

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
</script>

<span
  class="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium {sizeClasses[size]}"
>
  <span class="mr-0.5">⭐</span>
  Premium
</span>