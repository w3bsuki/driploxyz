/**
 * Image preloading utilities for performance optimization
 */

interface PreloadOptions {
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  as?: 'image';
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/**
 * Preload a single image with priority hints
 */
export function preloadImage(src: string, options: PreloadOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if image is already loaded
    if (isImageCached(src)) {
      resolve();
      return;
    }

    // Create preload link element
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    // Apply options
    if (options.fetchPriority) {
      link.setAttribute('fetchpriority', options.fetchPriority);
    }
    if (options.sizes) {
      link.setAttribute('imagesizes', options.sizes);
    }
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    // Handle load/error
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    // Add to document head
    document.head.appendChild(link);
  });
}

/**
 * Preload multiple images with priority
 */
export async function preloadImages(
  images: Array<{ src: string; options?: PreloadOptions }>,
  { concurrent = 3 } = {}
): Promise<void> {
  // Process in batches to avoid overwhelming the network
  for (let i = 0; i < images.length; i += concurrent) {
    const batch = images.slice(i, i + concurrent);
    await Promise.allSettled(
      batch.map(({ src, options }) => preloadImage(src, options))
    );
  }
}

/**
 * Check if image is likely cached by creating a test image
 */
function isImageCached(src: string): boolean {
  const img = new Image();
  img.src = src;
  return img.complete && img.naturalWidth > 0;
}

/**
 * Preload hero/critical images with high priority
 */
export function preloadHeroImages(images: string[], sizes?: string): Promise<void> {
  // Only preload the first 2-3 images to avoid waste
  const criticalImages = images.slice(0, 3).map(src => ({
    src,
    options: {
      fetchPriority: 'high' as const,
      sizes: sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px'
    }
  }));
  
  return preloadImages(criticalImages, { concurrent: 2 });
}

/**
 * Generate responsive image srcset for different densities
 */
export function generateResponsiveSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => `${addWidthParam(baseUrl, width)} ${width}w`)
    .join(', ');
}

/**
 * Add width parameter to image URL (works with common CDNs)
 */
function addWidthParam(url: string, width: number): string {
  try {
    const urlObj = new URL(url);
    
    // Handle common CDN patterns
    if (url.includes('supabase.co') || url.includes('amazonaws.com')) {
      // For Supabase/S3, you might need different transformation params
      return url; // Return original for now, can be enhanced based on your CDN
    }
    
    // Generic width parameter
    urlObj.searchParams.set('w', width.toString());
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Calculate optimal sizes attribute based on layout
 */
export function calculateImageSizes(breakpoints: {
  mobile?: number;  // vw units for mobile
  tablet?: number;  // vw units for tablet
  desktop?: number; // px for desktop
} = {}): string {
  const {
    mobile = 100,
    tablet = 50,
    desktop = 600
  } = breakpoints;

  return `(max-width: 640px) ${mobile}vw, (max-width: 1024px) ${tablet}vw, ${desktop}px`;
}

/**
 * Lazy image loading with intersection observer
 */
export function createLazyImageLoader(options: {
  rootMargin?: string;
  threshold?: number;
} = {}) {
  const { rootMargin = '50px', threshold = 0.1 } = options;

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }
        
        img.classList.remove('lazy');
        img.classList.add('loaded');
      }
    });
  }, { rootMargin, threshold });
}