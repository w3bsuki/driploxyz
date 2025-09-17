/**
 * Lightweight Logging Utility
 *
 * Provides simple logging functionality without external dependencies.
 * Designed to work in any environment (browser, server, tests).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

class SimpleLogger implements Logger {
  constructor(
    private prefix: string,
    private minLevel: LogLevel = 'info'
  ) {}

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;

    if (typeof console !== 'undefined' && console.debug) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;

    if (typeof console !== 'undefined' && console.info) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;

    if (typeof console !== 'undefined' && console.warn) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    if (typeof console !== 'undefined' && console.error) {
      console.error(this.formatMessage('error', message, context));
    }
  }
}

/**
 * Create a logger instance with optional prefix
 */
export function createLogger(prefix?: string, minLevel: LogLevel = 'info'): Logger {
  return new SimpleLogger(prefix || '', minLevel);
}

/**
 * Default logger for general use
 */
export const logger = createLogger('UI');

/**
 * No-op logger for testing or when logging should be disabled
 */
export const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
};

/**
 * Get appropriate logger based on environment
 */
export function getLogger(prefix?: string): Logger {
  // In test environments, use noop logger to avoid console spam
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return noopLogger;
  }

  // In development, enable debug logging
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  const minLevel: LogLevel = isDev ? 'debug' : 'info';

  return createLogger(prefix, minLevel);
}