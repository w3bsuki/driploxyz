import { dev } from '$app/environment';
import type { HandleServerError, RequestEvent } from '@sveltejs/kit';
import { createLogger } from '$lib/utils/log';

// Debug flag for controlled logging
const isDebug = dev;
const log = createLogger('server-error-handler');

// Error severity levels
enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error categories for better classification
enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN'
}

interface ErrorContext {
  errorId: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  techMessage: string;
  statusCode: number;
  retryable: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Categorize error based on message and context
 */
function categorizeError(error: unknown, event: RequestEvent): ErrorContext {
  const errorId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  let category = ErrorCategory.UNKNOWN;
  let severity = ErrorSeverity.MEDIUM;
  let userMessage = 'An unexpected error occurred. Please try again.';
  let techMessage = String(error);
  let statusCode = 500;
  let retryable = false;

  const metadata = {
    timestamp,
    url: event.url.pathname,
    method: event.request.method,
    userAgent: event.request.headers.get('user-agent'),
    ip: event.getClientAddress(),
    userId: event.locals.user?.id
  };

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    techMessage = error.message;

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('invalid token') || message.includes('session expired')) {
      category = ErrorCategory.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
      statusCode = 401;
      userMessage = 'Your session has expired. Please log in again.';
      retryable = false;
    }
    // Authorization errors
    else if (message.includes('forbidden') || message.includes('insufficient permissions') || message.includes('access denied')) {
      category = ErrorCategory.AUTHORIZATION;
      severity = ErrorSeverity.MEDIUM;
      statusCode = 403;
      userMessage = 'You don\'t have permission to access this resource.';
      retryable = false;
    }
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid input') || message.includes('bad request')) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
      statusCode = 400;
      userMessage = 'Please check your input and try again.';
      retryable = false;
    }
    // Database errors
    else if (message.includes('database') || message.includes('postgres') || message.includes('sql') || message.includes('connection')) {
      category = ErrorCategory.DATABASE;
      severity = ErrorSeverity.HIGH;
      statusCode = 503;
      userMessage = 'Database service temporarily unavailable. Please try again in a moment.';
      retryable = true;
    }
    // Network/timeout errors
    else if (message.includes('timeout') || message.includes('fetch failed') || message.includes('network')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      statusCode = 504;
      userMessage = 'Network error. Please check your connection and try again.';
      retryable = true;
    }
    // Rate limiting
    else if (message.includes('rate limit') || message.includes('too many requests')) {
      category = ErrorCategory.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
      statusCode = 429;
      userMessage = 'Too many requests. Please wait a moment before trying again.';
      retryable = true;
    }
    // External service errors (Stripe, email, etc.)
    else if (message.includes('stripe') || message.includes('payment') || message.includes('email service')) {
      category = ErrorCategory.EXTERNAL_SERVICE;
      severity = ErrorSeverity.HIGH;
      statusCode = 503;
      userMessage = 'External service temporarily unavailable. Please try again later.';
      retryable = true;
    }
    // Configuration errors
    else if (message.includes('env') || message.includes('config') || message.includes('missing key')) {
      category = ErrorCategory.CONFIGURATION;
      severity = ErrorSeverity.CRITICAL;
      statusCode = 500;
      userMessage = 'Service configuration error. Our team has been notified.';
      retryable = false;
    }
    // Supabase specific errors
    else if (message.includes('supabase')) {
      if (message.includes('auth')) {
        category = ErrorCategory.AUTHENTICATION;
        statusCode = 401;
        userMessage = 'Authentication service error. Please try logging in again.';
      } else {
        category = ErrorCategory.DATABASE;
        statusCode = 503;
        userMessage = 'Database service temporarily unavailable. Please try again.';
        retryable = true;
      }
      severity = ErrorSeverity.HIGH;
    }
  }

  return {
    errorId,
    category,
    severity,
    userMessage,
    techMessage,
    statusCode,
    retryable,
    metadata
  };
}

/**
 * Log error with appropriate level based on severity
 */
function logError(context: ErrorContext, error: unknown) {
  const logData = {
    errorId: context.errorId,
    category: context.category,
    severity: context.severity,
    statusCode: String(context.statusCode),
    retryable: context.retryable ? 'yes' : 'no',
    stack: error instanceof Error ? error.stack : undefined
  };

  switch (context.severity) {
    case ErrorSeverity.CRITICAL:
      log.error(`🔥 CRITICAL ERROR [${context.errorId}]: ${context.techMessage}`, logData);
      break;
    case ErrorSeverity.HIGH:
      log.error(`❌ HIGH SEVERITY ERROR [${context.errorId}]: ${context.techMessage}`, logData);
      break;
    case ErrorSeverity.MEDIUM:
      log.warn(`⚠️ MEDIUM SEVERITY ERROR [${context.errorId}]: ${context.techMessage}`, logData);
      break;
    case ErrorSeverity.LOW:
      log.info(`ℹ️ LOW SEVERITY ERROR [${context.errorId}]: ${context.techMessage}`, logData);
      break;
  }
}

/**
 * Report error to monitoring service
 */
function reportError(context: ErrorContext) {
  // In production, send to monitoring service (Sentry, etc.)
  if (!isDebug && context.severity !== ErrorSeverity.LOW) {
    // Example: Sentry.captureException(error, { extra: context });
    console.warn('Error reported to monitoring service:', {
      errorId: context.errorId,
      category: context.category,
      severity: context.severity
    });
  }
}

/**
 * Enhanced error handler with better debugging and user experience
 */
export const createErrorHandler = (): HandleServerError => {
  return async ({ error, event }) => {
    const context = categorizeError(error, event);

    // Log error appropriately
    logError(context, error);

    // Report to monitoring service
    reportError(context);

    // Create response based on environment
    const response: {
      message: string;
      id: string;
      debug?: {
        category: string;
        severity: string;
        statusCode: number;
        retryable: boolean;
        stack?: string;
        techMessage?: string;
        metadata?: Record<string, unknown>;
      };
    } = {
      message: context.userMessage,
      id: context.errorId
    };

    // Add debug information in development
    if (isDebug) {
      response.debug = {
        category: context.category,
        severity: context.severity,
        statusCode: context.statusCode,
        retryable: context.retryable,
        techMessage: context.techMessage,
        stack: error instanceof Error ? error.stack : undefined,
        metadata: context.metadata
      };
    }

    return response;
  };
};