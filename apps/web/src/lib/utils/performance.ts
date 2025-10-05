/**
 * Performance monitoring utilities for tracking key metrics
 */

// Performance metrics interface
export interface PerformanceMetrics {
  // Navigation timing
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  
  // Resource timing
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // Custom metrics
  routeChangeTime: number;
  apiResponseTime: Record<string, number>;
  imageLoadTime: Record<string, number>;
}

// Performance observer instances
let navigationObserver: PerformanceObserver | null = null;
let paintObserver: PerformanceObserver | null = null;
let lcpObserver: PerformanceObserver | null = null;
let fidObserver: PerformanceObserver | null = null;
let clsObserver: PerformanceObserver | null = null;

// Metrics storage
const metrics: Partial<PerformanceMetrics> = {};
let routeChangeStartTime = 0;

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !window.performance) return;

  // Navigation timing
  try {
    navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          metrics.navigationStart = navEntry.fetchStart;
          metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
          metrics.loadComplete = navEntry.loadEventEnd - navEntry.fetchStart;
        }
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });
  } catch (e) {
    console.warn('Navigation timing observer not supported:', e);
  }

  // Paint timing
  try {
    paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    console.warn('Paint timing observer not supported:', e);
  }

  // Largest Contentful Paint
  try {
    lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.largestContentfulPaint = lastEntry.startTime;
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP observer not supported:', e);
  }

  // First Input Delay
  try {
    fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          metrics.firstInputDelay = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID observer not supported:', e);
  }

  // Cumulative Layout Shift
  try {
    clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
          clsValue += (entry as unknown as { value: number }).value;
        }
      });
      metrics.cumulativeLayoutShift = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS observer not supported:', e);
  }

  // Track route changes
  trackRouteChanges();
}

// Track route change performance
function trackRouteChanges() {
  if (typeof window === 'undefined') return;

  // Override pushState and replaceState to track route changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    routeChangeStartTime = performance.now();
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    routeChangeStartTime = performance.now();
    return originalReplaceState.apply(this, args);
  };

  // Listen for popstate events (back/forward buttons)
  window.addEventListener('popstate', () => {
    routeChangeStartTime = performance.now();
  });

  // Listen for route changes in SPA
  window.addEventListener('load', () => {
    routeChangeStartTime = performance.now();
  });
}

// Record route change completion
export function recordRouteChangeComplete() {
  if (routeChangeStartTime > 0) {
    metrics.routeChangeTime = performance.now() - routeChangeStartTime;
    routeChangeStartTime = 0;
  }
}

// Record API response time
export function recordApiResponseTime(endpoint: string, startTime: number) {
  const responseTime = performance.now() - startTime;
  if (!metrics.apiResponseTime) {
    metrics.apiResponseTime = {};
  }
  metrics.apiResponseTime[endpoint] = responseTime;
}

// Record image load time
export function recordImageLoadTime(imageSrc: string, startTime: number) {
  const loadTime = performance.now() - startTime;
  if (!metrics.imageLoadTime) {
    metrics.imageLoadTime = {};
  }
  metrics.imageLoadTime[imageSrc] = loadTime;
}

// Get current performance metrics
export function getPerformanceMetrics(): Partial<PerformanceMetrics> {
  return { ...metrics };
}

// Get Core Web Vitals assessment
export function getCoreWebVitalsAssessment() {
  const assessment = {
    lcp: { value: metrics.largestContentfulPaint || 0, rating: 'good' as 'good' | 'needs-improvement' | 'poor' },
    fid: { value: metrics.firstInputDelay || 0, rating: 'good' as 'good' | 'needs-improvement' | 'poor' },
    cls: { value: metrics.cumulativeLayoutShift || 0, rating: 'good' as 'good' | 'needs-improvement' | 'poor' },
    fcp: { value: metrics.firstContentfulPaint || 0, rating: 'good' as 'good' | 'needs-improvement' | 'poor' }
  };

  // LCP assessment
  if (assessment.lcp.value < 2500) {
    assessment.lcp.rating = 'good';
  } else if (assessment.lcp.value < 4000) {
    assessment.lcp.rating = 'needs-improvement';
  } else {
    assessment.lcp.rating = 'poor';
  }

  // FID assessment
  if (assessment.fid.value < 100) {
    assessment.fid.rating = 'good';
  } else if (assessment.fid.value < 300) {
    assessment.fid.rating = 'needs-improvement';
  } else {
    assessment.fid.rating = 'poor';
  }

  // CLS assessment
  if (assessment.cls.value < 0.1) {
    assessment.cls.rating = 'good';
  } else if (assessment.cls.value < 0.25) {
    assessment.cls.rating = 'needs-improvement';
  } else {
    assessment.cls.rating = 'poor';
  }

  // FCP assessment
  if (assessment.fcp.value < 1800) {
    assessment.fcp.rating = 'good';
  } else if (assessment.fcp.value < 3000) {
    assessment.fcp.rating = 'needs-improvement';
  } else {
    assessment.fcp.rating = 'poor';
  }

  return assessment;
}

// Log performance metrics to console
export function logPerformanceMetrics() {
  const currentMetrics = getPerformanceMetrics();
  const assessment = getCoreWebVitalsAssessment();

  console.group('🚀 Performance Metrics');
  console.table(currentMetrics);
  
  console.group('📊 Core Web Vitals Assessment');
  console.table(assessment);
  
  // Log recommendations
  console.group('💡 Recommendations');
  
  if (assessment.lcp.rating === 'poor') {
    console.warn('LCP is poor. Consider optimizing images and reducing server response time.');
  }
  
  if (assessment.fid.rating === 'poor') {
    console.warn('FID is poor. Consider reducing JavaScript execution time and breaking up long tasks.');
  }
  
  if (assessment.cls.rating === 'poor') {
    console.warn('CLS is poor. Avoid layout shifts by setting dimensions for images and ads.');
  }
  
  if (assessment.fcp.rating === 'poor') {
    console.warn('FCP is poor. Consider reducing server response time and optimizing critical rendering path.');
  }
  
  console.groupEnd();
  console.groupEnd();
}

// Report metrics to analytics service
export function reportMetricsToAnalytics() {
  // This would integrate with your analytics service
  // For now, we'll just log them
  logPerformanceMetrics();
  
  // In a real implementation, you would send metrics to your analytics service:
  // analytics.track('performance_metrics', {
  //   lcp: metrics.largestContentfulPaint,
  //   fid: metrics.firstInputDelay,
  //   cls: metrics.cumulativeLayoutShift,
  //   fcp: metrics.firstContentfulPaint,
  //   routeChangeTime: metrics.routeChangeTime
  // });
}

// Cleanup observers
export function cleanupPerformanceMonitoring() {
  navigationObserver?.disconnect();
  paintObserver?.disconnect();
  lcpObserver?.disconnect();
  fidObserver?.disconnect();
  clsObserver?.disconnect();
}