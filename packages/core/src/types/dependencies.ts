/**
 * Dependency Injection Interfaces for @repo/core
 * 
 * These interfaces allow services to be framework-agnostic by accepting
 * dependencies as constructor parameters instead of importing them directly.
 */

/**
 * Logger interface - implementation provided by the consuming application
 */
export interface Logger {
	info(message: string, ...args: unknown[]): void;
	error(message: string, error?: unknown, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
	supabaseUrl: string;
	stripePublishableKey?: string;
	environment?: 'development' | 'staging' | 'production';
}

/**
 * Payment utilities interface
 * Note: Uses PayoutMethod from '@repo/core/stripe/types'
 */
export interface PaymentUtils {
	/**
	 * Calculate platform commission on a transaction
	 */
	calculateCommission(amount: number, commissionRate?: number): number;

	/**
	 * Validate a payout method
	 */
	validatePayoutMethod(method: { type: string; details?: string }): boolean;
}

/**
 * Error handling utilities interface
 */
export interface ErrorHandler {
	/**
	 * Parse an error into a user-friendly message
	 */
	parseError(error: unknown): string;

	/**
	 * Retry a function with exponential backoff
	 */
	withRetry<T>(
		fn: () => Promise<T>,
		options?: {
			maxRetries?: number;
			retryDelay?: number;
			onRetry?: (attempt: number, error: unknown) => void;
		}
	): Promise<T>;
}

/**
 * Error types for classification
 */
export enum ErrorType {
	NETWORK = 'NETWORK',
	DATABASE = 'DATABASE',
	VALIDATION = 'VALIDATION',
	AUTHENTICATION = 'AUTHENTICATION',
	AUTHORIZATION = 'AUTHORIZATION',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	RATE_LIMIT = 'RATE_LIMIT',
	UNKNOWN = 'UNKNOWN'
}
