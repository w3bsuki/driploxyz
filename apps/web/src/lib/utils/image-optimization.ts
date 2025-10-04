/**
 * Image optimization utilities for better performance
 */

// Image quality settings based on device pixel ratio
export const getOptimalImageQuality = (devicePixelRatio = window.devicePixelRatio || 1): number => {
  if (devicePixelRatio >= 3) return 90; // 3x displays
  if (devicePixelRatio >= 2) return 80; // 2x displays
  return 85; // Standard displays
};

// Generate responsive image sizes
export const generateResponsiveImageSizes = (originalWidth: number, originalHeight: number) => {
  const aspectRatio = originalHeight / originalWidth;
  
  return {
    // Small screens (mobile)
    small: { width: 320, height: Math.round(320 * aspectRatio) },
    // Medium screens (tablet)
    medium: { width: 768, height: Math.round(768 * aspectRatio) },
    // Large screens (desktop)
    large: { width: 1200, height: Math.round(1200 * aspectRatio) },
    // Extra large screens
    xlarge: { width: 1920, height: Math.round(1920 * aspectRatio) }
  };
};

// Generate srcset for responsive images
export const generateSrcSet = (baseUrl: string, sizes: Record<string, { width: number, height: number }>) => {
  return Object.entries(sizes)
    .map(([_name, size]) => `${baseUrl}?w=${size.width}&q=${getOptimalImageQuality()} ${size.width}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizesAttribute = (sizes: Record<string, { width: number, height: number }>) => {
  return Object.entries(sizes)
    .map(([name, _size]) => {
      switch (name) {
        case 'small': return '(max-width: 640px) 320px';
        case 'medium': return '(max-width: 1024px) 768px';
        case 'large': return '(max-width: 1440px) 1200px';
        case 'xlarge': return '1920px';
        default: return '100vw';
      }
    })
    .join(', ');
};

// Lazy load images with Intersection Observer
export const createLazyImageLoader = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Load the actual image
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        // Load srcset if available
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        
        // Add fade-in effect
        img.classList.add('loaded');
        
        // Stop observing this image
        createLazyImageLoader()?.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before it comes into view
    threshold: 0.01
  });
};

// Preload critical images
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.setAttribute('importance', 'high');
    } else {
      link.setAttribute('importance', 'low');
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
};

// Optimize image for web delivery
export const optimizeImageUrl = (
  originalUrl: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'auto';
    crop?: string;
  } = {}
): string => {
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format && options.format !== 'auto') params.append('f', options.format);
  if (options.crop) params.append('c', options.crop);
  
  const paramString = params.toString();
  return paramString ? `${originalUrl}?${paramString}` : originalUrl;
};

// Create WebP image URL with fallback
export const createWebPWithFallback = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): {
  webp: string;
  fallback: string;
} => {
  const webpUrl = optimizeImageUrl(originalUrl, { ...options, format: 'webp' });
  const fallbackUrl = optimizeImageUrl(originalUrl, { ...options, format: 'auto' });
  
  return { webp: webpUrl, fallback: fallbackUrl };
};

// Progressive image loading (blur to sharp)
export const createProgressiveImageLoader = (
  lowQualitySrc: string,
  highQualitySrc: string
) => {
  const img = new Image();
  
  // Load low quality image first
  img.src = lowQualitySrc;
  
  // Once loaded, load high quality image
  img.onload = () => {
    const highQualityImg = new Image();
    highQualityImg.src = highQualitySrc;
    highQualityImg.onload = () => {
      // Swap images once high quality is loaded
      const imageElements = document.querySelectorAll(`[data-progressive-src="${highQualitySrc}"]`) as NodeListOf<HTMLImageElement>;
      imageElements.forEach((element) => {
        element.src = highQualitySrc;
        element.classList.add('loaded');
      });
    };
  };
};

// Image placeholder generator
export const generatePlaceholderImage = (
  width: number,
  height: number,
  text?: string,
  bgColor = '#f3f4f6',
  textColor = '#9ca3af'
): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${text ? `<text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" dy=".3em">${text}</text>` : ''}
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Image cache management
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private maxSize = 50; // Maximum number of images to cache
  
  get(key: string): HTMLImageElement | null {
    return this.cache.get(key) || null;
  }
  
  set(key: string, image: HTMLImageElement): void {
    // If cache is full, remove the oldest item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, image);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

// Critical image preloader
export const preloadCriticalImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(imageUrls.map(url => preloadImage(url, 'high')));
};

// Background image optimization
export const optimizeBackgroundImage = (imageUrl: string): string => {
  // Create a responsive background image set
  const sizes = generateResponsiveImageSizes(1920, 1080);
  const placeholder = generatePlaceholderImage(20, 20);
  const srcSet = generateSrcSet(imageUrl, sizes);
  
  return `background-image: url('${placeholder}'); background-image: -webkit-image-set(${srcSet}); background-image: image-set(${srcSet}); background-size: cover; background-position: center; background-repeat: no-repeat; transition: background-image 0.3s ease;`;
};

// Image component helper for Svelte
export const createImageProps = (
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    lazy?: boolean;
    priority?: 'high' | 'low';
    sizes?: string;
    srcset?: string;
    placeholder?: string;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    className?: string;
  } = {}
) => {
  const {
    width,
    height,
    lazy = true,
    priority = 'low',
    sizes: customSizes,
    srcset: customSrcset,
    placeholder: customPlaceholder,
    aspectRatio,
    objectFit = 'cover',
    className = ''
  } = options;
  
  // Generate responsive sizes if not provided
  const responsiveSizes = width && height ? generateResponsiveImageSizes(width, height) : null;
  
  // Generate srcset if not provided
  const generatedSrcset = src && responsiveSizes ? generateSrcSet(src, responsiveSizes) : customSrcset;
  
  // Generate sizes attribute if not provided
  const generatedSizes = responsiveSizes ? generateSizesAttribute(responsiveSizes) : customSizes;
  
  // Generate placeholder if not provided
  const generatedPlaceholder = customPlaceholder || (width && height 
    ? generatePlaceholderImage(width, height, 'Loading...') 
    : '');
  
  return {
    src,
    alt,
    width,
    height,
    srcset: generatedSrcset,
    sizes: generatedSizes,
    loading: lazy ? 'lazy' : 'eager',
    fetchpriority: priority,
    class: className,
    style: {
      aspectRatio,
      objectFit,
      backgroundImage: generatedPlaceholder ? `url('${generatedPlaceholder}')` : undefined
    }
  };
};