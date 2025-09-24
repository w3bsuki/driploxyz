/**
 * Client-side Error Handling Utilities
 * Comprehensive error handling patterns for Svelte 5 and SvelteKit 2
 */

import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { createLogger } from './log';

const log = createLogger('error-handling');

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',        // Non-blocking, show toast
  MEDIUM = 'MEDIUM',  // Show error message, allow retry
  HIGH = 'HIGH',      // Show error boundary, require action
  CRITICAL = 'CRITICAL' // Full page error, redirect or reload
}

export interface ErrorDetails {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  retryable: boolean;
  timestamp: string;
  context?: Record<string, unknown>;
  stackTrace?: string;
  requestId?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

/**
 * Default retry configuration for different error types
 */
const defaultRetryConfigs: Record<ErrorType, RetryConfig> = {
  [ErrorType.NETWORK]: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2, maxDelayMs: 10000 },
  [ErrorType.SERVER]: { maxAttempts: 2, delayMs: 2000, backoffMultiplier: 1.5, maxDelayMs: 8000 },
  [ErrorType.RATE_LIMIT]: { maxAttempts: 1, delayMs: 5000, backoffMultiplier: 1, maxDelayMs: 5000 },
  [ErrorType.AUTHENTICATION]: { maxAttempts: 1, delayMs: 0, backoffMultiplier: 1, maxDelayMs: 0 },
  [ErrorType.AUTHORIZATION]: { maxAttempts: 0, delayMs: 0, backoffMultiplier: 1, maxDelayMs: 0 },
  [ErrorType.VALIDATION]: { maxAttempts: 0, delayMs: 0, backoffMultiplier: 1, maxDelayMs: 0 },
  [ErrorType.NOT_FOUND]: { maxAttempts: 0, delayMs: 0, backoffMultiplier: 1, maxDelayMs: 0 },
  [ErrorType.CLIENT]: { maxAttempts: 1, delayMs: 1000, backoffMultiplier: 1, maxDelayMs: 1000 },
  [ErrorType.UNKNOWN]: { maxAttempts: 1, delayMs: 2000, backoffMultiplier: 1, maxDelayMs: 2000 }
};

/**
 * Parse and categorize errors from various sources
 */
export function parseError(error: unknown, context?: Record<string, unknown>): ErrorDetails {
  const timestamp = new Date().toISOString();
  let details: Partial<ErrorDetails> = {
    timestamp,
    context
  };

  // Handle Response objects (fetch errors)
  if (error instanceof Response) {
    details = {
      ...details,
      statusCode: error.status,
      type: categorizeHttpError(error.status),
      severity: getSeverityFromStatus(error.status),
      message: error.statusText || `HTTP ${error.status}`,
      userMessage: getUserMessageFromStatus(error.status),
      retryable: isRetryableStatus(error.status)
    };
  }
  // Handle Error objects
  else if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      details = {
        ...details,
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: 'Network connection issue. Please check your internet connection and try again.',
        retryable: true,
        stackTrace: error.stack
      };
    }
    // Authentication errors
    else if (message.includes('auth') || message.includes('unauthorized') || message.includes('login')) {
      details = {
        ...details,
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        message: error.message,
        userMessage: 'Your session has expired. Please log in again.',
        retryable: false,
        stackTrace: error.stack
      };
    }
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      details = {
        ...details,
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        message: error.message,
        userMessage: error.message, // Validation messages are usually user-friendly
        retryable: false,
        stackTrace: error.stack
      };
    }
    // Generic JavaScript errors
    else {
      details = {
        ...details,
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: 'Something went wrong. Please try again.',
        retryable: true,
        stackTrace: error.stack
      };
    }
  }
  // Handle string errors
  else if (typeof error === 'string') {
    details = {
      ...details,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.LOW,
      message: error,
      userMessage: error,
      retryable: false
    };
  }
  // Handle unknown error types
  else {
    details = {
      ...details,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: String(error),
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true
    };
  }

  return details as ErrorDetails;
}

/**
 * Categorize HTTP status codes into error types
 */
function categorizeHttpError(status: number): ErrorType {
  if (status === 401) return ErrorType.AUTHENTICATION;
  if (status === 403) return ErrorType.AUTHORIZATION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status === 422 || status === 400) return ErrorType.VALIDATION;
  if (status === 429) return ErrorType.RATE_LIMIT;
  if (status >= 500) return ErrorType.SERVER;
  if (status >= 400) return ErrorType.CLIENT;
  return ErrorType.UNKNOWN;
}

/**
 * Get error severity based on HTTP status
 */
function getSeverityFromStatus(status: number): ErrorSeverity {
  if (status === 401) return ErrorSeverity.HIGH;
  if (status === 403) return ErrorSeverity.HIGH;
  if (status === 404) return ErrorSeverity.MEDIUM;
  if (status === 422 || status === 400) return ErrorSeverity.LOW;
  if (status === 429) return ErrorSeverity.MEDIUM;
  if (status >= 500) return ErrorSeverity.HIGH;
  return ErrorSeverity.MEDIUM;
}

/**
 * Get user-friendly message based on HTTP status
 */
