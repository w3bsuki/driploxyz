import { browser } from '$app/environment';

/**
 * Dynamic component loader with fallbacks and error handling
 */
export class ComponentLoader {
  private static cache = new Map<string, Promise<any>>();
  
  /**
   * Load component with caching and error handling
   */
  static async loadComponent<T>(
    importFn: () => Promise<{ default: T }>, 
    cacheKey: string,
    fallback?: T
  ): Promise<T | null> {
    if (!browser) return null;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      try {
        const module = await this.cache.get(cacheKey);
        return module.default;
      } catch (error) {
        console.warn(`Failed to load cached component ${cacheKey}:`, error);
        this.cache.delete(cacheKey);
      }
    }
    
    // Load component
    const loadPromise = importFn();
    this.cache.set(cacheKey, loadPromise);
    
    try {
      const module = await loadPromise;
      return module.default;
    } catch (error) {
      console.warn(`Failed to load component ${cacheKey}:`, error);
      this.cache.delete(cacheKey);
      return fallback || null;
    }
  }
  
  /**
   * Preload component without waiting for result
   */
  static preloadComponent(importFn: () => Promise<any>, cacheKey: string): void {
    if (!browser || this.cache.has(cacheKey)) return;
    
    this.cache.set(cacheKey, importFn());
  }
  
  /**
   * Clear cache (useful for development)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Lazy loading for heavy UI components
 */
export const lazyUIComponents = {
  // Product components
  ProductGallery: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/ProductGallery'),
    'ProductGallery'
  ),
  
  ProductQuickView: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/ProductQuickView'),
    'ProductQuickView'
  ),
  
  VirtualProductGrid: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/VirtualProductGrid'),
    'VirtualProductGrid'
  ),
  
  // Payment components
  PaymentForm: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/PaymentForm'),
    'PaymentForm'
  ),
  
  CheckoutSummary: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/CheckoutSummary'),
    'CheckoutSummary'
  ),
  
  // Order components
  OrderTimeline: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/OrderTimeline'),
    'OrderTimeline'
  ),
  
  OrderActions: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/OrderActions'),
    'OrderActions'
  ),
  
  // Upload components
  ImageUploader: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/ImageUploader'),
    'ImageUploader'
  ),
  
  ImageUploaderSupabase: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/ImageUploaderSupabase'),
    'ImageUploaderSupabase'
  ),
  
  // Onboarding components
  WelcomeModal: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/WelcomeModal'),
    'WelcomeModal'
  ),
  
  OnboardingStep: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/OnboardingStep'),
    'OnboardingStep'
  ),
  
  // Review components
  ReviewModal: () => ComponentLoader.loadComponent(
    () => import('@repo/ui/ReviewModal'),
    'ReviewModal'
  )
};

/**
 * Preload components for specific routes
 */
export function preloadRouteComponents(pathname: string): void {
  if (!browser) return;
  
  // Define route component mappings
  const routeComponents: Record<string, Array<keyof typeof lazyUIComponents>> = {
    '/product': ['ProductGallery', 'ProductQuickView'],
    '/search': ['VirtualProductGrid'],
    '/checkout': ['PaymentForm', 'CheckoutSummary'],
    '/orders': ['OrderTimeline', 'OrderActions'],
    '/sell': ['ImageUploader', 'ImageUploaderSupabase'],
    '/dashboard': ['OrderTimeline', 'ReviewModal'],
    '/onboarding': ['WelcomeModal', 'OnboardingStep']
  };
  
  // Find matching route pattern
  const matchingRoute = Object.keys(routeComponents).find(pattern => 
    pathname.startsWith(pattern)
  );
  
  if (matchingRoute) {
    routeComponents[matchingRoute].forEach(componentName => {
      // Use requestIdleCallback for non-critical preloading
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => lazyUIComponents[componentName]());
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => lazyUIComponents[componentName](), 1);
      }
    });
  }
}

/**
 * Setup automatic route-based preloading
 */
export function setupRouteBasedPreloading(): void {
  if (!browser) return;
  
  // Preload on hover with slight delay to avoid excessive loading
  let hoverTimeout: number;
  
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      clearTimeout(hoverTimeout);
      hoverTimeout = window.setTimeout(() => {
        const pathname = new URL(link.href).pathname;
        preloadRouteComponents(pathname);
      }, 150); // Small delay to prevent excessive preloading
    }
  });
  
  // Clear timeout on mouse leave
  document.addEventListener('mouseout', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link) {
      clearTimeout(hoverTimeout);
    }
  });
  
  // Also preload on focus for keyboard navigation
  document.addEventListener('focusin', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      const pathname = new URL(link.href).pathname;
      preloadRouteComponents(pathname);
    }
  });
}