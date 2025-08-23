/**
 * Intersection Observer for lazy loading components
 */
export declare function createLazyLoader(callback: () => void, options?: IntersectionObserverInit): (node: Element) => {
    destroy(): void;
};
/**
 * Virtual scrolling utility for large lists
 */
export declare class VirtualList {
    private container;
    private items;
    private itemHeight;
    private visibleCount;
    private scrollTop;
    private startIndex;
    private endIndex;
    constructor(container: HTMLElement, items: any[], itemHeight: number, visibleCount: number);
    onScroll: (event: Event) => void;
    private updateVisibleRange;
    getVisibleItems(): any[];
    getOffsetY(): number;
    getTotalHeight(): number;
}
/**
 * Debounce function for performance optimization
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function for scroll handlers
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Bundle splitting utility for dynamic imports
 */
export declare function loadComponent<T>(importFn: () => Promise<{
    default: T;
}>, fallback?: T): Promise<T>;
/**
 * Image lazy loading with IntersectionObserver
 */
export declare function lazyLoadImages(selector?: string): void;
/**
 * Preload critical resources
 */
export declare function preloadCriticalResources(resources?: string[]): void;
/**
 * Performance monitoring utilities
 */
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    static getInstance(): PerformanceMonitor;
    startTiming(key: string): void;
    endTiming(key: string): number;
    measureComponent<T extends (...args: any[]) => any>(componentName: string, fn: T): T;
}
//# sourceMappingURL=performance.d.ts.map