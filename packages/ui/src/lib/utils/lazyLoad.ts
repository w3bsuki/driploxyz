/**
 * Lazy loading utility for performance optimization
 */

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * Create an intersection observer for lazy loading
 */
export function createLazyLoad(
  callback: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void,
  options: LazyLoadOptions = {}
) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true
  } = options;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry, obs);
        if (once) {
          obs.unobserve(entry.target);
        }
      }
    });
  }, {
    rootMargin,
    threshold
  });

  return observer;
}

/**
 * Svelte action for lazy loading elements when they enter viewport
 */
export function lazyLoad(
  element: HTMLElement, 
  callback?: () => void | Promise<void>
) {
  const observer = createLazyLoad(async () => {
    if (callback) {
      await callback();
    }
  });

  observer.observe(element);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Performance-optimized intersection observer for multiple elements
 */
export class BatchIntersectionObserver {
  private observer: IntersectionObserver;
  private callbacks = new WeakMap<Element, () => void | Promise<void>>();

  constructor(options: LazyLoadOptions = {}) {
    const { rootMargin = '50px', threshold = 0.1 } = options;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            await callback();
            this.unobserve(entry.target);
          }
        }
      });
    }, { rootMargin, threshold });
  }

  observe(element: Element, callback: () => void | Promise<void>) {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
    this.callbacks = new WeakMap();
  }
}