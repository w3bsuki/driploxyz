import type { 
	Currency, 
	PaymentCalculation, 
	CommissionCalculation,
	PaymentFormData,
	PayoutMethod,
	StripeError
} from '$lib/stripe/types';

// =====================================
// CURRENCY & FORMATTING
// =====================================

/**
 * Format currency amount with proper locale and currency symbol
 */
export function formatCurrency(
	amount: number, 
	currency: Currency = 'eur', 
	locale: string = 'en-US'
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency.toUpperCase(),
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

/**
 * Format currency for Stripe (convert to cents/smallest unit)
 */
export function formatForStripe(amount: number, currency: Currency): number {
	// Some currencies don't use decimal places (e.g., JPY, KRW)
	const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];
	
	if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
		return Math.round(amount);
	}
	
	return Math.round(amount * 100);
}

/**
 * Convert from Stripe format (cents) to regular amount
 */
export function formatFromStripe(amount: number, currency: Currency): number {
	const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];
	
	if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
		return amount;
	}
	
	return amount / 100;
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: Currency): string {
	const symbols: Record<Currency, string> = {
		'eur': '€',
		'usd': '$',
		'gbp': '£',
		'bgn': 'лв'
	};
	
	return symbols[currency] || currency.toUpperCase();
}

/**
 * Validate currency amount
 */
export function validateAmount(
	amount: number, 
	currency: Currency,
	minAmount: number = 0.50,
	maxAmount: number = 100000
): { valid: boolean; error?: string } {
	if (amount < minAmount) {
		return { 
			valid: false, 
			error: `Minimum amount is ${formatCurrency(minAmount, currency)}` 
		};
	}
	
	if (amount > maxAmount) {
		return { 
			valid: false, 
			error: `Maximum amount is ${formatCurrency(maxAmount, currency)}` 
		};
	}
	
	return { valid: true };
}

// =====================================
// PAYMENT CALCULATIONS
// =====================================

/**
 * Calculate payment breakdown with fees
 */
export function calculatePayment(
	productPrice: number,
	options: {
		serviceFeeRate?: number;
		shippingCost?: number;
		taxRate?: number;
		currency?: Currency;
	} = {}
): PaymentCalculation {
	const {
		serviceFeeRate = 0.03, // 3%
		shippingCost = 5.00,   // €5.00
		taxRate = 0           // 0% (can be configured by region)
	} = options;

	const serviceFee = Math.round(productPrice * serviceFeeRate * 100) / 100;
	const taxAmount = Math.round(productPrice * taxRate * 100) / 100;
	const totalAmount = productPrice + serviceFee + shippingCost + taxAmount;
	const sellerAmount = productPrice - serviceFee + shippingCost;

	return {
		productPrice,
		serviceFee,
		shippingCost,
		taxAmount,
		totalAmount,
		sellerAmount,
		serviceFeeRate
	};
}

/**
 * Calculate commission for transactions
 */
export function calculateCommission(
	productPrice: number,
	shippingCost: number = 0,
	commissionRate: number = 0.05 // 5% default
): CommissionCalculation {
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

// =====================================
// VALIDATION
// =====================================

/**
 * Validate payment form data
 */
export function validatePaymentForm(data: PaymentFormData): {
	valid: boolean;
	errors: Record<string, string>;
} {
	const errors: Record<string, string> = {};

	// Amount validation
	const amountValidation = validateAmount(data.amount, data.currency);
	if (!amountValidation.valid) {
		errors.amount = amountValidation.error || 'Invalid amount';
	}

	// Product ID validation
	if (!data.productId?.trim()) {
		errors.productId = 'Product ID is required';
	}

	// Seller ID validation
	if (!data.sellerId?.trim()) {
		errors.sellerId = 'Seller ID is required';
	}

	// Currency validation
	const supportedCurrencies: Currency[] = ['eur', 'usd', 'gbp', 'bgn'];
	if (!supportedCurrencies.includes(data.currency)) {
		errors.currency = 'Unsupported currency';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Validate payout method
 */
export function validatePayoutMethod(method: PayoutMethod): {
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

		case 'paypal':
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(method.details)) {
				return { valid: false, error: 'Invalid PayPal email format' };
			}
			if (method.details.length > 254) {
				return { valid: false, error: 'PayPal email too long' };
			}
			break;

		case 'card':
			if (method.details.length < 15) {
				return { valid: false, error: 'Card number too short' };
			}
			if (method.details.length > 19) {
				return { valid: false, error: 'Card number too long' };
			}
			// Basic card number validation (Luhn algorithm would be better)
			if (!/^[0-9\\s-]+$/.test(method.details)) {
				return { valid: false, error: 'Card number contains invalid characters' };
			}
			break;

		case 'bank_transfer':
			if (method.details.length < 10) {
				return { valid: false, error: 'Bank details too short' };
			}
			break;

		default:
			return { valid: false, error: 'Unsupported payout method type' };
	}

	return { valid: true };
}

/**
 * Validate payout amount
 */
export function validatePayoutAmount(
	amount: number,
	availableBalance: number,
	currency: Currency = 'eur',
	minimumPayout: number = 20
): { valid: boolean; error?: string } {
	if (amount <= 0) {
		return { valid: false, error: 'Payout amount must be greater than zero' };
	}

	if (amount < minimumPayout) {
		return { 
			valid: false, 
			error: `Minimum payout amount is ${formatCurrency(minimumPayout, currency)}` 
		};
	}

	if (amount > availableBalance) {
		return { valid: false, error: 'Insufficient balance for payout' };
	}

	return { valid: true };
}

// =====================================
// ERROR HANDLING
// =====================================

/**
 * Format Stripe error messages for user display
 */
export function formatStripeError(error: StripeError | any): string {
	if (!error) return 'An unknown error occurred';

	// Handle Stripe-specific error types
	switch (error.type) {
		case 'card_error':
			switch (error.code) {
				case 'card_declined':
					return 'Your card was declined. Please try a different payment method.';
				case 'insufficient_funds':
					return 'Your card has insufficient funds.';
				case 'expired_card':
					return 'Your card has expired. Please use a different card.';
				case 'incorrect_cvc':
					return 'Your card\'s security code is incorrect.';
				case 'processing_error':
					return 'An error occurred while processing your card. Please try again.';
				case 'incorrect_number':
					return 'Your card number is incorrect.';
				default:
					return error.message || 'Your card was declined.';
			}

		case 'validation_error':
			return error.message || 'Please check your payment information.';

		case 'api_error':
			return 'A payment processing error occurred. Please try again.';

		case 'authentication_error':
			return 'Authentication failed. Please try again.';

		case 'rate_limit_error':
			return 'Too many requests. Please wait a moment and try again.';

		default:
			return error.message || 'An error occurred while processing your payment.';
	}
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: StripeError | any): boolean {
	const retryableCodes = [
		'processing_error',
		'api_error',
		'rate_limit_error'
	];

	return retryableCodes.includes(error.code) || error.type === 'api_error';
}

// =====================================
// FORMATTING UTILITIES
// =====================================

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: {
	type: string;
	card?: { last4: string };
	sepa_debit?: { last4: string };
} | null): string {
	if (!method) return 'Unknown payment method';

	switch (method.type) {
		case 'card':
			return `•••• •••• •••• ${method.card?.last4 || '****'}`;
		
		case 'sepa_debit':
			return `SEPA Debit •••• ${method.sepa_debit?.last4 || '****'}`;
		
		case 'paypal':
			return 'PayPal';
		
		default:
			return method.type?.replace('_', ' ').toUpperCase() || 'Payment method';
	}
}

