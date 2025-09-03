/**
 * Web Vitals Performance Monitor
 * Tracks Core Web Vitals for filter components according to CLAUDE.md requirements
 * Target: LCP ≤ 1.5s p75, mobile performance ≥ 90
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Performance targets from CLAUDE.md
const PERFORMANCE_TARGETS = {
  LCP: { target: 1500, threshold: 'p75' }, // CLAUDE.md requirement
  FID: { target: 100, threshold: 'p95' },
  CLS: { target: 0.1, threshold: 'p75' },
  FCP: { target: 1200, threshold: 'p75' },
  TTFB: { target: 200, threshold: 'p75' }
};

// Filter-specific performance tracking
interface FilterPerformanceMetric {
  filterType: string;
  action: string;
  duration: number;
  timestamp: number;
  deviceType: string;
  connectionType: string;
}

class PerformanceMonitor {
  private metrics: Map<string, Metric[]> = new Map();
  private filterMetrics: FilterPerformanceMetric[] = [];

  constructor() {
    this.initializeWebVitalsTracking();
    this.initializeFilterTracking();
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  private initializeWebVitalsTracking(): void {
    getCLS(this.handleMetric.bind(this), true);
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this), true);
    getTTFB(this.handleMetric.bind(this));
  }

  /**
   * Handle incoming Web Vitals metrics
   */
  private handleMetric(metric: Metric): void {
    const existing = this.metrics.get(metric.name) || [];
    existing.push(metric);
    this.metrics.set(metric.name, existing);

    this.reportMetric(metric);
    this.checkPerformanceBudget(metric);
  }

  /**
   * Initialize filter-specific performance tracking
   */
  private initializeFilterTracking(): void {
    // Track filter modal opening
    this.trackFilterInteraction('modal', 'open', 'filter-trigger');
    
    // Track brand selector performance
    this.trackFilterInteraction('brand', 'select', 'brand-option');
    
    // Track category selector performance
    this.trackFilterInteraction('category', 'select', 'category-option');
    
    // Track price range performance
    this.trackFilterInteraction('price', 'update', 'price-input');
    
    // Track filter clearing
    this.trackFilterInteraction('clear', 'all', 'clear-all-filters');
  }

  /**
   * Track specific filter interactions
   */
  private trackFilterInteraction(filterType: string, action: string, selector: string): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const testId = target.getAttribute('data-testid');
      
      if (testId?.includes(selector)) {
        const startTime = performance.now();
        
        // Use MutationObserver to detect when filter application completes
        const observer = new MutationObserver(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordFilterMetric({
            filterType,
            action,
            duration,
            timestamp: Date.now(),
            deviceType: this.getDeviceType(),
            connectionType: this.getConnectionType()
          });
          
          observer.disconnect();
        });
        
        // Observe URL changes (filter application)
        observer.observe(document, { 
          childList: true, 
          subtree: true 
        });
        
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
        }, 1000);
      }
    });
  }

  /**
   * Record filter performance metric
   */
  private recordFilterMetric(metric: FilterPerformanceMetric): void {
    this.filterMetrics.push(metric);
    
    // Check against performance budgets
    const budget = this.getFilterBudget(metric.filterType, metric.action);
    if (metric.duration > budget) {
      console.warn(
        `Filter performance budget exceeded: ${metric.filterType}.${metric.action} took ${metric.duration.toFixed(2)}ms (budget: ${budget}ms)`
      );
    }
    
    // Report to analytics
    this.reportFilterMetric(metric);
  }

  /**
   * Get performance budget for filter interaction
   */
  private getFilterBudget(filterType: string, action: string): number {
    const budgets = {
      'modal.open': 300,
      'brand.select': 100,
      'category.select': 100,
      'price.update': 100,
      'clear.all': 50
    };
    
    return budgets[`${filterType}.${action}`] || 100;
  }

  /**
   * Report metric to analytics/monitoring service
   */
  private reportMetric(metric: Metric): void {
    // Send to your analytics service
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: {
          metric_id: metric.id,
          metric_delta: metric.delta,
          metric_rating: metric.rating
        }
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }
  }

  /**
   * Report filter metric to analytics
   */
  private reportFilterMetric(metric: FilterPerformanceMetric): void {
    if (window.gtag) {
      window.gtag('event', 'filter_performance', {
        event_category: 'Interaction',
        event_label: `${metric.filterType}_${metric.action}`,
        value: Math.round(metric.duration),
        custom_map: {
          device_type: metric.deviceType,
          connection_type: metric.connectionType
        }
      });
    }
  }

  /**
   * Check if metric exceeds performance budget
   */
  private checkPerformanceBudget(metric: Metric): void {
    const target = PERFORMANCE_TARGETS[metric.name as keyof typeof PERFORMANCE_TARGETS];
    
    if (target && metric.value > target.target) {
      console.warn(
        `Performance budget exceeded: ${metric.name} = ${metric.value.toFixed(2)} (target: ${target.target}, threshold: ${target.threshold})`
      );
      
      // Report budget violation
      if (window.gtag) {
        window.gtag('event', 'performance_budget_exceeded', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value - target.target)
        });
      }
    }
  }

  /**
   * Get device type for reporting
   */
  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get connection type for reporting
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }
    
    return 'unknown';
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Web Vitals summary
    this.metrics.forEach((values, name) => {
      const latestValue = values[values.length - 1];
      summary[name] = {
        value: latestValue.value,
        rating: latestValue.rating,
        target: PERFORMANCE_TARGETS[name as keyof typeof PERFORMANCE_TARGETS]?.target,
        exceedsTarget: latestValue.value > (PERFORMANCE_TARGETS[name as keyof typeof PERFORMANCE_TARGETS]?.target || Infinity)
      };
    });
    
    // Filter performance summary
    const filterSummary = this.filterMetrics.reduce((acc, metric) => {
      const key = `${metric.filterType}_${metric.action}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);
    
    Object.keys(filterSummary).forEach(key => {
      const durations = filterSummary[key];
      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95 = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];
      
      summary[`filter_${key}`] = {
        average,
        p95,
        count: durations.length,
        exceedsBudget: durations.some(d => d > this.getFilterBudget(...key.split('_') as [string, string]))
      };
    });
    
    return summary;
  }

  /**
   * Export performance data for analysis
   */
  public exportPerformanceData(): string {
    return JSON.stringify({
      webVitals: Object.fromEntries(this.metrics),
      filterMetrics: this.filterMetrics,
      summary: this.getPerformanceSummary(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }, null, 2);
  }
}

// Initialize performance monitoring
export const performanceMonitor = new PerformanceMonitor();

// Add to global scope for debugging
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
}

// Export for use in applications
export default performanceMonitor;