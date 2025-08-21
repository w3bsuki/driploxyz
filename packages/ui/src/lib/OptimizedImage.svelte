<script lang="ts">
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
    showSkeleton = true
  }: Props = $props();

  let imageLoaded = $state(false);
  let imageError = $state(false);

  // Generate WebP URLs for optimization
  const webpSources = $derived(() => {
    if (!src || src.includes('placeholder')) {
      return [];
    }

    const sources = [];
    
    // Try .webp extension replacement for Supabase images
    if (src.includes('supabase.co/storage') && /\.(jpe?g|png)$/i.test(src)) {
      const webpUrl = src.replace(/\.(jpe?g|png)$/i, '.webp');
      sources.push(webpUrl);
    }
    
    return sources;
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

  // Computed classes for aspect ratio and styling
  const containerClasses = $derived(
    `relative overflow-hidden ${aspectRatio === 'square' ? 'aspect-square' : ''} ${onclick ? 'cursor-pointer' : ''} ${className}`.trim()
  );

  // Show skeleton when we should show skeleton AND image hasn't loaded yet (regardless of error)
  const shouldShowSkeleton = $derived(showSkeleton && !imageLoaded);
</script>

<div 
  class={containerClasses}
  onclick={handleClick}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
>
  <!-- Simple Skeleton Loading State -->
  {#if shouldShowSkeleton}
    <div class="skeleton-container absolute inset-0">
      <!-- Optional placeholder image overlay -->
      {#if placeholder}
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
  {#if webpSources.length > 0}
    <picture>
      {#each webpSources as webpSrc}
        <source srcset={webpSrc} type="image/webp" {sizes} />
      {/each}
      <img
        {src}
        {alt}
        {sizes}
        loading={loading}
        decoding="async"
        onload={handleLoad}
        onerror={handleError}
        class="w-full h-full object-cover {imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200"
      />
    </picture>
  {:else}
    <!-- Standard Image -->
    <img
      {src}
      {alt}
      {sizes}
      loading={loading}
      decoding="async"
      onload={handleLoad}
      onerror={handleError}
      class="w-full h-full object-cover {imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200"
    />
  {/if}

  <!-- Error State -->
  {#if imageError && !imageLoaded}
    <div class="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
      <span class="text-xs font-medium">Image unavailable</span>
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
</style>