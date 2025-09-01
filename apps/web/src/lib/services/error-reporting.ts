import { browser, dev } from '$app/environment';
import type { User } from '@supabase/supabase-js';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
	Fatal = 'fatal',
	Error = 'error',
	Warning = 'warning',
	Info = 'info',
	Debug = 'debug'
}

/**
 * Error context interface
 */
export interface ErrorContext {
	user?: Partial<User>;
	tags?: Record<string, string>;
	extra?: Record<string, unknown>;
	fingerprint?: string[];
	level?: ErrorSeverity;
}

/**
 * Error reporting configuration
 */
interface ErrorReportingConfig {
	dsn?: string;
	environment: string;
	release?: string;
	sampleRate: number;
	enabled: boolean;
}

/**
 * Error reporting service
 * Prepares for Sentry integration while providing fallback logging
 */
class ErrorReportingService {
	private config: ErrorReportingConfig;
	private queue: Array<{ error: Error; context: ErrorContext }> = [];
	private isInitialized = false;
	
	constructor() {
		this.config = {
			environment: dev ? 'development' : 'production',
			sampleRate: dev ? 1.0 : 0.1,
			enabled: !dev && browser
		};
	}
	
	/**
	 * Initialize error reporting (will integrate with Sentry)
	 */
	async initialize(config?: Partial<ErrorReportingConfig>) {
		if (this.isInitialized) return;
		
		this.config = { ...this.config, ...config };
		
		if (!this.config.enabled) {
			console.info('Error reporting disabled in development');
			return;
		}
		
		// Sentry integration planned for future implementation
		
		this.isInitialized = true;
		
		// Process queued errors
		this.processQueue();
		
		// Setup global error handlers
		this.setupGlobalHandlers();
	}
	
	/**
	 * Capture an error with context
	 */
	captureError(error: Error | string, context: ErrorContext = {}) {
		const errorObj = typeof error === 'string' ? new Error(error) : error;
		
		if (!this.config.enabled) {
			this.logError(errorObj, context);
			return;
		}
		
		if (!this.isInitialized) {
			this.queue.push({ error: errorObj, context });
			return;
		}
		
		this.sendToReporting(errorObj, context);
	}
	
	/**
	 * Capture a message with context
	 */
	captureMessage(message: string, context: ErrorContext = {}) {
		if (!this.config.enabled) {
			console.log(`[${context.level || 'info'}]`, message, context);
			return;
		}
		
		// Future: Send to Sentry when integrated
		
		this.logError(new Error(message), context);
	}
	
	/**
	 * Set user context for error reporting
	 */
	setUser(_user: Partial<User> | null) {
		if (!this.config.enabled || !this.isInitialized) return;
		
		// Future: Set Sentry user context
	}
	
	/**
	 * Add breadcrumb for debugging
	 */
	addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
		if (!this.config.enabled || !this.isInitialized) return;
		
		// Future: Add Sentry breadcrumb
		
		if (dev) {
			console.log(`[Breadcrumb] ${category}: ${message}`, data);
		}
	}
	
	/**
	 * Private: Send error to reporting service
	 */
	private sendToReporting(error: Error, context: ErrorContext) {
		// Future: Send to Sentry when integrated
		
		this.logError(error, context);
	}
	
	/**
	 * Private: Log error to console
	 */
	private logError(error: Error, context: ErrorContext) {
		const level = context.level || ErrorSeverity.Error;
		const logMethod = level === ErrorSeverity.Warning ? 'warn' : 'error';
		
		console[logMethod](`[${level.toUpperCase()}]`, error.message, {
			stack: error.stack,
			...context
		});
	}
	
	/**
	 * Private: Process queued errors
	 */
	private processQueue() {
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (item) {
				this.sendToReporting(item.error, item.context);
			}
		}
	}
	
	/**
	 * Private: Setup global error handlers
	 */
	private setupGlobalHandlers() {
		if (!browser) return;
		
		// Handle unhandled errors
		window.addEventListener('error', (event) => {
			this.captureError(event.error || new Error(event.message), {
				level: ErrorSeverity.Error,
				extra: {
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno
				}
			});
		});
		
		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			this.captureError(
				new Error(`Unhandled Promise Rejection: ${event.reason}`),
				{
					level: ErrorSeverity.Error,
					extra: {
						reason: event.reason,
						promise: event.promise
					}
				}
			);
		});
	}
	
	/**
	 * Create a wrapped function that captures errors
	 */
	wrapFunction<T extends (...args: any[]) => any>(
		fn: T,
		context?: ErrorContext
	): T {
		return ((...args: Parameters<T>) => {
			try {
				const result = fn(...args);
				if (result instanceof Promise) {
					return result.catch((error) => {
						this.captureError(error, context);
						throw error;
					});
				}
				return result;
			} catch (error) {
				this.captureError(error as Error, context);
				throw error;
			}
		}) as T;
	}
	
	/**
	 * Performance monitoring
	 */
	startTransaction(name: string, op: string) {
		// Future: Integrate with Sentry Performance
		
		return {
			finish: () => {
				if (dev) {
					console.log(`[Transaction] ${op}: ${name} completed`);
				}
			}
		};
	}
}

// Export singleton instance
export const errorReporting = new ErrorReportingService();

// Export convenience functions
export const captureError = (error: Error | string, context?: ErrorContext) =>
	errorReporting.captureError(error, context);

export const captureMessage = (message: string, context?: ErrorContext) =>
	errorReporting.captureMessage(message, context);

export const setErrorUser = (user: Partial<User> | null) =>
	errorReporting.setUser(user);

export const addBreadcrumb = (message: string, category: string, data?: Record<string, unknown>) =>
	errorReporting.addBreadcrumb(message, category, data);