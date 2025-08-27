<script lang="ts">
  import { onMount } from 'svelte';

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
    blurPlaceholder?: boolean;
    priority?: boolean;
    quality?: number;
    width?: number;
    height?: number;
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
    showSkeleton = true,
    blurPlaceholder = true,
    priority = false,
    quality = 85,
    width,
    height
  }: Props = $props();

  let imageElement: HTMLImageElement;
  let containerElement: HTMLDivElement;
  let imageLoaded = $state(false);
  let imageError = $state(false);
  let inView = $state(false);
  let observer: IntersectionObserver | undefined;

  // Images are already optimized during upload - no runtime transformations needed
  // This prevents unnecessary Supabase egress charges
  const imageSource = $derived(src || placeholder);

  // Generate blur data URL for placeholder
  const blurDataUrl = $derived(() => {
    if (!blurPlaceholder) return '';
    
    // Simple blur placeholder - in a real app you'd generate this server-side
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjFmNWY5Ii8+Cjwvc3ZnPgo=';
  });

  function handleLoad() {
    imageLoaded = true;
    imageError = false;
  }

  function handleError() {
    imageError = true;
    imageLoaded = false;
  }

  function handleClick() {
    onclick?.();
  }

  // Setup intersection observer for lazy loading
  onMount(() => {
    if (!priority && loading === 'lazy' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              inView = true;
              observer?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px before image comes into view
        }
      );

      if (containerElement) {
        observer.observe(containerElement);
      }
    } else {
      // Load immediately for priority images or when intersection observer is not supported
      inView = true;
    }

    return () => {
      observer?.disconnect();
    };
  });

  // Computed classes for aspect ratio and styling
  const containerClasses = $derived(
    `relative overflow-hidden ${aspectRatio === 'square' ? 'aspect-square' : ''} ${onclick ? 'cursor-pointer' : ''} ${className}`.trim()
  );

  // Show skeleton when we should show skeleton AND image hasn't loaded yet AND no error
  const shouldShowSkeleton = $derived(showSkeleton && !imageLoaded && !imageError);
  
  // Determine if we should load the image
  const shouldLoadImage = $derived(priority || inView);
</script>

<div 
  bind:this={containerElement}
  class={containerClasses}
  onclick={handleClick}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={(e) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
>
  <!-- Blur Placeholder Background -->
  {#if blurPlaceholder && blurDataUrl && !imageLoaded}
    <img
      src={blurDataUrl}
      alt=""
      class="absolute inset-0 w-full h-full object-cover scale-110 filter blur-sm"
      aria-hidden="true"
    />
  {/if}

  <!-- Animated Shimmer Skeleton Loading State -->
  {#if shouldShowSkeleton}
    <div class="skeleton-container absolute inset-0">
      <div class="skeleton-shimmer"></div>
      <!-- Optional placeholder image overlay -->
      {#if placeholder && !blurPlaceholder}
        <img
          src={placeholder}
          alt=""
          class="absolute inset-0 w-full h-full object-cover opacity-20"
          aria-hidden="true"
        />
      {/if}
    </div>
  {/if}

  <!-- Optimized Image with WebP Support -->
  {#if shouldLoadImage}
    <!-- Images are already WebP optimized during upload -->
    <img
      bind:this={imageElement}
      src={imageSource}
      {alt}
      {sizes}
      {width}
      {height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onload={handleLoad}
      onerror={handleError}
      class="w-full h-full object-cover {imageLoaded ? 'opacity-100' : 'opacity-0'}"
    />
  {/if}

  <!-- Error State with Retry -->
  {#if imageError && !imageLoaded}
    <div class="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
      <span class="text-xs font-medium">Image unavailable</span>
      <button 
        class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        onclick={() => {
          imageError = false;
          imageLoaded = false;
          if (imageElement) {
            imageElement.src = imageSource;
          }
        }}
      >
        Retry
      </button>
    </div>
  {/if}
</div>

<style>
  /* Simple Skeleton - No Animations */
  .skeleton-container {
    background: #f1f5f9;
    border-radius: 0; /* Inherit container border radius */
    position: relative;
    overflow: hidden;
  }

  .skeleton-shimmer {
    display: none; /* Removed for speed optimization */
  }

  /* Performance optimizations */
  img {
    contain: layout style;
  }

  /* No animations - optimized for speed */

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .skeleton-container {
      background: #e5e7eb;
    }
    
    /* No shimmer animations */
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .skeleton-container {
      background: linear-gradient(110deg, #374151 8%, #4b5563 18%, #374151 33%);
    }
  }
</style>