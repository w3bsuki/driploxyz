/**
 * Enhanced Performance Monitoring for Driplo with SvelteKit 2 Support
 * Tracks API performance, database queries, streaming data, Core Web Vitals, and cache effectiveness
 */

import { browser } from '$app/environment';
import { cacheMonitoring } from '$lib/cache';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  route?: string;
  tags?: Record<string, string>;
}

interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface StreamingMetric extends Record<string, unknown> {
  dataType: string;
  loadTime: number;
  chunkCount: number;
  route: string;
  timestamp: string;
}

interface DatabaseQueryMetric extends Record<string, unknown> {
  query: string;
  duration: number;
  timestamp: string;
  table?: string;
  operation?: string;
}

interface APIMetric extends Record<string, unknown> {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: string;
  userId?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private dbQueries: DatabaseQueryMetric[] = [];
  private apiMetrics: APIMetric[] = [];
  private streamingMetrics: StreamingMetric[] = [];
  private webVitals: CoreWebVitals = {};
  private observers: PerformanceObserver[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics in memory

  constructor() {
    if (browser) {
      this.initializeBrowserMonitoring();
    }
  }

  private initializeBrowserMonitoring() {
    this.setupWebVitalsObservers();
    this.setupNavigationTiming();
  }

  private setupWebVitalsObservers() {
    if ('PerformanceObserver' in window) {
      // LCP Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          this.webVitals.lcp = lastEntry.startTime;
          this.recordMetric('lcp', lastEntry.startTime, 'ms', { route: window.location.pathname });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch {
        console.debug('LCP observer not supported');
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number };
            if (fidEntry.processingStart) {
              this.webVitals.fid = fidEntry.processingStart - fidEntry.startTime;
              this.recordMetric('fid', this.webVitals.fid, 'ms', { route: window.location.pathname });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch {
        console.debug('FID observer not supported');
      }

      // CLS Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value || 0;
            }
          });
          this.webVitals.cls = clsValue;
          this.recordMetric('cls', clsValue, 'score', { route: window.location.pathname });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch {
        console.debug('CLS observer not supported');
      }
    }
  }

  private setupNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.webVitals.ttfb = navigation.responseStart - navigation.fetchStart;
            this.webVitals.fcp = navigation.loadEventEnd - navigation.fetchStart;

            this.recordMetric('ttfb', this.webVitals.ttfb, 'ms', { route: window.location.pathname });
            this.recordMetric('fcp', this.webVitals.fcp, 'ms', { route: window.location.pathname });
          }
        }, 0);
      });
    }
  }

  /**
   * Record a performance metric with enhanced context
   */
  recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      route: browser ? window.location.pathname : undefined,
      tags
    };

    this.metrics.push(metric);

    // Clean up old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log performance issues based on type
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 600,
      dataLoad: 3000,
      streamingData: 1000,
      cacheLoad: 50
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold}${metric.unit})`, {
        route: metric.route,
        tags: metric.tags
      });
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(query: string, duration: number, table?: string, operation?: string) {
    const metric: DatabaseQueryMetric = {
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      timestamp: new Date().toISOString(),
      table,
      operation
    };

    this.dbQueries.push(metric);
    
    if (this.dbQueries.length > this.maxMetrics) {
      this.dbQueries.shift();
    }

    // Log slow queries
    if (duration > 500) { // > 500ms
      
    }
  }

  /**
   * Record API endpoint performance
   */
  recordAPI(endpoint: string, method: string, duration: number, statusCode: number, userId?: string, ip?: string) {
    const metric: APIMetric = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
      userId,
      ip
    };

    this.apiMetrics.push(metric);
    
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics.shift();
    }

    // Log slow API calls
    if (duration > 2000) { // > 2 seconds
      
    }
  }

  /**
   * Record streaming data performance
   */
  recordStreamingData(dataType: string, loadTime: number, chunkCount: number = 1, route?: string) {
    const metric: StreamingMetric = {
      dataType,
      loadTime,
      chunkCount,
      route: route || (browser ? window.location.pathname : 'server'),
      timestamp: new Date().toISOString()
    };

    this.streamingMetrics.push(metric);

    if (this.streamingMetrics.length > this.maxMetrics) {
      this.streamingMetrics.shift();
    }

    // Also record as general metric
    this.recordMetric('streamingData', loadTime, 'ms', {
      dataType,
      chunkCount: chunkCount.toString(),
      avgChunkTime: (loadTime / chunkCount).toString()
    });
  }

  /**
   * Track SvelteKit data loading with streaming support
   */
  trackDataLoading(route: string, startTime: number, metadata?: Record<string, string | number | boolean | undefined>) {
    const loadTime = Date.now() - startTime;
    this.recordMetric('dataLoad', loadTime, 'ms', {
      route,
      queryCount: metadata?.queryCount?.toString() || '1',
      cacheHits: metadata?.cacheHits?.toString() || '0',
      ...metadata
    });

    return {
      loadTime,
      route,
      timestamp: Date.now()
    };
  }

  /**
   * Get comprehensive performance summary with Web Vitals and streaming metrics
   */
  getPerformanceSummary() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    // Filter recent metrics
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > lastHour
    );
    const recentDBQueries = this.dbQueries.filter(q => 
      new Date(q.timestamp).getTime() > lastHour
    );
    const recentAPIs = this.apiMetrics.filter(a => 
      new Date(a.timestamp).getTime() > lastHour
    );

    const recentStreamingMetrics = this.streamingMetrics.filter(s =>
      new Date(s.timestamp).getTime() > lastHour
    );

    const cacheStats = browser ? cacheMonitoring.getMetrics() : { hitRate: 0, hits: 0, misses: 0 };

    return {
      timestamp: new Date().toISOString(),
      period: 'last_hour',
      webVitals: this.webVitals,
      metrics: {
        total: this.metrics.length,
        recent: recentMetrics.length,
        averageResponseTime: this.calculateAverage(recentAPIs, 'duration'),
        averageDBQueryTime: this.calculateAverage(recentDBQueries, 'duration'),
        averageStreamingTime: this.calculateAverage(recentStreamingMetrics, 'loadTime'),
        slowQueries: recentDBQueries.filter(q => q.duration > 500).length,
        slowAPIs: recentAPIs.filter(a => a.duration > 2000).length,
        slowStreamingData: recentStreamingMetrics.filter(s => s.loadTime > 1000).length,
        errorRate: this.calculateErrorRate(recentAPIs)
      },
      cache: cacheStats,
      streaming: {
        totalChunks: recentStreamingMetrics.reduce((sum, s) => sum + s.chunkCount, 0),
        averageChunkTime: this.calculateAverageChunkTime(recentStreamingMetrics),
        dataTypeBreakdown: this.getStreamingDataTypeBreakdown(recentStreamingMetrics)
      },
      topSlowQueries: this.getTopSlowQueries(recentDBQueries, 5),
      topSlowAPIs: this.getTopSlowAPIs(recentAPIs, 5),
      topSlowStreaming: this.getTopSlowStreaming(recentStreamingMetrics, 5),
      errorBreakdown: this.getErrorBreakdown(recentAPIs),
      performanceGrade: this.calculatePerformanceGrade()
    };
  }

  /**
   * Get database performance insights
   */
  getDatabaseInsights() {
    const recentQueries = this.dbQueries.filter(q => 
      new Date(q.timestamp).getTime() > Date.now() - (60 * 60 * 1000)
    );

    const tableStats: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};

    recentQueries.forEach(query => {
      if (query.table) {
        if (!tableStats[query.table]) {
          tableStats[query.table] = { count: 0, avgDuration: 0, maxDuration: 0 };
        }
        const stats = tableStats[query.table];
        if (stats) {
          stats.count++;
          stats.avgDuration += query.duration;
          stats.maxDuration = Math.max(stats.maxDuration, query.duration);
        }
      }
    });

    // Calculate averages
    Object.keys(tableStats).forEach(table => {
      const stats = tableStats[table];
      if (stats && stats.count > 0) {
        stats.avgDuration = stats.avgDuration / stats.count;
      }
    });

    return {
      timestamp: new Date().toISOString(),
      totalQueries: recentQueries.length,
      averageQueryTime: this.calculateAverage(recentQueries, 'duration'),
      slowQueries: recentQueries.filter(q => q.duration > 500).length,
      tableStats,
      recommendations: this.generateDBRecommendations(tableStats)
    };
  }

  /**
   * Get API performance insights
   */
  getAPIInsights() {
    const recentAPIs = this.apiMetrics.filter(a => 
      new Date(a.timestamp).getTime() > Date.now() - (60 * 60 * 1000)
    );

    const endpointStats: Record<string, { count: number; avgDuration: number; errorRate: number }> = {};

    recentAPIs.forEach(api => {
      const key = `${api.method} ${api.endpoint}`;
      if (!endpointStats[key]) {
        endpointStats[key] = { count: 0, avgDuration: 0, errorRate: 0 };
      }
      endpointStats[key].count++;
      endpointStats[key].avgDuration += api.duration;
      if (api.statusCode >= 400) {
        endpointStats[key].errorRate++;
      }
    });

    // Calculate averages and error rates
    Object.keys(endpointStats).forEach(endpoint => {
      const stats = endpointStats[endpoint];
      if (stats && stats.count > 0) {
        stats.avgDuration = stats.avgDuration / stats.count;
        stats.errorRate = (stats.errorRate / stats.count) * 100;
      }
    });

    return {
      timestamp: new Date().toISOString(),
      totalRequests: recentAPIs.length,
      averageResponseTime: this.calculateAverage(recentAPIs, 'duration'),
      errorRate: this.calculateErrorRate(recentAPIs),
      endpointStats,
      recommendations: this.generateAPIRecommendations(endpointStats)
    };
  }

  /**
   * Helper methods
   */
  private calculateAverage<T extends Record<string, unknown>>(items: T[], field: keyof T): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item[field] as number), 0);
    return Math.round(sum / items.length);
  }

  private calculateErrorRate(apis: APIMetric[]): number {
    if (apis.length === 0) return 0;
    const errors = apis.filter(api => api.statusCode >= 400).length;
    return Math.round((errors / apis.length) * 100);
  }

  private getTopSlowQueries(queries: DatabaseQueryMetric[], limit: number) {
    return queries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(q => ({
        query: q.query,
        duration: q.duration,
        table: q.table,
        timestamp: q.timestamp
      }));
  }

  private getTopSlowAPIs(apis: APIMetric[], limit: number) {
    return apis
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(api => ({
        endpoint: api.endpoint,
        method: api.method,
        duration: api.duration,
        statusCode: api.statusCode,
        timestamp: api.timestamp
      }));
  }

  private getErrorBreakdown(apis: APIMetric[]) {
    const breakdown: Record<number, number> = {};
    apis.forEach(api => {
      if (api.statusCode >= 400) {
        breakdown[api.statusCode] = (breakdown[api.statusCode] || 0) + 1;
      }
    });
    return breakdown;
  }

  private generateDBRecommendations(tableStats: Record<string, { avgDuration: number; maxDuration: number }>) {
    const recommendations: string[] = [];
    
    Object.entries(tableStats).forEach(([table, stats]) => {
      if (stats.avgDuration > 100) {
        recommendations.push(`Consider adding indexes to ${table} table (avg: ${Math.round(stats.avgDuration)}ms)`);
      }
      if (stats.maxDuration > 1000) {
        recommendations.push(`Optimize slow queries on ${table} table (max: ${stats.maxDuration}ms)`);
      }
    });

    return recommendations;
  }

  private generateAPIRecommendations(endpointStats: Record<string, { avgDuration: number; errorRate: number } | undefined>) {
    const recommendations: string[] = [];
    
    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
      if (stats && stats.avgDuration > 1000) {
        recommendations.push(`Optimize ${endpoint} endpoint (avg: ${Math.round(stats.avgDuration)}ms)`);
      }
      if (stats && stats.errorRate > 5) {
        recommendations.push(`Fix errors in ${endpoint} endpoint (error rate: ${Math.round(stats.errorRate)}%)`);
      }
    });

    return recommendations;
  }

  private calculateAverageChunkTime(metrics: StreamingMetric[]): number {
    if (metrics.length === 0) return 0;
    const totalTime = metrics.reduce((sum, m) => sum + m.loadTime, 0);
    const totalChunks = metrics.reduce((sum, m) => sum + m.chunkCount, 0);
    return totalChunks > 0 ? Math.round(totalTime / totalChunks) : 0;
  }

  private getStreamingDataTypeBreakdown(metrics: StreamingMetric[]) {
    const breakdown: Record<string, { count: number; avgTime: number }> = {};

    metrics.forEach(metric => {
      if (!breakdown[metric.dataType]) {
        breakdown[metric.dataType] = { count: 0, avgTime: 0 };
      }
      breakdown[metric.dataType]!.count++;
      breakdown[metric.dataType]!.avgTime += metric.loadTime;
    });

    Object.keys(breakdown).forEach(dataType => {
      const stats = breakdown[dataType];
      if (stats) {
        stats.avgTime = Math.round(stats.avgTime / stats.count);
      }
    });

    return breakdown;
  }

  private getTopSlowStreaming(metrics: StreamingMetric[], limit: number) {
    return metrics
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, limit)
      .map(s => ({
        dataType: s.dataType,
        loadTime: s.loadTime,
        chunkCount: s.chunkCount,
        route: s.route,
        timestamp: s.timestamp
      }));
  }

  private calculatePerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const { lcp, fid, cls } = this.webVitals;
    let score = 0;
    let totalChecks = 0;

    if (lcp !== undefined) {
      totalChecks++;
      if (lcp <= 2500) score++;
      else if (lcp <= 4000) score += 0.5;
    }

    if (fid !== undefined) {
      totalChecks++;
      if (fid <= 100) score++;
      else if (fid <= 300) score += 0.5;
    }

    if (cls !== undefined) {
      totalChecks++;
      if (cls <= 0.1) score++;
      else if (cls <= 0.25) score += 0.5;
    }

    if (totalChecks === 0) return 'C';

    const percentage = score / totalChecks;
    if (percentage >= 0.9) return 'A';
    if (percentage >= 0.75) return 'B';
    if (percentage >= 0.5) return 'C';
    if (percentage >= 0.25) return 'D';
    return 'F';
  }

  /**
   * Clean up old metrics and observers
   */
  clearOldMetrics() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
    this.dbQueries = this.dbQueries.filter(q => new Date(q.timestamp).getTime() > cutoff);
    this.apiMetrics = this.apiMetrics.filter(a => new Date(a.timestamp).getTime() > cutoff);
    this.streamingMetrics = this.streamingMetrics.filter(s => new Date(s.timestamp).getTime() > cutoff);
  }

  /**
   * Cleanup observers when component unmounts
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup function for SvelteKit
if (browser) {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.destroy();
  });
}

/**
 * Performance decorator for API routes
 */
export function trackPerformance(name: string) {
  return function (_target: object, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        performanceMonitor.recordMetric(name, duration, 'ms');
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        performanceMonitor.recordMetric(`${name}_error`, duration, 'ms');
        throw error;
      }
    };
  };
}

/**
 * Database query performance tracker
 */
export function trackDatabaseQuery(table?: string, operation?: string) {
  return function (target: object, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        performanceMonitor.recordDatabaseQuery(
          `${target.constructor.name}.${propertyName}`,
          duration,
          table,
          operation
        );
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        performanceMonitor.recordDatabaseQuery(
          `${target.constructor.name}.${propertyName}_error`,
          duration,
          table,
          operation
        );
        throw error;
      }
    };
  };
}

// Helper functions for SvelteKit integration
export const trackDataLoad = (route: string, startTime: number, metadata?: Record<string, string | number | boolean | undefined>) => {
  return performanceMonitor.trackDataLoading(route, startTime, metadata);
};

export const trackStreaming = (dataType: string, loadTime: number, chunkCount: number = 1, route?: string) => {
  return performanceMonitor.recordStreamingData(dataType, loadTime, chunkCount, route);
};

export const getPerformanceSummary = () => {
  return performanceMonitor.getPerformanceSummary();
};

// Helper for measuring async operations
export const measureAsync = async <T>(
  operation: () => Promise<T>,
  metricName: string,
  metadata?: Record<string, string>
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    performanceMonitor.recordMetric(metricName, Date.now() - startTime, 'ms', metadata);
    return result;
  } catch (error) {
    performanceMonitor.recordMetric(`${metricName}_error`, Date.now() - startTime, 'ms', {
      ...metadata,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// SvelteKit load function performance tracker
export const createLoadTracker = (route: string) => {
  const startTime = Date.now();

  return {
    finish: (metadata?: Record<string, string | number | boolean | undefined>) => {
      return trackDataLoad(route, startTime, metadata);
    },
    track: (name: string, value: number, metadata?: Record<string, string>) => {
      performanceMonitor.recordMetric(name, value, 'ms', { route, ...metadata });
    },
    trackStreaming: (dataType: string, chunkCount: number = 1) => {
      return trackStreaming(dataType, Date.now() - startTime, chunkCount, route);
    }
  };
};
