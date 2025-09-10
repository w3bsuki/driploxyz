<script lang="ts">
  import * as i18n from '@repo/i18n';

  interface Props {
    verified?: boolean;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { 
    verified = false,
    size = 'md',
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1'
  };
</script>

<div class="inline-flex items-center space-x-1 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg {sizeClasses[size]} {className}">
  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
  </svg>
  <span>{i18n.badge_brand()}</span>
  {#if verified}
    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  {/if}
</div>