<script lang="ts">
  import * as i18n from '@repo/i18n';

  interface Props {
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { 
    size = 'md',
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1'
  };
</script>

<span class="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg {sizeClasses[size]} {className}">
  {i18n.badge_new()}
</span>