/**
 * Format payout method for display
 */
export function formatPayoutMethodDisplay(method: PayoutMethod): string {
	switch (method.type) {
		case 'revolut':
			return `Revolut (${method.details})`;
		
		case 'paypal':
			const email = method.details;
			const masked = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
			return `PayPal (${masked})`;
		
		case 'card':
			return `Card (•••• ${method.details.slice(-4)})`;
		
		case 'bank_transfer':
			return `Bank Transfer (${method.name || 'Bank Account'})`;
		
		default:
			return (method as any).type?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
	}
}

/**
 * Get payment status display text and color
 */
export function getPaymentStatusDisplay(status: string): {
	text: string;
	color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
} {
	switch (status.toLowerCase()) {
		case 'succeeded':
		case 'completed':
		case 'paid':
			return { text: 'Completed', color: 'green' };
		
		case 'processing':
		case 'pending':
			return { text: 'Processing', color: 'yellow' };
		
		case 'failed':
		case 'declined':
		case 'canceled':
			return { text: 'Failed', color: 'red' };
		
		case 'requires_action':
		case 'requires_payment_method':
			return { text: 'Action Required', color: 'blue' };
		
		default:
			return { text: status, color: 'gray' };
	}
}

// =====================================
// DATE & TIME UTILITIES
// =====================================

/**
 * Calculate estimated payout arrival date
 */
export function calculatePayoutArrival(
	payoutMethod: PayoutMethod,
	businessDays: boolean = true
): Date {
	const now = new Date();
	let daysToAdd = 0;

	// Different payout methods have different processing times
	switch (payoutMethod.type) {
		case 'revolut':
			daysToAdd = 1; // Usually instant to 1 day
			break;
		case 'paypal':
			daysToAdd = 1; // Usually instant to 1 day
			break;
		case 'bank_transfer':
			daysToAdd = 3; // 2-3 business days
			break;
		case 'card':
			daysToAdd = 5; // 3-5 business days
			break;
		default:
			daysToAdd = 3;
	}

	if (businessDays) {
		// Add business days only (skip weekends)
		let addedDays = 0;
		const result = new Date(now);
		
		while (addedDays < daysToAdd) {
			result.setDate(result.getDate() + 1);
			const dayOfWeek = result.getDay();
			
			// Skip weekends (0 = Sunday, 6 = Saturday)
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				addedDays++;
			}
		}
		
		return result;
	} else {
		// Add calendar days
		const result = new Date(now);
		result.setDate(result.getDate() + daysToAdd);
		return result;
	}
}

// =====================================
// ANALYTICS & REPORTING
// =====================================

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(
	totalViews: number,
	totalPurchases: number
): number {
	if (totalViews === 0) return 0;
	return Math.round((totalPurchases / totalViews) * 100 * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(
	totalRevenue: number,
	totalOrders: number
): number {
	if (totalOrders === 0) return 0;
	return Math.round((totalRevenue / totalOrders) * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(
	currentValue: number,
	previousValue: number
): number {
	if (previousValue === 0) return currentValue > 0 ? 100 : 0;
	return Math.round(((currentValue - previousValue) / previousValue) * 100 * 100) / 100;
}

// =====================================
// CONSTANTS
// =====================================

export const PAYMENT_CONSTANTS = {
	MIN_AMOUNT: 0.50,
	MAX_AMOUNT: 100000,
	MIN_PAYOUT: 20,
	SERVICE_FEE_RATE: 0.03,
	COMMISSION_RATE: 0.05,
	DEFAULT_SHIPPING: 5.00,
	SUPPORTED_CURRENCIES: ['eur', 'usd', 'gbp', 'bgn'] as Currency[],
	PAYOUT_METHODS: ['revolut', 'paypal', 'card', 'bank_transfer'],
	BUSINESS_DAYS: [1, 2, 3, 4, 5] // Monday to Friday
} as const;