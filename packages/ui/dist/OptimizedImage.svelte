<script lang="ts">
  import { browser } from '$app/environment';
  import { createLazyLoader } from './utils/performance.js';
  
  interface Props {
    src: string;
    alt: string;
    class?: string;
    aspectRatio?: 'square' | 'auto';
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    sizes?: string;
    onclick?: () => void;
    showSkeleton?: boolean;
    fetchpriority?: 'high' | 'low' | 'auto';
    width?: number;
    quality?: number;
    blurDataUrl?: string;
  }

  let { 
    src,
    alt,
    class: className = '',
    aspectRatio = 'auto',
    loading = 'lazy',
    placeholder = '/placeholder-product.svg',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onclick,
    showSkeleton = false,
    fetchpriority = 'auto',
    width = 800,
    quality = 75,
    blurDataUrl
  }: Props = $props();

  let isLoaded = $state(false);
  let isInView = $state(false);
  let hasError = $state(false);
  let imgElement: HTMLImageElement;

  // Generate WebP URL from Supabase
  function getOptimizedUrl(originalSrc: string, size?: number): string {
    if (!originalSrc || originalSrc === placeholder) return originalSrc;
    
    // If it's a Supabase URL, add transformation parameters for WebP
    if (originalSrc.includes('supabase.co')) {
      const url = new URL(originalSrc);
      // Supabase Storage supports on-the-fly transformations
      url.searchParams.set('width', (size || width).toString());
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return originalSrc;
  }

  // Generate thumbnail for blur-up effect
  const thumbnailSrc = $derived(getOptimizedUrl(src, 40));
  const optimizedSrc = $derived(getOptimizedUrl(src));
  
  // Actual src to use (depends on lazy loading state)
  const currentSrc = $derived(
    loading === 'eager' || isInView ? optimizedSrc : thumbnailSrc
  );

  // Setup lazy loading with IntersectionObserver
  function setupLazyLoading(node: HTMLElement) {
    if (!browser || loading === 'eager') {
      isInView = true;
      return;
    }

    const lazyLoader = createLazyLoader(() => {
      isInView = true;
    }, {
      rootMargin: '50px',
      threshold: 0
    });

    return lazyLoader(node);
  }

  // Handle image load
  function handleLoad() {
    isLoaded = true;
    hasError = false;
  }

  // Handle image error
  function handleError() {
    hasError = true;
    isLoaded = true;
  }
</script>

<div 
  use:setupLazyLoading
  class="relative overflow-hidden {aspectRatio === 'square' ? 'aspect-square' : ''} {onclick ? 'cursor-pointer' : ''} {className}"
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  {onclick}
  onkeydown={(e) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
>
  {#if !isLoaded && showSkeleton}
    <div class="absolute inset-0 bg-gray-200 animate-pulse" />
  {/if}
  
  {#if hasError}
    <img
      src={placeholder}
      {alt}
      class="w-full h-full object-cover"
    />
  {:else}
    <picture>
      <!-- WebP version -->
      <source 
        srcset={currentSrc}
        type="image/webp"
        {sizes}
      />
      <!-- Fallback to original -->
      <img
        bind:this={imgElement}
        src={currentSrc}
        {alt}
        {sizes}
        loading={loading}
        decoding="async"
        {fetchpriority}
        onload={handleLoad}
        onerror={handleError}
        class="w-full h-full object-cover transition-opacity duration-300 {!isLoaded ? 'opacity-0' : 'opacity-100'}"
        style="display: block !important; {blurDataUrl && !isLoaded ? `filter: blur(20px);` : ''}"
      />
    </picture>
  {/if}
</div>

<style>
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
</style>