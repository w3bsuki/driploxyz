import { browser } from '$app/environment';
import { loadComponent } from '@repo/ui/utils/performance';
import { setupRouteBasedPreloading, preloadRouteComponents } from './dynamic-components';

/**
 * Lazy load heavy components for route-based code splitting
 */
export const lazyComponents = {
  QuickViewDialog: () => browser 
    ? loadComponent(() => import('$lib/components/QuickViewDialog.svelte'))
    : Promise.resolve(null),

  // Heavy UI components
  ProductGallery: () => browser
    ? loadComponent(() => import('@repo/ui/ProductGallery'))
    : Promise.resolve(null),
    
  VirtualProductGrid: () => browser
    ? loadComponent(() => import('@repo/ui/VirtualProductGrid'))
    : Promise.resolve(null),
    
  PaymentForm: () => browser
    ? loadComponent(() => import('@repo/ui/PaymentForm'))
    : Promise.resolve(null),
    
  CheckoutSummary: () => browser
    ? loadComponent(() => import('@repo/ui/CheckoutSummary'))
    : Promise.resolve(null),
    
  OrderTimeline: () => browser
    ? loadComponent(() => import('@repo/ui/OrderTimeline'))
    : Promise.resolve(null),
    
  ImageUploader: () => browser
    ? loadComponent(() => import('@repo/ui/ImageUploader'))
    : Promise.resolve(null),
    
  WelcomeModal: () => browser
    ? loadComponent(() => import('@repo/ui/WelcomeModal'))
    : Promise.resolve(null)
};

/**
 * Preload component bundles on hover/focus for instant loading
 */
export function preloadComponent(componentName: keyof typeof lazyComponents) {
  if (!browser) return;
  
  // Start loading the component bundle
  lazyComponents[componentName]();
}

/**
 * Route-based chunk prefetching
 */
export function prefetchRouteChunks(route: string) {
  if (!browser) return;
  
  // Map routes to their heavy components
  const routeComponents: Record<string, Array<keyof typeof lazyComponents>> = {
    '/product': ['QuickViewDialog', 'ProductGallery'],
    '/search': ['VirtualProductGrid'],
    '/checkout': ['PaymentForm', 'CheckoutSummary'],
    '/orders': ['OrderTimeline'],
    '/sell': ['ImageUploader'],
    '/dashboard': ['OrderTimeline'],
    '/onboarding': ['WelcomeModal']
  };
  
  // Find matching route pattern
  const matchingRoute = Object.keys(routeComponents).find(pattern => 
    route.startsWith(pattern)
  );
  
  if (matchingRoute) {
    // Prefetch all components for this route
    routeComponents[matchingRoute].forEach(component => {
      requestIdleCallback(() => preloadComponent(component));
    });
  }
}

/**
 * Progressive enhancement for route transitions
 */
export function setupRoutePreloading() {
  if (!browser) return;
  
  // Use the enhanced route-based preloading system
  setupRouteBasedPreloading();
  
  // Legacy support - still prefetch route chunks
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      const pathname = new URL(link.href).pathname;
      prefetchRouteChunks(pathname);
      preloadRouteComponents(pathname);
    }
  });
  
  // Preload on link focus (keyboard navigation)
  document.addEventListener('focusin', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      const pathname = new URL(link.href).pathname;
      prefetchRouteChunks(pathname);
      preloadRouteComponents(pathname);
    }
  });
}