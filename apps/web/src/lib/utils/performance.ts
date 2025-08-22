import { preloadData } from '$app/navigation';
import {
  createLazyLoader as sharedCreateLazyLoader,
  loadComponent as sharedLoadComponent,
  debounce as sharedDebounce,
  throttle as sharedThrottle,
  lazyLoadImages as sharedLazyLoadImages,
  preloadCriticalResources as sharedPreloadCriticalResources,
  VirtualList,
  PerformanceMonitor
} from '@repo/ui';

/**
 * Prefetch data for a route when hovering over a link
 * SvelteKit-specific utility
 */
export function prefetchRoute(route: string) {
  return {
    onmouseenter: () => preloadData(route),
    ontouchstart: () => preloadData(route)
  };
}

// Re-export shared performance utilities
export const createLazyLoader = sharedCreateLazyLoader;
export const loadComponent = sharedLoadComponent;
export const debounce = sharedDebounce;
export const throttle = sharedThrottle;
export const lazyLoadImages = sharedLazyLoadImages;
export const preloadCriticalResources = sharedPreloadCriticalResources;
export { VirtualList, PerformanceMonitor };