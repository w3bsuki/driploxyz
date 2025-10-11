/**
 * Stripe-related types for payment processing
 */

export type Currency = 'eur' | 'usd' | 'gbp' | 'bgn';

export interface PaymentFormData {
	amount: number;
	currency: Currency;
	productId: string;
	sellerId: string;
	buyerId?: string;
}

export interface PaymentCalculation {
	productPrice: number;
	serviceFee: number;
	shippingCost: number;
	taxAmount: number;
	totalAmount: number;
	sellerAmount: number;
	serviceFeeRate: number;
}

export interface CommissionCalculation {
	productPrice: number;
	shippingCost: number;
	commissionRate: number;
	commissionAmount: number;
	sellerAmount: number;
	totalAmount: number;
}

export interface PayoutMethod {
	type: 'revolut' | 'paypal' | 'card' | 'bank_transfer';
	details: string;
	name?: string; // For bank transfers
}

export interface StripeError {
	type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
	code?: string;
	message?: string;
}

export interface StripePaymentMethod {
	type: string;
	card?: {
		last4: string;
		brand: string;
		expiry: string;
	};
	sepa_debit?: {
		last4: string;
	};
}