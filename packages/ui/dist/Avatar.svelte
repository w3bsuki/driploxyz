<script lang="ts">
  interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    premium?: boolean;
    variant?: 'circle' | 'square';
    fallback?: string;
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
    fallback = '',
    onclick,
    class: className = ''
  }: Props = $props();

  let imageError = $state(false);

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

  const initial = fallback || (name ? name.charAt(0).toUpperCase() : '?');
  
  function handleImageError() {
    imageError = true;
  }
  
  // Reset error state when src changes
  $effect(() => {
    imageError = false;
  });
  
  const shapeClass = $derived(
    variant === 'square' ? 'rounded-xl' : 'rounded-full'
  );
  
  // Clean up - removed unused premium classes
</script>

<button
  {onclick}
  disabled={!onclick}
  class="relative block {sizeClasses[size]} {shapeClass} {premium ? 'ring-1 ring-violet-500' : ''} {onclick ? 'cursor-pointer' : 'cursor-default'} {className} overflow-hidden"
>
  {#if src && !imageError}
    <img 
      {src} 
      {alt}
      onerror={handleImageError}
      class="w-full h-full object-cover"
    />
  {:else}
    <div class="flex items-center justify-center w-full h-full bg-gray-200">
      <span class="font-semibold text-gray-600 {textSizes[size]}">{initial}</span>
    </div>
  {/if}
</button>