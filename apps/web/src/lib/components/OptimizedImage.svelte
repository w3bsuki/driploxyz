<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    class?: string;
    loading?: 'lazy' | 'eager';
    sizes?: string;
    srcset?: string;
    placeholder?: string;
    blur?: boolean;
  }

  let {
    src,
    alt,
    width,
    height,
    class: className = '',
    loading = 'lazy',
    sizes,
    srcset,
    placeholder = '/placeholder-product.svg',
    blur = true
  }: Props = $props();

  let imageElement: HTMLImageElement;
  let isLoaded = $state(false);
  let isError = $state(false);
  let currentSrc = $state(loading === 'eager' ? src : placeholder);

  function handleLoad() {
    isLoaded = true;
    isError = false;
  }

  function handleError() {
    isError = true;
    isLoaded = false;
    currentSrc = placeholder;
  }

  // Intersection Observer for lazy loading
  onMount(() => {
    if (!browser || loading === 'eager') return;

    // If IntersectionObserver is not supported, load immediately
    if (!window.IntersectionObserver) {
      currentSrc = src;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && currentSrc === placeholder) {
            currentSrc = src;
            observer.unobserve(imageElement);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
        threshold: 0.01
      }
    );

    observer.observe(imageElement);

    return () => {
      observer.disconnect();
    };
  });
</script>

<img
  bind:this={imageElement}
  src={currentSrc}
  {alt}
  {width}
  {height}
  {sizes}
  {srcset}
  class="{className} {blur && !isLoaded && currentSrc === placeholder ? 'blur-sm' : ''} {isLoaded ? 'opacity-100' : 'opacity-90'} transition-all duration-300"
  style={width && height ? `aspect-ratio: ${width}/${height}` : undefined}
  onload={handleLoad}
  onerror={handleError}
  loading={loading}
  decoding="async"
/>

<style>
  img {
    background-color: #f3f4f6; /* Gray-100 fallback */
  }
</style>