function getUserMessageFromStatus(status: number): string {
  switch (status) {
    case 400: return 'Invalid request. Please check your input and try again.';
    case 401: return 'You need to be logged in to access this resource.';
    case 403: return 'You don\'t have permission to access this resource.';
    case 404: return 'The requested resource was not found.';
    case 408: return 'Request timeout. Please try again.';
    case 409: return 'There was a conflict with your request.';
    case 422: return 'Please check your input and try again.';
    case 429: return 'Too many requests. Please wait a moment before trying again.';
    case 500: return 'Server error. Our team has been notified.';
    case 502: return 'Service temporarily unavailable. Please try again later.';
    case 503: return 'Service temporarily unavailable. Please try again later.';
    case 504: return 'Service timeout. Please try again later.';
    default: return 'An error occurred. Please try again.';
  }
}

/**
 * Check if HTTP status is retryable
 */
function isRetryableStatus(status: number): boolean {
  // Retry on server errors and timeouts
  return status >= 500 || status === 408 || status === 429;
}

/**
 * Retry mechanism with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  errorType: ErrorType = ErrorType.UNKNOWN
): Promise<T> {
  const retryConfig = { ...defaultRetryConfigs[errorType], ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      // Check if error is retryable
      const errorDetails = parseError(error);
      if (!errorDetails.retryable) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelayMs
      );

      log.warn(`Retrying operation after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Network status detection
 */
export function createNetworkMonitor() {
  let isOnline = $state(browser ? navigator.onLine : true);
  let connectionType = $state<string | undefined>(
    browser && 'connection' in navigator
      ? (navigator.connection as { effectiveType?: string })?.effectiveType
      : undefined
  );

  if (browser) {
    const updateOnlineStatus = () => {
      isOnline = navigator.onLine;
    };

    const updateConnectionStatus = () => {
      if ('connection' in navigator) {
        connectionType = (navigator.connection as { effectiveType?: string })?.effectiveType;
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('connection' in navigator) {
      (navigator.connection as { addEventListener?: (event: string, callback: () => void) => void })?.addEventListener?.('change', updateConnectionStatus);
    }
  }

  return {
    get isOnline() { return isOnline; },
    get connectionType() { return connectionType; },
    get isSlowConnection() {
      return connectionType === 'slow-2g' || connectionType === '2g';
    }
  };
}

/**
 * Create error boundary state for components
 */
export function createErrorBoundary(onError?: (error: ErrorDetails) => void) {
  let error = $state<ErrorDetails | null>(null);
  let isRetrying = $state(false);

  const captureError = (err: unknown, context?: Record<string, unknown>) => {
    const errorDetails = parseError(err, context);
    error = errorDetails;

    // Log error
    log.error('Error caught by boundary:', errorDetails);

    // Call error handler if provided
    onError?.(errorDetails);

    // Report to external service in production
    if (!browser || !window.location.hostname.includes('localhost')) {
      reportError(errorDetails);
    }
  };

  const retry = async (retryFn?: () => Promise<void>) => {
    if (!error) return;

    isRetrying = true;

    try {
      if (retryFn) {
        await retryFn();
      } else {
        // Default retry behavior
        if (error.type === ErrorType.AUTHENTICATION) {
          // Redirect to login or refresh auth
          await invalidateAll();
        } else {
          // Reload the page data
          await invalidateAll();
        }
      }

      // Clear error on successful retry
      error = null;
    } catch (retryError) {
      // Update with new error if retry fails
      captureError(retryError);
    } finally {
      isRetrying = false;
    }
  };

  const clearError = () => {
    error = null;
  };

  return {
    get error() { return error; },
    get hasError() { return !!error; },
    get isRetrying() { return isRetrying; },
    captureError,
    retry,
    clearError
  };
}

/**
 * Enhanced fetch wrapper with error handling
 */
export async function safeFetch<T = unknown>(
  url: string | URL | Request,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    parseResponse?: boolean;
  } = {}
): Promise<T> {
  const {
    timeout = 30000,
    retries = 1,
    parseResponse = true,
    ...fetchOptions
  } = options;

  const operation = async (): Promise<T> => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw response;
      }

      if (!parseResponse) {
        return response as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  };

  return withRetry(operation, { maxAttempts: retries }, ErrorType.NETWORK);
}

/**
 * Report error to external monitoring service
 */
function reportError(error: ErrorDetails) {
  // In production, report to Sentry or other monitoring service
  if (browser && window.location.hostname !== 'localhost') {
    // Example: Sentry.captureException(error);
    console.warn('Error reported:', error);
  }
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
  if (!browser) return;

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    const error = parseError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    log.error('Unhandled error:', error);
    reportError(error);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = parseError(event.reason, {
      type: 'unhandledRejection'
    });

    log.error('Unhandled promise rejection:', error);
    reportError(error);

    // Prevent the default browser error reporting
    event.preventDefault();
  });
}

/**
 * Error boundary hook for components
 */
export function useErrorBoundary(onError?: (error: ErrorDetails) => void) {
  const boundary = createErrorBoundary(onError);

  // Auto-setup global error handling
  if (browser) {
    setupGlobalErrorHandling();
  }

  return boundary;
}
