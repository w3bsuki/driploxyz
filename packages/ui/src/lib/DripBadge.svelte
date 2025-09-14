<script lang="ts">
  interface Props {
    /** Size of the badge */
    size?: 'sm' | 'md' | 'lg';
    /** Show text label next to emoji */
    showLabel?: boolean;
    /** Custom class names */
    class?: string;
  }

  let { size = 'md', showLabel = false, class: className = '' }: Props = $props();

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5'
  };

  const emojiSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
</script>

<span
  class="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium shadow-sm {sizeClasses[size]} {className}"
  title="DRIP Collection - Admin Approved"
>
  <span class="{emojiSizes[size]} leading-none" aria-hidden="true">💧</span>
  {#if showLabel}
    <span class="leading-none">DRIP</span>
  {/if}
</span>