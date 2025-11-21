<!--
  Optimized Image Component with Lazy Loading and Responsive Sizing
  Implements modern image loading best practices for performance
-->

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    sizes?: string;
    srcset?: string;
    placeholder?: string;
    blurDataUrl?: string;
    priority?: boolean; // For above-the-fold images
    quality?: number;
    class?: string;
    style?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
    onError?: () => void;
  }

  let {
    src,
    alt,
    width,
    height,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    srcset,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
    blurDataUrl,
    priority = false,
    quality = 80,
    class: className = '',
    style = '',
    objectFit = 'cover',
    loading = 'lazy',
    onLoad,
    onError
  }: Props = $props();

  // State management using Svelte 5 runes
  let isLoaded = $state(false);
  let isError = $state(false);
  let isIntersecting = $state(false);
  // Image ref not needed for current logic
  let containerElement = $state<HTMLDivElement>();

  // Intersection Observer for lazy loading
  let intersectionObserver: IntersectionObserver | null = null;

  // Generate responsive srcset if not provided
  const generateSrcset = (baseSrc: string) => {
    if (srcset) return srcset;

    // Generate common breakpoints
    const breakpoints = [480, 768, 1024, 1280, 1920];
    return breakpoints
      .map(w => {
        const optimizedSrc = optimizeImageUrl(baseSrc, w, quality);
        return `${optimizedSrc} ${w}w`;
      })
      .join(', ');
  };

  // Optimize image URL (assuming a service like Supabase Storage or ImageKit)
  const optimizeImageUrl = (url: string, width?: number, qual?: number) => {
    try {
      const urlObj = new URL(url);

      // For Supabase Storage
      if (urlObj.hostname.includes('supabase')) {
        if (width) urlObj.searchParams.set('width', width.toString());
        if (qual) urlObj.searchParams.set('quality', qual.toString());
        return urlObj.toString();
      }

      // For other CDNs, add appropriate parameters
      // This is a placeholder - adapt to your CDN
      return url;
    } catch {
      return url;
    }
  };

  // Get optimized image source
  const optimizedSrc = $derived(optimizeImageUrl(src, width, quality));
  const responsiveSrcset = $derived(generateSrcset(src));

  // Blur-up effect data URL
  const blurPlaceholder = $derived(
    blurDataUrl ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InBsYWNlaG9sZGVyIiBjeD0iNTAlIiBjeT0iNTAlIj48c3RvcCBzdG9wLWNvbG9yPSIjZjNmNGY2IiBzdG9wLW9wYWNpdHk9IjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNlNWU3ZWIiIHN0b3Atb3BhY2l0eT0iMSIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNwbGFjZWhvbGRlcikiLz48L3N2Zz4='
  );

  // Setup intersection observer for lazy loading
  const setupIntersectionObserver = () => {
    if (!browser || !('IntersectionObserver' in window) || priority) {
      isIntersecting = true;
      return;
    }

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isIntersecting = true;
            intersectionObserver?.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    if (containerElement) {
      intersectionObserver.observe(containerElement);
    }
  };

  // Handle image load success
  const handleLoad = () => {
    isLoaded = true;
    onLoad?.();
  };

  // Handle image load error
  const handleError = () => {
    isError = true;
    onError?.();
  };

  // Component lifecycle
  onMount(() => {
    if (priority) {
      // For critical images, load immediately
      isIntersecting = true;
    } else {
      setupIntersectionObserver();
    }
  });

  onDestroy(() => {
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
  });

  // Compute container styles
  const containerStyles = $derived.by(() => {
    let styles = style ?? '';

    if (width && height) {
      const aspectRatio = (height / width) * 100;
      styles += `; aspect-ratio: ${width} / ${height}; padding-bottom: ${aspectRatio}%;`;
    }

    return styles;
  });

  // Compute image styles
  const imageStyles = $derived.by(() => {
    let styles = `object-fit: ${objectFit};`;

    if (!isLoaded && blurDataUrl) {
      styles += ' filter: blur(5px); transition: filter 0.3s ease;';
    } else if (isLoaded) {
      styles += ' filter: none; transition: filter 0.3s ease;';
    }

    return styles;
  });
</script>

<div
  bind:this={containerElement}
  class="optimized-image-container {className}"
  style={containerStyles}
  role="img"
  aria-label={alt}
>
  <!-- Placeholder/Blur-up background -->
  {#if !isLoaded && (placeholder || blurDataUrl)}
    <div
      class="image-placeholder"
  style={`background-image: url(${blurPlaceholder}); background-size: cover; background-position: center;`}
    ></div>
  {/if}

  <!-- Main image - only load when intersecting -->
  {#if isIntersecting}
    <img
      src={optimizedSrc}
      srcset={responsiveSrcset}
      sizes={sizes}
      {alt}
      {width}
      {height}
      loading={priority ? 'eager' : loading}
      decoding="async"
      class="main-image"
  style={imageStyles}
      onload={handleLoad}
      onerror={handleError}
    />
  {/if}

  <!-- Error state -->
  {#if isError}
    <div class="error-state">
      <svg
        class="error-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <span class="error-text">Failed to load image</span>
    </div>
  {/if}

  <!-- Loading state for priority images -->
  {#if priority && !isLoaded && !isError}
    <div class="loading-state">
      <div class="loading-spinner"></div>
    </div>
  {/if}
</div>

<style>
  .optimized-image-container {
    position: relative;
    overflow: hidden;
    background-color: var(--surface-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .main-image {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
    display: block;
  }

  .error-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-subtle);
    z-index: 3;
  }

  .error-icon {
    width: var(--space-8);
    height: var(--space-8);
    margin-bottom: var(--space-2);
  }

  .error-text {
    font-size: var(--text-sm);
    text-align: center;
  }

  .loading-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .loading-spinner {
    width: var(--space-8);
    height: var(--space-8);
    border: 2px solid var(--border-subtle);
    border-top: 2px solid var(--state-focus);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Fade-in animation for loaded images */
  .main-image {
    opacity: 0;
    animation: fadeIn 0.3s ease-in-out forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  /* Responsive image scaling */
  @media (max-width: 768px) {
    .optimized-image-container {
      max-width: 100vw;
    }
  }

  /* High DPI display optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .optimized-image-container {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .main-image,
    .image-placeholder {
      transition: none !important;
      animation: none !important;
    }

    .loading-spinner {
      animation: none !important;
    }
  }

  /* Print styles */
  @media print {
    .optimized-image-container {
      break-inside: avoid;
    }
  }
</style>