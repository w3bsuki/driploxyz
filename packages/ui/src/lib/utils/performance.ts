/**
 * Performance utilities for Core Web Vitals optimization
 * Focus: LCP, CLS, INP improvements for mobile-first product pages
 */

// Image optimization helpers
export interface ResponsiveImageOptions {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Generate responsive image attributes with AVIF/WebP support
 */
export function generateResponsiveImage(options: ResponsiveImageOptions) {
  const { src, alt, sizes = '100vw', priority = false, aspectRatio } = options;
  
  // Generate different sizes for responsive images
  const widths = [320, 640, 768, 1024, 1280, 1920];
  
  // Create srcset with modern formats
  const createSrcSet = (format: 'webp' | 'avif' | 'jpg') => {
    return widths
      .map(width => {
        const url = transformImageUrl(src, { width, format });
        return `${url} ${width}w`;
      })
      .join(', ');
  };

  return {
    src: transformImageUrl(src, { width: 768, format: 'jpg' }), // Fallback
    srcSet: createSrcSet('jpg'),
    alt,
    sizes,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    ...(aspectRatio && { style: `aspect-ratio: ${aspectRatio}` }),
    // Add data attributes for intersection observer
    'data-src': src,
    'data-sizes': sizes
  };
}

/**
 * Transform image URL for different formats and sizes
 */
function transformImageUrl(src: string, options: { width?: number; format?: string } = {}) {
  // This would integrate with your image CDN (Supabase, Cloudinary, etc.)
  // For now, return original URL - implement based on your CDN
  const { width, format } = options;
  
  if (src.includes('supabase.co')) {
    // Supabase transform example
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (format && format !== 'jpg') params.set('format', format);
    
    const hasParams = params.toString();
    return hasParams ? `${src}?${params.toString()}` : src;
  }
  
  return src;
}

/**
 * Generate Low Quality Image Placeholder (LQIP) data URL
 */
export function generateBlurPlaceholder(_src: string): string {
  // Generate a small, blurred version as data URL
  // This would typically be done server-side or at build time
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2U1ZTdlYjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgLz48L3N2Zz4=';
}

/**
 * Intersection Observer for lazy loading components
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Preconnect to critical domains for faster resource loading
 */
export function preconnectDomains(domains: string[]) {
  domains.forEach(domain => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Critical resource hints for product pages
 */
export function addProductPageResourceHints() {
  // Add preconnect for common CDNs and APIs
  preconnectDomains([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // Add your Supabase/image CDN domains here
  ]);

  // Preload critical CSS if not already loaded
  if (!document.querySelector('link[rel="preload"][as="style"]')) {
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/app.css'; // Adjust path as needed
    criticalCSS.addEventListener('load', function() {
      this.rel = 'stylesheet';
    });
    document.head.appendChild(criticalCSS);
  }
}

/**
 * Optimize INP by debouncing rapid interactions
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
 * Throttle function for scroll/resize events
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
 * Prevent layout shifts by reserving space for dynamic content
 */
export function reserveSpace(element: HTMLElement, dimensions: { width?: number; height?: number }) {
  const { width, height } = dimensions;
  
  if (width) {
    element.style.minWidth = `${width}px`;
  }
  
  if (height) {
    element.style.minHeight = `${height}px`;
  }
  
  // Add a data attribute to track reserved space
  element.setAttribute('data-space-reserved', 'true');
}

/**
 * Enhanced Core Web Vitals monitoring with image performance tracking
 */
export interface WebVitalMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  imageLoadTime?: number;
  imageCount?: number;
  failedImages?: number;
  lcpImageUrl?: string;
}

export interface ImagePerformanceData {
  url: string;
  loadTime: number;
  naturalWidth: number;
  naturalHeight: number;
  isLCP: boolean;
  failed: boolean;
  timestamp: number;
}

class WebVitalsTracker {
  private metrics: WebVitalMetrics = {};
  private imageMetrics: ImagePerformanceData[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initTracking();
    }
  }

  private initTracking() {
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackImages();
  }

  private trackLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          
          // Check if LCP is an image and track it
          if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
            this.metrics.lcpImageUrl = lastEntry.element.src;
            this.markImageAsLCP(lastEntry.element.src);
          }
          
