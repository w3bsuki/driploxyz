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
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-[10px] px-2 py-0.5'
  };
</script>

<span class="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full shadow-sm {sizeClasses[size]} {className}">
  {i18n.badge_new()}
</span>