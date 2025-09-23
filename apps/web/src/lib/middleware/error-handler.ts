/**
 * Error Handling Middleware for SvelteKit API Routes
 * Provides comprehensive error handling and logging
 */

interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  timestamp: string;
  requestId?: string;
}

interface LogEntry {
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: Error;
  request?: {
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
  };
  userId?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Error types for better error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Logging utility
 */
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  log(entry: LogEntry) {
    // Add to in-memory store
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}`;
      
      switch (entry.level) {
        case 'error':
          console.error(logMessage, entry.error);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        default:
          console.info(logMessage);
      }
    }

    // In production, you would send to external logging service
    // Example: Sentry, LogRocket, etc.
  }

  error(message: string, error?: Error, request?: LogEntry['request'], userId?: string, requestId?: string) {
    this.log({
      level: 'error',
      message,
      error,
      request,
      userId,
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  warn(message: string, request?: LogEntry['request'], userId?: string, requestId?: string) {
    this.log({
      level: 'warn',
      message,
      request,
      userId,
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  info(message: string, request?: LogEntry['request'], userId?: string, requestId?: string) {
    this.log({
      level: 'info',
      message,
      request,
      userId,
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  getLogs(level?: LogEntry['level'], limit: number = 100): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }
}

export const logger = new Logger();

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Extract request information
 */
function extractRequestInfo(request: Request): LogEntry['request'] {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip
  };
}

/**
 * Create error response
 */
function createErrorResponse(
  error: Error | AppError,
  requestId?: string,
  includeStack: boolean = false
): Response {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const code = isAppError ? error.code : 'INTERNAL_ERROR';
  
  const errorResponse: ErrorResponse = {
    error: error.message,
    code,
    timestamp: new Date().toISOString(),
    requestId
  };

  // Include stack trace in development
  if (includeStack && process.env.NODE_ENV === 'development') {
    (errorResponse as unknown as Record<string, unknown>).stack = error.stack;
  }

  // Don't expose internal errors in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    errorResponse.error = 'Internal server error';
    errorResponse.message = 'An unexpected error occurred';
  }

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId || ''
      }
    }
  );
}

/**
 * Main error handling middleware
 */
export function handleError(
  error: Error | AppError,
  request: Request,
  userId?: string
): Response {
  const requestId = generateRequestId();
  const requestInfo = extractRequestInfo(request);
  const isAppError = error instanceof AppError;
  
  // Log the error
  if (isAppError && error.isOperational) {
    // Operational errors - expected errors
    logger.warn(
      `Operational error: ${error.message}`,
      requestInfo,
      userId,
      requestId
    );
  } else {
    // Programming errors - unexpected errors
    logger.error(
      `Unexpected error: ${error.message}`,
      error,
      requestInfo,
      userId,
      requestId
    );
  }

  return createErrorResponse(error, requestId);
}

/**
 * Async error wrapper for API route handlers
 */
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error; // Re-throw to be handled by the main error handler
    }
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): Response {
  const response = new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId || ''
      }
    }
  );

  return response;
}

/**
 * Health check endpoint response
 */
export function createHealthResponse(): Response {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Not found response
 */
export function createNotFoundResponse(resource: string = 'Resource'): Response {
  return new Response(
    JSON.stringify({
      error: `${resource} not found`,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Method not allowed response
 */
export function createMethodNotAllowedResponse(allowedMethods: string[]): Response {
  return new Response(
    JSON.stringify({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      allowedMethods,
      timestamp: new Date().toISOString()
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': allowedMethods.join(', ')
      }
    }
  );
}


