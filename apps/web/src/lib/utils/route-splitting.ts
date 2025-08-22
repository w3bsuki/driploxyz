import { browser } from '$app/environment';
import { loadComponent } from '@repo/ui/utils/performance';

/**
 * Lazy load heavy components for route-based code splitting
 */
export const lazyComponents = {
  QuickViewDialog: () => browser 
    ? loadComponent(() => import('$lib/components/QuickViewDialog.svelte'))
    : Promise.resolve(null),
    
  // Future components for lazy loading
  // ProductDetailView: () => browser
  //   ? loadComponent(() => import('$lib/components/ProductDetailView.svelte'))
  //   : Promise.resolve(null),
    
  // CheckoutFlow: () => browser
  //   ? loadComponent(() => import('$lib/components/CheckoutFlow.svelte'))
  //   : Promise.resolve(null),
    
  // MessagingInterface: () => browser
  //   ? loadComponent(() => import('$lib/components/MessagingInterface.svelte'))
  //   : Promise.resolve(null)
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
    '/product': ['QuickViewDialog'],
    // '/checkout': ['CheckoutFlow'],
    // '/messages': ['MessagingInterface']
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
  
  // Preload on link hover
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      const pathname = new URL(link.href).pathname;
      prefetchRouteChunks(pathname);
    }
  });
  
  // Preload on link focus (keyboard navigation)
  document.addEventListener('focusin', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && link.origin === window.location.origin) {
      const pathname = new URL(link.href).pathname;
      prefetchRouteChunks(pathname);
    }
  });
}