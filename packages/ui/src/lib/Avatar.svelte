<script lang="ts">
  import type { AvatarSize, AvatarVariant } from '../types';

  interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    premium?: boolean;
    variant?: AvatarVariant;
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
  let isLoading = $state(true);

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

  const initial = $derived(() => {
    // Use fallback if provided and not empty
    if (fallback && fallback.trim() && fallback !== '?') {
      return fallback;
    }
    // Use name if available - handle various undefined/null/empty cases
    if (name && typeof name === 'string' && name.trim() && name !== 'Anonymous' && name !== 'User' && name !== 'Unknown User') {
      return name.charAt(0).toUpperCase();
    }
    // Default fallback
    return '?';
  });
  
  function handleImageError() {
    imageError = true;
    isLoading = false;
  }
  
  function handleImageLoad() {
    isLoading = false;
    imageError = false;
  }
  
  // Reset error state when src changes
  $effect(() => {
    if (src) {
      imageError = false;
      isLoading = true;
    }
  });
  
  const shapeClass = $derived(
    variant === 'square' ? 'rounded-xl' : 'rounded-full'
  );
  
  // Clean up - removed unused premium classes
</script>

<div
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
  onclick={onclick}
  onkeydown={(e: KeyboardEvent) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
  class="relative block {sizeClasses[size]} {shapeClass} {premium ? 'ring-1 ring-violet-500' : ''} {onclick ? 'cursor-pointer' : 'cursor-default'} {className} overflow-hidden"
>
  {#if src && !imageError}
    <img 
      {src} 
      {alt}
      onerror={handleImageError}
      onload={handleImageLoad}
      class="w-full h-full object-cover"
    />
  {:else}
    <div class="flex items-center justify-center w-full h-full bg-gray-200">
      <span class="font-semibold text-gray-500 {textSizes[size]}">{initial()}</span>
    </div>
  {/if}
</div>