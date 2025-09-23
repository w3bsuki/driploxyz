import { dev } from '$app/environment';
import { browser } from '$app/environment';

/**
 * Centralized logging system for Driplo Admin
 * 
 * Features:
 * - Environment-aware (dev vs prod)
 * - Browser-aware (client vs server)
 * - Debug flag support via localStorage
 * - Structured logging with context
 * - Production log filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
	component?: string;
	function?: string;
	userId?: string;
	productId?: string;
	orderId?: string;
	conversationId?: string;
	[key: string]: string | number | undefined;
}

class Logger {
	private isDev = dev;
	private debugEnabled = false;

	constructor() {
		// Check for debug flags in browser
		if (browser) {
			this.debugEnabled = 
				Boolean(localStorage.getItem('debug_driplo')) ||
				Boolean(localStorage.getItem('debug_messaging')) ||
				Boolean(localStorage.getItem('debug_performance')) ||
				Boolean(localStorage.getItem('debug_auth'));
		}
	}

	/**
	 * Log debug messages - only in dev or when explicitly enabled
	 */
	debug(message: string, context?: LogContext): void {
		if (!this.isDev && !this.debugEnabled) return;
		this.log('debug', message, context);
	}

	/**
	 * Log info messages
	 */
	info(message: string, context?: LogContext): void {
		this.log('info', message, context);
	}

	/**
	 * Log warning messages
	 */
	warn(message: string, context?: LogContext): void {
		this.log('warn', message, context);
	}

	/**
	 * Log error messages - always logged
	 */
	error(message: string, error?: Error | unknown, context?: LogContext): void {
		const errorContext = error instanceof Error 
			? { ...context, errorName: error.name, errorMessage: error.message, stack: error.stack }
			: { ...context, error: String(error) };
		
		this.log('error', message, errorContext);
	}

	/**
	 * Performance logging - only in dev or when performance debug enabled
	 */
	perf(operation: string, duration: number, context?: LogContext): void {
		if (!this.isDev && !browser) return;
		if (browser && !localStorage.getItem('debug_performance')) return;
		
		this.log('info', `Performance: ${operation} took ${duration}ms`, context);
	}

	/**
	 * Internal logging method
	 */
	private log(level: LogLevel, message: string, context?: LogContext): void {
		const timestamp = new Date().toISOString();
		const env = browser ? 'client' : 'server';
		
		// Structured log entry
		const logEntry = {
			timestamp,
			level,
			env,
			message,
			...context
		};

		// In production, only log warnings and errors to console
		if (!this.isDev && level !== 'warn' && level !== 'error') {
			return;
		}

		// Pretty print in development, structured in production
		if (this.isDev) {
			const prefix = `[${timestamp}] [${level.toUpperCase()}] [${env}]`;
			const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
			
			switch (level) {
				case 'debug':
					console.debug(`${prefix} ${message}${contextStr}`);
					break;
				case 'info':
					console.info(`${prefix} ${message}${contextStr}`);
					break;
				case 'warn':
					
					break;
				case 'error':
					
					break;
			}
		} else {
			// Production: structured JSON for log aggregation
			switch (level) {
				case 'warn':
					
					break;
				case 'error':
					
					break;
			}
		}
	}

	/**
	 * Create a logger instance with predefined context
	 */
	withContext(context: LogContext): Logger {
		const logger = new Logger();
		const originalLog = logger.log.bind(logger);
		
		logger.log = (level: LogLevel, message: string, additionalContext?: LogContext) => {
			originalLog(level, message, { ...context, ...additionalContext });
		};
		
		return logger;
	}

	/**
	 * Measure and log execution time
	 */
	time<T>(operation: string, fn: () => T, context?: LogContext): T;
	time<T>(operation: string, fn: () => Promise<T>, context?: LogContext): Promise<T>;
	time<T>(operation: string, fn: () => T | Promise<T>, context?: LogContext): T | Promise<T> {
		const start = performance.now();
		
		try {
			const result = fn();
			
			if (result instanceof Promise) {
				return result.finally(() => {
					const duration = performance.now() - start;
					this.perf(operation, duration, context);
				});
			} else {
				const duration = performance.now() - start;
				this.perf(operation, duration, context);
				return result;
			}
		} catch (error) {
			const duration = performance.now() - start;
			this.error(`Operation failed: ${operation}`, error, { ...context, duration });
			throw error;
		}
	}
}

// Global logger instance
export const log = new Logger();

// Convenience functions for common patterns
export const createLogger = (component: string) => 
	log.withContext({ component });

// Debug helpers
export const enableDebug = (feature?: string) => {
	if (browser) {
		const key = feature ? `debug_${feature}` : 'debug_driplo';
		localStorage.setItem(key, '1');
		console.info(`Debug enabled for ${feature || 'all features'}`);
	}
};

export const disableDebug = (feature?: string) => {
	if (browser) {
		const key = feature ? `debug_${feature}` : 'debug_driplo';
		localStorage.removeItem(key);
		console.info(`Debug disabled for ${feature || 'all features'}`);
	}
};

// Component-specific loggers for high-usage areas
export const messagingLogger = createLogger('messaging');
export const authLogger = createLogger('auth');
export const performanceLogger = createLogger('performance');
export const paymentLogger = createLogger('payment');