          this.reportMetric('lcp', this.metrics.lcp);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.debug('LCP tracking not supported');
    }
  }

  private trackFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.metrics.fid = fid;
          this.reportMetric('fid', fid);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.debug('FID tracking not supported');
    }
  }

  private trackCLS() {
    try {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            this.metrics.cls = clsScore;
            this.reportMetric('cls', clsScore);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.debug('CLS tracking not supported');
    }
  }

  private trackImages() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const isImage = entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ||
                         entry.name.includes('image') ||
                         entry.name.includes('supabase');
          
          if (isImage) {
            this.trackImageLoad({
              url: entry.name,
              loadTime: entry.duration,
              naturalWidth: 0,
              naturalHeight: 0,
              isLCP: false,
              failed: entry.duration === 0,
              timestamp: entry.startTime
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (e) {
      console.debug('Resource timing not supported');
    }
  }

  public trackImageLoad(data: ImagePerformanceData) {
    this.imageMetrics.push(data);
    
    this.metrics.imageCount = (this.metrics.imageCount || 0) + 1;
    if (data.failed) {
      this.metrics.failedImages = (this.metrics.failedImages || 0) + 1;
    }
    
    // Calculate average image load time
    const validImages = this.imageMetrics.filter(img => !img.failed && img.loadTime > 0);
    if (validImages.length > 0) {
      this.metrics.imageLoadTime = validImages.reduce((acc, img) => acc + img.loadTime, 0) / validImages.length;
    }
  }

  public markImageAsLCP(imageUrl: string) {
    const image = this.imageMetrics.find(img => img.url === imageUrl);
    if (image) {
      image.isLCP = true;
    }
  }

  private reportMetric(name: string, value: number) {
    // Report to analytics (modify for your analytics setup)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const status = this.getMetricStatus(name, value);
      console.log(`[Performance] ${name}: ${Math.round(value)}${name === 'cls' ? '' : 'ms'} (${status})`);
    }
  }

  private getMetricStatus(name: string, value: number): string {
    switch (name) {
      case 'lcp':
        return value <= PERFORMANCE_CONSTANTS.LCP_GOOD ? 'Good' : 
               value <= PERFORMANCE_CONSTANTS.LCP_NEEDS_IMPROVEMENT ? 'Needs Improvement' : 'Poor';
      case 'fid':
        return value <= PERFORMANCE_CONSTANTS.FID_GOOD ? 'Good' : 
               value <= PERFORMANCE_CONSTANTS.FID_NEEDS_IMPROVEMENT ? 'Needs Improvement' : 'Poor';
      case 'cls':
        return value <= PERFORMANCE_CONSTANTS.CLS_GOOD ? 'Good' : 
               value <= PERFORMANCE_CONSTANTS.CLS_NEEDS_IMPROVEMENT ? 'Needs Improvement' : 'Poor';
      default:
        return 'Unknown';
    }
  }

  public getMetrics(): WebVitalMetrics & { images: ImagePerformanceData[] } {
    return {
      ...this.metrics,
      images: this.imageMetrics
    };
  }

  public getPerformanceReport() {
    const recommendations: string[] = [];
    
    // Add recommendations based on metrics
    if (this.metrics.lcp && this.metrics.lcp > PERFORMANCE_CONSTANTS.LCP_GOOD) {
      recommendations.push('Consider preloading critical images or optimizing LCP element');
    }
    
    if (this.metrics.cls && this.metrics.cls > PERFORMANCE_CONSTANTS.CLS_GOOD) {
      recommendations.push('Add explicit dimensions to images to prevent layout shift');
    }
    
    const failureRate = this.metrics.failedImages && this.metrics.imageCount 
      ? (this.metrics.failedImages / this.metrics.imageCount) * 100 
      : 0;
    
    if (failureRate > 5) {
      recommendations.push('High image failure rate - check image URLs and CDN');
    }

    return {
      coreWebVitals: {
        lcp: this.metrics.lcp ? `${Math.round(this.metrics.lcp)}ms` : 'Not measured',
        fid: this.metrics.fid ? `${Math.round(this.metrics.fid)}ms` : 'Not measured',
        cls: this.metrics.cls ? this.metrics.cls.toFixed(3) : 'Not measured'
      },
      imagePerformance: {
        totalImages: this.metrics.imageCount || 0,
        failedImages: this.metrics.failedImages || 0,
        averageLoadTime: this.metrics.imageLoadTime ? `${Math.round(this.metrics.imageLoadTime)}ms` : 'Not measured',
        lcpImage: this.metrics.lcpImageUrl || 'Not detected'
      },
      recommendations
    };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global tracker instance
let webVitalsTracker: WebVitalsTracker;

export function getWebVitalsTracker(): WebVitalsTracker {
  if (!webVitalsTracker && typeof window !== 'undefined') {
    webVitalsTracker = new WebVitalsTracker();
  }
  return webVitalsTracker;
}

// Legacy function for backward compatibility
export function measureWebVitals() {
  return getWebVitalsTracker();
}

// Utility functions for manual image tracking
export function trackImageLoadStart(imageUrl: string): number {
  return performance.now();
}

export function trackImageLoadEnd(imageUrl: string, startTime: number, image?: HTMLImageElement) {
  const loadTime = performance.now() - startTime;
  const tracker = getWebVitalsTracker();
  
  tracker.trackImageLoad({
    url: imageUrl,
    loadTime,
    naturalWidth: image?.naturalWidth || 0,
    naturalHeight: image?.naturalHeight || 0,
    isLCP: false,
    failed: false,
    timestamp: startTime
  });
}

export function trackImageError(imageUrl: string, startTime: number) {
  const loadTime = performance.now() - startTime;
  const tracker = getWebVitalsTracker();
  
  tracker.trackImageLoad({
    url: imageUrl,
    loadTime,
    naturalWidth: 0,
    naturalHeight: 0,
    isLCP: false,
    failed: true,
    timestamp: startTime
  });
}

// Performance budget validation
export function validatePerformanceBudget(): {
  budget: Record<string, number>;
  current: Record<string, number | string>;
  violations: string[];
} {
  const tracker = getWebVitalsTracker();
  const metrics = tracker.getMetrics();
  
  const budget = {
    lcp: PERFORMANCE_CONSTANTS.LCP_GOOD,
    fid: PERFORMANCE_CONSTANTS.FID_GOOD,
    cls: PERFORMANCE_CONSTANTS.CLS_GOOD,
    imageLoadTime: 1000,
    imageFailureRate: 5
  };
  
  const current = {
    lcp: metrics.lcp || 0,
    fid: metrics.fid || 0,
    cls: metrics.cls || 0,
    imageLoadTime: metrics.imageLoadTime || 0,
    imageFailureRate: metrics.failedImages && metrics.imageCount 
      ? (metrics.failedImages / metrics.imageCount) * 100 
      : 0
  };
  
  const violations: string[] = [];
  Object.keys(budget).forEach(key => {
    const budgetValue = budget[key as keyof typeof budget];
    const currentValue = current[key as keyof typeof current];
    if (typeof currentValue === 'number' && currentValue > budgetValue) {
      violations.push(`${key}: ${currentValue} > ${budgetValue}`);
    }
  });
  
  return { budget, current, violations };
}

declare global {
  function gtag(command: string, targetId: string, config?: any): void;
}

/**
 * Code splitting helper for dynamic imports
 */
export async function loadComponent<T>(
  importFn: () => Promise<T>,
  fallback?: () => void
): Promise<T | null> {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Component failed to load:', error);
    fallback?.();
    return null;
  }
}

// Export commonly used performance constants
export const PERFORMANCE_CONSTANTS = {
  // Core Web Vitals thresholds (in ms)
  LCP_GOOD: 2500,
  LCP_NEEDS_IMPROVEMENT: 4000,
  FID_GOOD: 100,
  FID_NEEDS_IMPROVEMENT: 300,
  CLS_GOOD: 0.1,
  CLS_NEEDS_IMPROVEMENT: 0.25,
  
  // Touch target sizes (from design tokens)
  TOUCH_TARGET_PRIMARY: 44,
  TOUCH_TARGET_STANDARD: 36,
  TOUCH_TARGET_COMPACT: 32,
  TOUCH_TARGET_ICON: 40,
  
  // Debounce/throttle timings
  SCROLL_THROTTLE: 16, // 60fps
  RESIZE_DEBOUNCE: 150,
  INPUT_DEBOUNCE: 300,
  
  // Image optimization
  IMAGE_SIZES: [320, 640, 768, 1024, 1280, 1920] as const,
  LAZY_LOAD_MARGIN: '50px 0px',
  IMAGE_QUALITY_DEFAULT: 85,
  IMAGE_QUALITY_THUMBNAIL: 75,
  IMAGE_QUALITY_LQIP: 20,
  
  // Performance budgets
  IMAGE_LOAD_TIME_BUDGET: 1000, // ms
  IMAGE_FAILURE_RATE_BUDGET: 5, // percentage
  TOTAL_IMAGES_PER_PAGE_BUDGET: 20,
};