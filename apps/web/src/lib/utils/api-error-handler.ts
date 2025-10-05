/**
 * Centralized API error handler for consistent error responses
 */

import { json } from '@sveltejs/kit';
import { paymentLogger } from '$lib/utils/log';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  status: number;
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown,
  requestId?: string
): Response {
  const errorResponse: ApiError = {
    code,
    message,
    details,
    status,
    timestamp: new Date().toISOString(),
    requestId
  };

  const response: ApiResponse = {
    success: false,
    error: errorResponse,
    timestamp: new Date().toISOString(),
    requestId
  };

  return json(response, { status });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): Response {
  const response: ApiResponse = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  };

  return json(response, { status });
}

/**
 * Handle errors in API routes with proper logging
 */
export function handleApiError(
  error: unknown,
  context: {
    operation?: string;
    userId?: string;
    requestId?: string;
    additionalData?: Record<string, unknown>;
  } = {}
): Response {
  const { operation, userId, requestId, additionalData } = context;

  // Generate request ID if not provided
  const generatedRequestId = requestId || Math.random().toString(36).substr(2, 9);

  // Log the error with context
  if (error instanceof Error) {
    paymentLogger.error(`${operation} failed`, error, {
      operation,
      userId,
      requestId: generatedRequestId,
      ...additionalData
    });

    // Check for known error types
    if (error.message.includes('duplicate key')) {
      return createErrorResponse(
        'DUPLICATE_RESOURCE',
        'Resource already exists',
        409,
        error.message,
        generatedRequestId
      );
    }

    if (error.message.includes('not found')) {
      return createErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Resource not found',
        404,
        error.message,
        generatedRequestId
      );
    }

    if (error.message.includes('permission denied') || error.message.includes('unauthorized')) {
      return createErrorResponse(
        'PERMISSION_DENIED',
        'Permission denied',
        403,
        error.message,
        generatedRequestId
      );
    }

    if (error.message.includes('validation')) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid input data',
        400,
        error.message,
        generatedRequestId
      );
    }

    // Generic error
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An internal error occurred',
      500,
      error.message,
      generatedRequestId
    );
  } else {
    // Non-Error object
    paymentLogger.error(`${operation} failed with non-Error object`, String(error), {
      operation,
      userId,
      requestId: generatedRequestId,
      ...additionalData,
      errorType: typeof error
    });

    return createErrorResponse(
      'INTERNAL_ERROR',
      'An internal error occurred',
      500,
      'Unknown error',
      generatedRequestId
    );
  }
}

/**
 * Wrap API route handlers with consistent error handling
 */
export function withErrorHandler<T extends Record<string, unknown>>(
  handler: (params: T) => Promise<Response> | Response
): (params: T) => Promise<Response> {
  return async (params: T): Promise<Response> => {
    try {
      return await handler(params);
    } catch (error) {
      return handleApiError(error, {
        operation: 'API Operation'
      });
    }
  };
}

/**
 * Common error codes for consistent responses
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}