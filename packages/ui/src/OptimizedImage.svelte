<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    fallback?: string;
    class?: string;
    onclick?: () => void;
  }

  let { 
    src,
    alt,
    width,
    height,
    sizes = '100vw',
    quality = 85,
    priority = false,
    loading = 'lazy',
    placeholder = '/placeholder-image.svg',
    fallback = '/placeholder-image.svg',
    class: className = '',
    onclick
  }: Props = $props();

  let imageLoaded = $state(false);
  let imageError = $state(false);
  let imgElement: HTMLImageElement;

  // Generate responsive image URLs (this would integrate with your image service)
  function generateSrcSet(baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]) {
    if (!baseSrc || baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
      return baseSrc;
    }

    // For demo purposes, returning the original src
    // In production, you'd integrate with an image optimization service like:
    // - Supabase Storage with transform params
    // - Cloudinary
    // - Next.js Image Optimization
    // - Custom image service
    return widths
      .map(w => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  }

  const srcSet = $derived(generateSrcSet(src));
  const currentSrc = $derived(imageError ? fallback : src);

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

  // Intersection Observer for lazy loading optimization
  let observer: IntersectionObserver | null = null;
  let isInView = $state(false);

  $effect(() => {
    if (!priority && imgElement && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isInView = true;
              observer?.disconnect();
            }
          });
        },
        { 
          rootMargin: '50px',
          threshold: 0.1 
        }
      );

      observer.observe(imgElement);
    } else {
      isInView = true;
    }

    return () => {
      observer?.disconnect();
    };
  });

  const shouldLoad = $derived(priority || isInView);
</script>

<div 
  class="optimized-image-container relative overflow-hidden {className}"
  class:cursor-pointer={onclick}
  onclick={handleClick}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
>
  <!-- Placeholder/Loading State -->
  {#if !imageLoaded && !imageError}
    <div 
      class="absolute inset-0 bg-gray-100 flex items-center justify-center"
      style={width && height ? `aspect-ratio: ${width}/${height}` : ''}
    >
      {#if placeholder}
        <img
          src={placeholder}
          alt=""
          class="w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      {:else}
        <div class="animate-pulse bg-gray-200 w-full h-full"></div>
      {/if}
    </div>
  {/if}

  <!-- Main Image -->
  <img
    bind:this={imgElement}
    src={shouldLoad ? currentSrc : placeholder}
    srcset={shouldLoad ? srcSet : undefined}
    {sizes}
    {alt}
    {width}
    {height}
    loading={priority ? 'eager' : loading}
    decoding="async"
    onload={handleLoad}
    onerror={handleError}
    class="w-full h-full object-cover transition-opacity duration-300
      {imageLoaded ? 'opacity-100' : 'opacity-0'}"
  />

  <!-- Error State -->
  {#if imageError && !imageLoaded}
    <div class="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-sm">Failed to load image</span>
    </div>
  {/if}

  <!-- Loading Indicator for Priority Images -->
  {#if priority && !imageLoaded && !imageError}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {/if}
</div>

<style>
  .optimized-image-container {
    /* Ensure proper aspect ratio handling */
    position: relative;
    display: block;
  }

  .optimized-image-container img {
    /* Prevent layout shift */
    max-width: 100%;
    height: auto;
  }

  /* Smooth loading animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .optimized-image-container img[data-loaded="true"] {
    animation: fadeIn 0.3s ease-in-out;
  }
</style>