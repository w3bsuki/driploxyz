/**
 * Simple error logging utility for production monitoring
 * Phase 6: Performance Optimization & Production Readiness
 */

interface ErrorContext {
	component?: string;
	action?: string;
	userId?: string;
	productId?: string;
	route?: string;
	userAgent?: string;
	timestamp?: string;
	[key: string]: unknown;
}

interface ErrorLog {
	message: string;
	error: Error | string;
	context: ErrorContext;
	level: 'error' | 'warning' | 'info';
}

class ErrorLogger {
	private isProduction: boolean;
	private logs: ErrorLog[] = [];
	private maxLogs = 100; // Keep only the last 100 errors in memory

	constructor() {
		this.isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
	}

	/**
	 * Log an error with context
	 */
	logError(message: string, error: Error | string, context: ErrorContext = {}): void {
		const errorLog: ErrorLog = {
			message,
			error,
			context: {
				...context,
				timestamp: new Date().toISOString(),
				userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
				route: typeof window !== 'undefined' ? window.location.pathname : undefined
			},
			level: 'error'
		};

		this.addToLog(errorLog);
		this.outputToConsole(errorLog);
	}

	/**
	 * Log a warning with context
	 */
	logWarning(message: string, context: ErrorContext = {}): void {
		const errorLog: ErrorLog = {
			message,
			error: '',
			context: {
				...context,
				timestamp: new Date().toISOString(),
				userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
				route: typeof window !== 'undefined' ? window.location.pathname : undefined
			},
			level: 'warning'
		};

		this.addToLog(errorLog);
		this.outputToConsole(errorLog);
	}

	/**
	 * Log info with context
	 */
	logInfo(message: string, context: ErrorContext = {}): void {
		const errorLog: ErrorLog = {
			message,
			error: '',
			context: {
				...context,
				timestamp: new Date().toISOString(),
				userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
				route: typeof window !== 'undefined' ? window.location.pathname : undefined
			},
			level: 'info'
		};

		this.addToLog(errorLog);
		if (!this.isProduction) {
			this.outputToConsole(errorLog);
		}
	}

	/**
	 * Get all logs (for debugging)
	 */
	getLogs(): ErrorLog[] {
		return [...this.logs];
	}

	/**
	 * Clear all logs
	 */
	clearLogs(): void {
		this.logs = [];
	}

	/**
	 * Add log to memory with size limit
	 */
	private addToLog(errorLog: ErrorLog): void {
		this.logs.push(errorLog);
		if (this.logs.length > this.maxLogs) {
			this.logs = this.logs.slice(-this.maxLogs);
		}
	}

	/**
	 * Output to console with appropriate formatting
	 */
	private outputToConsole(errorLog: ErrorLog): void {
		const { message, error, context, level } = errorLog;
		const contextString = Object.keys(context).length > 0 
			? '\nContext: ' + JSON.stringify(context, null, 2)
			: '';
		
		const errorString = error instanceof Error 
			? `\nError: ${error.message}\nStack: ${error.stack}`
			: error ? `\nError: ${error}` : '';

		switch (level) {
			case 'error':
				console.error(`[ERROR] ${message}${errorString}${contextString}`);
				break;
			case 'warning':
				console.warn(`[WARNING] ${message}${contextString}`);
				break;
			case 'info':
				console.info(`[INFO] ${message}${contextString}`);
				break;
		}
	}

	/**
	 * Performance timing for critical paths
	 */
	startTiming(label: string): () => void {
		const startTime = performance.now();
		
		return () => {
			const endTime = performance.now();
			const duration = endTime - startTime;
			
			this.logInfo(`Performance: ${label}`, {
				duration: `${duration.toFixed(2)}ms`,
				performanceEntry: true
			});
			
			// In production, you might want to send this to analytics
			if (this.isProduction && duration > 1000) {
				// Log slow operations
				this.logWarning(`Slow operation detected: ${label}`, {
					duration: `${duration.toFixed(2)}ms`,
					threshold: '1000ms'
				});
			}
		};
	}
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Convenience exports
export const logError = (message: string, error: Error | string, context?: ErrorContext) => 
	errorLogger.logError(message, error, context);

export const logWarning = (message: string, context?: ErrorContext) => 
	errorLogger.logWarning(message, context);

export const logInfo = (message: string, context?: ErrorContext) => 
	errorLogger.logInfo(message, context);

export const startTiming = (label: string) => errorLogger.startTiming(label);