/**
 * Framework-agnostic payment utility functions
 * These can be imported and used across any app in the monorepo
 */

import type { PayoutMethod } from '../stripe/types';

/**
 * Calculate commission for transactions
 */
export function calculateCommission(
	productPrice: number,
	commissionRate: number = 0.05 // 5% default
): number {
	return Math.round(productPrice * commissionRate * 100) / 100;
}

/**
 * Calculate full commission details
 */
export function calculateCommissionDetails(
	productPrice: number,
	shippingCost: number = 0,
	commissionRate: number = 0.05 // 5% default
): {
	productPrice: number;
	shippingCost: number;
	commissionRate: number;
	commissionAmount: number;
	sellerAmount: number;
	totalAmount: number;
} {
	const totalAmount = productPrice + shippingCost;
	const commissionAmount = Math.round(productPrice * commissionRate * 100) / 100;
	const sellerAmount = Math.round((productPrice - commissionAmount + shippingCost) * 100) / 100;
	
	return {
		productPrice,
		shippingCost,
		commissionRate,
		commissionAmount,
		sellerAmount,
		totalAmount
	};
}

/**
 * Validate payout method
 */
export function validatePayoutMethod(method: PayoutMethod): boolean {
	if (!method?.type || !method?.details) {
		return false;
	}

	switch (method.type) {
		case 'revolut':
			if (!method.details.startsWith('@')) {
				return false;
			}
			if (method.details.length < 3 || method.details.length > 30) {
				return false;
			}
			if (!/^@[a-zA-Z0-9_-]+$/.test(method.details)) {
				return false;
			}
			break;

		case 'paypal': {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(method.details)) {
				return false;
			}
			if (method.details.length > 254) {
				return false;
			}
			break;
		}

		case 'card':
		case 'bank_transfer':
			// Additional validation can be added here
			if (!method.details || method.details.length < 3) {
				return false;
			}
			break;

		default:
			return false;
	}

	return true;
}

/**
 * Validate payout method with detailed error message
 */
export function validatePayoutMethodWithError(method: PayoutMethod): {
	valid: boolean;
	error?: string;
} {
	if (!method?.type || !method?.details) {
		return { valid: false, error: 'Payout method type and details are required' };
	}

	switch (method.type) {
		case 'revolut':
			if (!method.details.startsWith('@')) {
				return { valid: false, error: 'Revolut tag must start with @' };
			}
			if (method.details.length < 3) {
				return { valid: false, error: 'Revolut tag must be at least 3 characters' };
			}
			if (method.details.length > 30) {
				return { valid: false, error: 'Revolut tag too long' };
			}
			if (!/^@[a-zA-Z0-9_-]+$/.test(method.details)) {
				return { valid: false, error: 'Revolut tag contains invalid characters' };
			}
			break;

		case 'paypal': {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(method.details)) {
				return { valid: false, error: 'Invalid PayPal email format' };
			}
			if (method.details.length > 254) {
				return { valid: false, error: 'PayPal email too long' };
			}
			break;
		}

		case 'card':
		case 'bank_transfer':
			if (!method.details || method.details.length < 3) {
				return { valid: false, error: 'Payout method details are too short' };
			}
			break;

		default:
			return { valid: false, error: 'Unsupported payout method type' };
	}

	return { valid: true };
}

/**
 * Calculate subscription discount
 */
export function calculateSubscriptionDiscount(
	monthlyPrice: number,
	discountPercent: number,
	months: number = 1
): {
	originalAmount: number;
	discountAmount: number;
	finalAmount: number;
	totalSavings: number;
} {
	const originalAmount = monthlyPrice * months;
	const discountAmount = Math.round(originalAmount * (discountPercent / 100) * 100) / 100;
	const finalAmount = originalAmount - discountAmount;
	
	return {
		originalAmount,
		discountAmount,
		finalAmount,
		totalSavings: discountAmount
	};
}
