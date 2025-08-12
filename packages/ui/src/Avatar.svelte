<script lang="ts">
  interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    premium?: boolean;
    variant?: 'circle' | 'square';
    onclick?: () => void;
    class?: string;
  }

  let { 
    src,
    alt = '',
    name = '',
    size = 'md',
    premium = false,
    variant = 'circle',
    onclick,
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const shapeClass = $derived(
    variant === 'square' ? 'rounded-xl' : 'rounded-full'
  );
  
  // Use ring for premium border - much cleaner!
  const premiumClass = $derived(
    premium ? 'ring-2 ring-yellow-400' : ''
  );
</script>

<button
  {onclick}
  disabled={!onclick}
  class="relative block {sizeClasses[size]} {shapeClass} {premiumClass} {onclick ? 'cursor-pointer' : 'cursor-default'} {className} overflow-hidden"
>
  {#if src}
    <img 
      {src} 
      {alt}
      class="w-full h-full object-cover"
    />
  {:else}
    <div class="flex items-center justify-center w-full h-full bg-gray-200">
      <span class="font-semibold text-gray-600 {textSizes[size]}">{initial}</span>
    </div>
  {/if}
</button>