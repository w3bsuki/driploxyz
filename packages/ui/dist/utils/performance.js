/**
 * Intersection Observer for lazy loading components
 */
export function createLazyLoader(callback, options = {}) {
    return function (node) {
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
    constructor(container, items, itemHeight, visibleCount) {
        this.scrollTop = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.onScroll = (event) => {
            const target = event.target;
            this.scrollTop = target.scrollTop;
            this.updateVisibleRange();
        };
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = visibleCount;
        this.endIndex = Math.min(visibleCount, items.length);
    }
    updateVisibleRange() {
        this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
        this.endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
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
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function for scroll handlers
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Bundle splitting utility for dynamic imports
 */
export async function loadComponent(importFn, fallback) {
    try {
        const module = await importFn();
        return module.default;
    }
    catch (error) {
        console.warn('Failed to load component:', error);
        return fallback || {};
    }
}
/**
 * Image lazy loading with IntersectionObserver
 */
export function lazyLoadImages(selector = 'img[data-src]') {
    if (!window.IntersectionObserver)
        return;
    const images = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
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
export function preloadCriticalResources(resources = []) {
    const criticalImages = [
        '/placeholder-product.svg',
        ...resources
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
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    startTiming(key) {
        this.metrics.set(key, performance.now());
    }
    endTiming(key) {
        const start = this.metrics.get(key);
        if (!start) {
            console.warn(`No start time found for key: ${key}`);
            return 0;
        }
        const duration = performance.now() - start;
        this.metrics.delete(key);
        if (duration > 100) {
            console.warn(`Performance warning: ${key} took ${duration.toFixed(2)}ms`);
        }
        return duration;
    }
    measureComponent(componentName, fn) {
        return ((...args) => {
            this.startTiming(componentName);
            const result = fn(...args);
            this.endTiming(componentName);
            return result;
        });
    }
}
