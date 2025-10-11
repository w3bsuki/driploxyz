<script lang="ts">
  // No lifecycle imports needed - using $effect

  interface Props {
    src: string;
    alt: string;
    class?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    priority?: boolean;
    fallback?: string;
    placeholder?: string;
  }

  let {
    src,
    alt,
    class: className = '',
    width,
    height,
    loading = 'lazy',
    priority = false,
    fallback = '/placeholder-image.svg',
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
  }: Props = $props();

  let imgElement: HTMLImageElement;
  let isLoaded = $state(false);
  let isError = $state(false);
  let currentSrc = $state(placeholder);
  let isIntersecting = $state(false);

  // Load image immediately if priority is true or loading is eager
  let shouldLoadImmediately = priority || loading === 'eager';

  $effect(() => {
    if (shouldLoadImmediately) {
      loadImage();
      return;
    }

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isIntersecting = true;
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
      observer.disconnect();
    };
  });

  function loadImage() {
    const img = new Image();

    img.onload = () => {
      currentSrc = src;
      isLoaded = true;
      isError = false;
    };

    img.onerror = () => {
      currentSrc = fallback;
      isError = true;
      isLoaded = true;
    };

    // Set sizes for responsive images
    if (width && height) {
      img.width = width;
      img.height = height;
    }

    img.src = src;
  }

  // Handle image error after it's loaded
  function handleError() {
    if (!isError) {
      currentSrc = fallback;
      isError = true;
    }
  }
</script>

<img
  bind:this={imgElement}
  src={currentSrc}
  {alt}
  class={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
  {width}
  {height}
  loading={priority ? 'eager' : 'lazy'}
  decoding={priority ? 'sync' : 'async'}
  onerror={handleError}
  style={!isLoaded && width && height ? `aspect-ratio: ${width}/${height}` : undefined}
/>

<style>
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  /* Prevent layout shift during loading */
  img[width][height] {
    width: auto;
    height: auto;
    max-width: 100%;
  }
</style>