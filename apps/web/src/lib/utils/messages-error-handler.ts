import { messagingLogger } from '$lib/utils/log';

export interface MessageError {
  code: string;
  message: string;
  context?: Record<string, any>;
  retryable: boolean;
}

export class MessagesErrorHandler {
  static handle(error: any, context: Record<string, any> = {}): MessageError {
    const errorCode = this.getErrorCode(error);
    const errorMessage = this.getErrorMessage(error);
    const isRetryable = this.isRetryableError(error);

    // Log the error with context
    messagingLogger.error('Messages system error', error, {
      ...context,
      errorCode,
      retryable: String(isRetryable)
    });

    return {
      code: errorCode,
      message: errorMessage,
      context,
      retryable: isRetryable
    };
  }

  private static getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.message?.includes('network')) return 'NETWORK_ERROR';
    if (error?.message?.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error?.message?.includes('unauthorized')) return 'AUTH_ERROR';
    if (error?.message?.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    if (error?.message?.includes('connection')) return 'CONNECTION_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private static getErrorMessage(error: any): string {
    const userFriendlyMessages = {
      NETWORK_ERROR: 'Connection problem. Please check your internet.',
      TIMEOUT_ERROR: 'Request timed out. Please try again.',
      AUTH_ERROR: 'Authentication failed. Please sign in again.',
      RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment.',
      CONNECTION_ERROR: 'Unable to connect. Please try again.',
      UNKNOWN_ERROR: 'Something went wrong. Please try again.'
    };

    const code = this.getErrorCode(error);
    return userFriendlyMessages[code as keyof typeof userFriendlyMessages] || 
           'An error occurred. Please try again.';
  }

  private static isRetryableError(error: any): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR', 
      'CONNECTION_ERROR',
      'RATE_LIMIT_ERROR'
    ];
    
    return retryableCodes.includes(this.getErrorCode(error));
  }
}

export class MessageRetryManager {
  private retryAttempts = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    context: Record<string, any> = {}
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      const messageError = MessagesErrorHandler.handle(error, {
        ...context,
        operationId,
        attempt: attempts + 1
      });

      if (messageError.retryable && attempts < this.maxRetries) {
        this.retryAttempts.set(operationId, attempts + 1);
        
        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempts);
        
        messagingLogger.info(`Retrying operation ${operationId} in ${delay}ms`, {
          attempt: attempts + 1,
          maxRetries: this.maxRetries
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, operationId, context);
      }

      // Max retries reached or non-retryable error
      this.retryAttempts.delete(operationId);
      throw messageError;
    }
  }
}

// Performance monitoring
export class MessagePerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(operationId: string): void {
    this.timers.set(operationId, Date.now());
  }

  static endTimer(operationId: string): number {
    const startTime = this.timers.get(operationId);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.timers.delete(operationId);

    // Log slow operations
    if (duration > 2000) {
      messagingLogger.warn('Slow message operation detected', {
        operationId,
        duration,
        threshold: 2000
      });
    }

    return duration;
  }

  static async measureAsync<T>(
    operation: () => Promise<T>,
    operationId: string
  ): Promise<T> {
    this.startTimer(operationId);
    try {
      const result = await operation();
      const duration = this.endTimer(operationId);
      
      messagingLogger.info('Message operation completed', {
        operationId,
        duration: String(duration),
        success: String(true)
      });

      return result;
    } catch (error) {
      const duration = this.endTimer(operationId);
      
      messagingLogger.error('Message operation failed', error, {
        operationId,
        duration: String(duration),
        success: String(false)
      });

      throw error;
    }
  }
}