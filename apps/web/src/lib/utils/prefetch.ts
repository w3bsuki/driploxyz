import { browser } from '$app/environment';

/**
 * Resource prefetching utilities for performance optimization
 */
export class PrefetchManager {
  private static prefetchedResources = new Set<string>();
  
  /**
   * Prefetch a resource (image, script, style, etc.)
   */
  static prefetchResource(url: string, type: 'image' | 'script' | 'style' | 'font' = 'image'): void {
    if (!browser || this.prefetchedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    // Set appropriate attributes based on resource type
    switch (type) {
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'image':
      default:
        link.as = 'image';
        break;
    }
    
    document.head.appendChild(link);
    this.prefetchedResources.add(url);
  }
  
  /**
   * Preload critical resources immediately
   */
  static preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font' = 'image'): void {
    if (!browser || this.prefetchedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'image':
      default:
        link.as = 'image';
        break;
    }
    
    document.head.appendChild(link);
    this.prefetchedResources.add(url);
  }
  
  /**
   * Prefetch critical homepage resources
   */
  static prefetchHomepageAssets(): void {
    if (!browser) return;
    
    const criticalAssets = [
      // Placeholder and common images
      { url: '/placeholder-product.svg', type: 'image' as const },
      // Critical fonts
      { url: '/fonts/inter-var.woff2', type: 'font' as const },
      // Common icons (if any)
    ];
    
    criticalAssets.forEach(({ url, type }) => {
      this.preloadResource(url, type);
    });
  }
  
  /**
   * Prefetch assets for specific routes
   */
  static prefetchRouteAssets(pathname: string): void {
    if (!browser) return;
    
    const routeAssets: Record<string, Array<{ url: string; type: 'image' | 'script' | 'style' | 'font' }>> = {
      '/product': [
        { url: '/placeholder-product.svg', type: 'image' },
      ],
      '/search': [
        { url: '/placeholder-product.svg', type: 'image' },
      ],
      '/checkout': [
        // Stripe will be loaded dynamically
      ],
    };
    
    // Find matching route pattern
    const matchingRoute = Object.keys(routeAssets).find(pattern => 
      pathname.startsWith(pattern)
    );
    
    if (matchingRoute) {
      routeAssets[matchingRoute].forEach(({ url, type }) => {
        this.prefetchResource(url, type);
      });
    }
  }
  
  /**
   * Setup automatic asset prefetching based on user interactions
   */
  static setupAutoPrefetch(): void {
    if (!browser) return;
    
    // Prefetch on hover with debouncing
    let hoverTimeout: number;
    
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link?.href && link.origin === window.location.origin) {
        clearTimeout(hoverTimeout);
        hoverTimeout = window.setTimeout(() => {
          const pathname = new URL(link.href).pathname;
          this.prefetchRouteAssets(pathname);
        }, 100);
      }
    });
    
    // Clear timeout on mouseout
    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
    
    // Also prefetch on focus
    document.addEventListener('focusin', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link?.href && link.origin === window.location.origin) {
        const pathname = new URL(link.href).pathname;
        this.prefetchRouteAssets(pathname);
      }
    });
    
    // Prefetch common assets on idle
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.prefetchHomepageAssets();
      });
    } else {
      setTimeout(() => {
        this.prefetchHomepageAssets();
      }, 1000);
    }
  }
  
  /**
   * Clear prefetch cache (for development)
   */
  static clearCache(): void {
    this.prefetchedResources.clear();
  }
}

/**
 * Utility for prefetching route data
 */
export function prefetchRoute(href: string) {
  if (!browser) return {};
  
  return {
    onmouseenter: () => {
      // Use SvelteKit's built-in prefetching
      import('$app/navigation').then(({ preloadData }) => {
        preloadData(href).catch(() => {
          // Ignore prefetch errors
        });
      });
    }
  };
}

/**
 * Initialize all prefetch strategies
 */
export function initializePrefetch(): void {
  if (!browser) return;
  
  PrefetchManager.setupAutoPrefetch();
}