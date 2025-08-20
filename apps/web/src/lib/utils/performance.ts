import { preloadData } from '$app/navigation';

/**
 * Prefetch data for a route when hovering over a link
 */
export function prefetchRoute(route: string) {
  return {
    onmouseenter: () => preloadData(route),
    ontouchstart: () => preloadData(route)
  };
}

/**
 * Intersection Observer for lazy loading components
 */
export function createLazyLoader(callback: () => void, options: IntersectionObserverInit = {}) {
  return function(node: Element) {
    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      callback();
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '100px',
      ...options
    });
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  };
}

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualList {
  private container: HTMLElement;
  private items: any[];
  private itemHeight: number;
  private visibleCount: number;
  private scrollTop = 0;
  private startIndex = 0;
  private endIndex = 0;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    visibleCount: number
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.endIndex = Math.min(visibleCount, items.length);
  }

  onScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    this.scrollTop = target.scrollTop;
    this.updateVisibleRange();
  }

  private updateVisibleRange() {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    );
  }

  getVisibleItems() {
    return this.items.slice(this.startIndex, this.endIndex);
  }

  getOffsetY() {
    return this.startIndex * this.itemHeight;
  }

  getTotalHeight() {
    return this.items.length * this.itemHeight;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Code splitting utility - dynamically import components
 */
export function lazyImport<T>(importFn: () => Promise<{ default: T }>) {
  return async () => {
    const module = await importFn();
    return module.default;
  };
}

/**
 * Image lazy loading with IntersectionObserver
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if (!window.IntersectionObserver) return;
  
  const images = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  images.forEach(img => observer.observe(img));
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const criticalImages = [
    '/placeholder-product.svg',
    // Add other critical images here
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Bundle splitting utility for dynamic imports
 */
export async function loadComponent<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.warn('Failed to load component:', error);
    return fallback || ({} as T);
  }
}