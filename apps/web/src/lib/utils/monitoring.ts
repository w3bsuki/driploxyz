/**
 * Monitoring and error tracking utilities for production
 */

// Extend the Window interface for global variables
declare global {
  interface Window {
    SENTRY_DSN?: string;
    NODE_ENV?: string;
    APP_VERSION?: string;
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp: Date;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

// Performance metric interface
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Monitoring service interface
interface MonitoringService {
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level: ErrorSeverity, context?: ErrorContext): void;
  captureMetric(metric: PerformanceMetric): void;
  setUser(user: { id: string; email?: string; username?: string }): void;
  clearUser(): void;
  addBreadcrumb(message: string, category?: string, level?: ErrorSeverity): void;
}

// Console monitoring service (for development)
class ConsoleMonitoringService implements MonitoringService {
  private _user: { id: string; email?: string; username?: string } | null = null;
  private breadcrumbs: Array<{ message: string; category?: string; level?: ErrorSeverity; timestamp: Date }> = [];

  captureError(error: Error, context?: ErrorContext): void {
    console.error('Error captured:', error, context);
    
    // In production, this would send to a service like Sentry
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, capture the exception
        this.captureExceptionWithSentry(error, context);
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  captureMessage(message: string, level: ErrorSeverity, context?: ErrorContext): void {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    
    // In production, this would send to a service like Sentry
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, capture the message
        this.captureMessageWithSentry(message, level, context);
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  captureMetric(metric: PerformanceMetric): void {
    console.log('Metric captured:', metric);
    
    // In production, this would send to a service like Sentry or a metrics service
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, add breadcrumb
        this.addBreadcrumbWithSentryForMetric(metric);
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    this._user = user;
    console.log('User set:', user);
    
    // In production, this would send to a service like Sentry
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, set the user
        this.setUserWithSentry(user);
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  clearUser(): void {
    this._user = null;
    console.log('User cleared');
    
    // In production, this would send to a service like Sentry
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, clear the user
        this.clearUserWithSentry();
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  addBreadcrumb(message: string, category?: string, level?: ErrorSeverity): void {
    this.breadcrumbs.push({
      message,
      category,
      level,
      timestamp: new Date()
    });
    
    // Keep only the last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
    
    console.log('Breadcrumb added:', { message, category, level });
    
    // In production, this would send to a service like Sentry
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // Try to import Sentry dynamically, but handle errors gracefully
      this.initSentry().then(() => {
        // Once Sentry is initialized, add breadcrumb
        this.addBreadcrumbWithSentry(message, category, level);
      }).catch(() => {
        // Ignore errors if Sentry is not available
      });
    }
  }

  private async initSentry(): Promise<void> {
    // This is a placeholder for initializing Sentry
    // In a real implementation, this would dynamically import and initialize Sentry
    console.debug('Initializing Sentry with user:', this._user?.id);
    return Promise.resolve();
  }

  private captureExceptionWithSentry(_error: Error, _context?: ErrorContext): void {
    // This is a placeholder for capturing exceptions with Sentry
    // In a real implementation, this would use the Sentry API
  }

  private captureMessageWithSentry(_message: string, _level: ErrorSeverity, _context?: ErrorContext): void {
    // This is a placeholder for capturing messages with Sentry
    // In a real implementation, this would use the Sentry API
  }

  private addBreadcrumbWithSentryForMetric(_metric: PerformanceMetric): void {
    // This is a placeholder for adding breadcrumbs with Sentry
    // In a real implementation, this would use the Sentry API
  }

  private setUserWithSentry(_user: { id: string; email?: string; username?: string }): void {
    // This is a placeholder for setting user with Sentry
    // In a real implementation, this would use the Sentry API
  }

  private clearUserWithSentry(): void {
    // This is a placeholder for clearing user with Sentry
    // In a real implementation, this would use the Sentry API
  }

  private addBreadcrumbWithSentry(_message: string, _category?: string, _level?: ErrorSeverity): void {
    // This is a placeholder for adding breadcrumbs with Sentry
    // In a real implementation, this would use the Sentry API
  }
}

// Create monitoring service instance
let monitoringService: MonitoringService;

/**
 * Initialize monitoring service
 */
export function initMonitoring(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new ConsoleMonitoringService();
    
    // Initialize Sentry in production
    if (typeof window !== 'undefined' && window.SENTRY_DSN) {
      // In a real implementation, this would dynamically import and initialize Sentry
      // For now, we'll just log that Sentry would be initialized
      console.log('Sentry would be initialized with DSN:', window.SENTRY_DSN);
    }
  }
  
  return monitoringService;
}

/**
 * Get monitoring service instance
 */
export function getMonitoring(): MonitoringService {
  if (!monitoringService) {
    return initMonitoring();
  }
  return monitoringService;
}

/**
 * Capture an error with context
 */
export function captureError(error: Error, context?: Partial<ErrorContext>): void {
  const monitoring = getMonitoring();
  
  const fullContext: ErrorContext = {
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...context
  };
  
  monitoring.captureError(error, fullContext);
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string, 
  level: ErrorSeverity = ErrorSeverity.LOW, 
  context?: Partial<ErrorContext>
): void {
  const monitoring = getMonitoring();
  
  const fullContext: ErrorContext = {
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...context
  };
  
  monitoring.captureMessage(message, level, fullContext);
}

/**
 * Capture a performance metric
 */
export function captureMetric(
  name: string,
  value: number,
  unit: string = 'ms',
  tags?: Record<string, string>
): void {
  const monitoring = getMonitoring();
  
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: new Date(),
    tags
  };
  
  monitoring.captureMetric(metric);
}

/**
 * Set user context for monitoring
 */
export function setUserContext(user: { id: string; email?: string; username?: string }): void {
  const monitoring = getMonitoring();
  monitoring.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  const monitoring = getMonitoring();
  monitoring.clearUser();
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string, 
  category?: string, 
  level: ErrorSeverity = ErrorSeverity.LOW
): void {
  const monitoring = getMonitoring();
  monitoring.addBreadcrumb(message, category, level);
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number>();
  private timers = new Map<string, number>();

  /**
   * Start a timer for measuring duration
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End a timer and capture the duration as a metric
   */
  endTimer(name: string, tags?: Record<string, string>): void {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      captureMetric(`${name}_duration`, duration, 'ms', tags);
      this.timers.delete(name);
    }
  }

  /**
   * Measure a function's execution time
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, tags);
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, status: 'error' });
      throw error;
    }
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
    captureMetric(name, current + value, 'count', tags);
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.set(name, value);
    captureMetric(name, value, 'value', tags);
  }

  /**
   * Record a histogram metric
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    captureMetric(`${name}_value`, value, 'value', tags);
  }
}

// Create a singleton performance monitor instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

/**
 * Get the performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

/**
 * Web Vitals monitoring
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Dynamic import for web-vitals
  import('web-vitals').then(({ getLCP, getFID, getCLS, getFCP, getTTFB }) => {
    // Track Largest Contentful Paint (LCP)
    getLCP((metric) => {
      captureMetric('lcp', metric.value, 'ms', {
        rating: metric.rating,
        id: metric.id
      });
    });

    // Track First Input Delay (FID)
    getFID((metric) => {
      captureMetric('fid', metric.value, 'ms', {
        rating: metric.rating,
        id: metric.id
      });
    });

    // Track Cumulative Layout Shift (CLS)
    getCLS((metric) => {
      captureMetric('cls', metric.value, 'score', {
        rating: metric.rating,
        id: metric.id
      });
    });

    // Track First Contentful Paint (FCP)
    getFCP((metric) => {
      captureMetric('fcp', metric.value, 'ms', {
        rating: metric.rating,
        id: metric.id
      });
    });

    // Track Time to First Byte (TTFB)
    getTTFB((metric) => {
      captureMetric('ttfb', metric.value, 'ms', {
        rating: metric.rating,
        id: metric.id
      });
    });
  }).catch(() => {
    // Ignore errors if web-vitals is not available
  });
}

/**
 * API error tracking
 */
export function trackApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  error: Error,
  context?: Record<string, unknown>
): void {
  captureError(error, {
    tags: {
      'error.type': 'api',
      'api.endpoint': endpoint,
      'api.method': method,
      'api.status_code': statusCode.toString()
    },
    extra: {
      endpoint,
      method,
      statusCode,
      ...context
    }
  });
}

/**
 * User interaction tracking
 */
export function trackUserInteraction(
  action: string,
  element: string,
  context?: Record<string, unknown>
): void {
  addBreadcrumb(`User interaction: ${action} on ${element}`, 'user', ErrorSeverity.LOW);
  captureMetric('user_interaction', 1, 'count', {
    action,
    element,
    ...context
  });
}

/**
 * Feature usage tracking
 */
export function trackFeatureUsage(
  featureName: string,
  action: string,
  context?: Record<string, unknown>
): void {
  captureMetric('feature_usage', 1, 'count', {
    feature: featureName,
    action,
    ...context
  });
}