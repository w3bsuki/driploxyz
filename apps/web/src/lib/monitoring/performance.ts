/**
 * Performance Monitoring for Driplo
 * Tracks API performance, database queries, and user experience metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

interface DatabaseQueryMetric {
  query: string;
  duration: number;
  timestamp: string;
  table?: string;
  operation?: string;
}

interface APIMetric {
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
  private maxMetrics = 10000; // Keep last 10k metrics in memory

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags
    };

    this.metrics.push(metric);
    
    // Clean up old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (value > 1000) { // > 1 second
      console.warn(`Slow operation detected: ${name} took ${value}${unit}`);
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
      console.warn(`Slow database query detected: ${duration}ms - ${table || 'unknown table'}`);
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
      console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Get performance summary
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

    return {
      timestamp: new Date().toISOString(),
      period: 'last_hour',
      metrics: {
        total: this.metrics.length,
        recent: recentMetrics.length,
        averageResponseTime: this.calculateAverage(recentAPIs, 'duration'),
        averageDBQueryTime: this.calculateAverage(recentDBQueries, 'duration'),
        slowQueries: recentDBQueries.filter(q => q.duration > 500).length,
        slowAPIs: recentAPIs.filter(a => a.duration > 2000).length,
        errorRate: this.calculateErrorRate(recentAPIs)
      },
      topSlowQueries: this.getTopSlowQueries(recentDBQueries, 5),
      topSlowAPIs: this.getTopSlowAPIs(recentAPIs, 5),
      errorBreakdown: this.getErrorBreakdown(recentAPIs)
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
  private calculateAverage(items: any[], field: string): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item[field], 0);
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

  private generateDBRecommendations(tableStats: Record<string, any>) {
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

  private generateAPIRecommendations(endpointStats: Record<string, any>) {
    const recommendations: string[] = [];
    
    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
      if (stats.avgDuration > 1000) {
        recommendations.push(`Optimize ${endpoint} endpoint (avg: ${Math.round(stats.avgDuration)}ms)`);
      }
      if (stats.errorRate > 5) {
        recommendations.push(`Fix errors in ${endpoint} endpoint (error rate: ${Math.round(stats.errorRate)}%)`);
      }
    });

    return recommendations;
  }

  /**
   * Clear old metrics (call periodically)
   */
  clearOldMetrics() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
    this.dbQueries = this.dbQueries.filter(q => new Date(q.timestamp).getTime() > cutoff);
    this.apiMetrics = this.apiMetrics.filter(a => new Date(a.timestamp).getTime() > cutoff);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for API routes
 */
export function trackPerformance(name: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
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
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
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
