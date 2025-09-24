import type { Stripe } from 'stripe';

// =====================================
// PAYMENT INTENTS
// =====================================

export interface PaymentIntent {
	id: string;
	amount: number;
	currency: string;
	status: string;
	client_secret?: string;
	metadata?: Record<string, string>;
}

export interface PaymentIntentCreateParams {
	amount: number;
	currency: string;
	productId: string;
	sellerId: string;
	buyerId: string;
	metadata?: Record<string, string>;
}

export interface PaymentIntentConfirmParams {
	paymentIntentId: string;
	buyerId: string;
}

// =====================================
// SUBSCRIPTIONS
// =====================================

export interface SubscriptionCreateParams {
	userId: string;
	planId: string;
	discountPercent?: number;
}

export interface SubscriptionPlan {
	id: string;
	name: string;
	description?: string;
	plan_type: 'premium' | 'brand';
	price_monthly: number;
	currency: string;
	is_active: boolean;
	features: string[];
}

export interface UserSubscription {
	id: string;
	user_id: string;
	plan_id: string;
	stripe_subscription_id: string;
	status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid';
	current_period_start: string;
	current_period_end: string;
	trial_end?: string;
	discount_percent?: number;
	created_at: string;
	updated_at: string;
}

// =====================================
// PAYOUTS
// =====================================

export interface PayoutMethod {
	type: 'revolut' | 'paypal' | 'card' | 'bank_transfer';
	details: string;
	name?: string;
	metadata?: Record<string, string>;
}

export interface PayoutParams {
	sellerId: string;
	amount: number;
	payoutMethod: PayoutMethod;
}

export interface PayoutRecord {
	id: string;
	seller_id: string;
	amount: number;
	payout_method: PayoutMethod;
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
	transaction_ids: string[];
	requested_at: string;
	processed_at?: string;
	completed_at?: string;
	processed_by?: string;
	notes?: string;
	error_message?: string;
}

// =====================================
// TRANSACTIONS
// =====================================

export interface TransactionRecord {
	id: string;
	order_id: string;
	seller_id: string;
	buyer_id: string;
	product_id: string;
	product_price: number;
	shipping_cost: number;
	total_amount: number;
	commission_rate: number;
	commission_amount: number;
	seller_amount: number;
	stripe_payment_intent_id: string;
	payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
	processed_at?: string;
	created_at: string;
	updated_at: string;
}

// =====================================
// CALCULATIONS
// =====================================

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

// =====================================
// WEBHOOKS
// =====================================

export interface StripeWebhookEvent {
	id: string;
	type: string;
	data: {
		object: Stripe.Event.Data.Object;
	};
	created: number;
	livemode: boolean;
	pending_webhooks: number;
	request: {
		id?: string;
		idempotency_key?: string;
	};
	api_version?: string;
}

// =====================================
// CUSTOMER & PROFILE
// =====================================

export interface StripeCustomerData {
	userId: string;
	email?: string;
	name?: string;
	phone?: string;
	address?: Stripe.Address;
	metadata?: Record<string, string>;
}

export interface UserProfile {
	id: string;
	username: string;
	email?: string;
	full_name?: string;
	total_earnings: number;
	pending_payout: number;
	subscription_tier: 'free' | 'premium' | 'brand';
	subscription_expires_at?: string;
	last_payout_at?: string;
	account_type: 'personal' | 'brand';
	payment_methods?: PaymentMethod[];
}

// =====================================
// PAYMENT METHODS
// =====================================

export interface PaymentMethod {
	id: string;
	type: 'card' | 'sepa_debit' | 'ideal' | 'paypal';
	card?: {
		brand: string;
		last4: string;
		exp_month: number;
		exp_year: number;
	};
	sepa_debit?: {
		last4: string;
		bank_code?: string;
	};
	is_default: boolean;
	created_at: string;
}

// =====================================
// ORDERS & PRODUCTS
// =====================================

export interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
	currency: string;
	images: string[];
	seller_id: string;
	status: 'active' | 'sold' | 'inactive';
	category?: string;
	brand?: string;
	size?: string;
	condition?: string;
	shipping_cost?: number;
	created_at: string;
	updated_at: string;
	sold_at?: string;
}

export interface Order {
	id: string;
	product_id: string;
	buyer_id: string;
	seller_id: string;
	total_amount: number;
	shipping_cost: number;
	tax_amount: number;
	service_fee: number;
	commission_amount?: number;
	seller_amount?: number;
	status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
	payment_intent_id?: string;
	transaction_id?: string;
	tracking_number?: string;
	shipping_address?: Stripe.Address;
	notes?: string;
	created_at: string;
	updated_at: string;
	delivered_at?: string;
}

// =====================================
// NOTIFICATIONS
// =====================================

export interface NotificationData {
	userId: string;
	type: 'sale' | 'purchase' | 'payout' | 'subscription' | 'dispute';
	title: string;
	message: string;
	relatedId?: string;
	relatedTable?: string;
	metadata?: Record<string, unknown>;
}

// =====================================
// API RESPONSES
// =====================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
	clientSecret?: string;
	paymentIntentId?: string;
	subscriptionId?: string;
	status: string;
	error?: string;
}

export interface PayoutResponse {
	payoutId?: string;
	status: 'requested' | 'processing' | 'completed' | 'failed';
	amount: number;
	estimated_arrival?: string;
	error?: string;
}

// =====================================
// ERROR HANDLING
// =====================================

export interface StripeError {
	type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error' | 'idempotency_error';
	code?: string;
	message: string;
	param?: string;
	decline_code?: string;
	charge?: string;
	payment_intent?: string;
	setup_intent?: string;
	source?: string;
}

// =====================================
// PLATFORM STATISTICS
// =====================================

export interface PlatformStats {
	totalTransactions: number;
	totalVolume: number;
	totalCommission: number;
	monthlyRecurringRevenue: number;
	activeSubscriptions: number;
	pendingPayouts: number;
	monthlyGrowthRate: number;
}

export interface SellerStats {
	totalSales: number;
	totalEarnings: number;
	pendingPayout: number;
	totalPaidOut: number;
	averageOrderValue: number;
	salesThisMonth: number;
	conversionRate: number;
}

// =====================================
// UTILITY TYPES
// =====================================

export type Currency = 'eur' | 'usd' | 'gbp' | 'bgn';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
export type AccountType = 'personal' | 'brand';
export type SubscriptionTier = 'free' | 'premium' | 'brand';
export type NotificationType = 'sale' | 'purchase' | 'payout' | 'subscription' | 'dispute' | 'system';

// =====================================
// CONFIGURATION
// =====================================

export interface StripeConfig {
	publishableKey: string;
	secretKey: string;
	webhookSecret: string;
	apiVersion: string;
	testMode: boolean;
}

export interface PaymentConfig {
	supportedCurrencies: Currency[];
	defaultCurrency: Currency;
	minimumAmount: number;
	maximumAmount: number;
	commissionRate: number;
	shippingCost: number;
	minimumPayoutAmount: number;
}

// =====================================
// FORM DATA TYPES
// =====================================

export interface PaymentFormData {
	amount: number;
	currency: Currency;
	productId: string;
	sellerId: string;
	shippingAddress?: Stripe.Address;
	billingAddress?: Stripe.Address;
	paymentMethodId?: string;
	savePaymentMethod?: boolean;
}

export interface SubscriptionFormData {
	planId: string;
	paymentMethodId?: string;
	discountCode?: string;
	billingAddress?: Stripe.Address;
}

export interface PayoutFormData {
	amount: number;
	payoutMethod: PayoutMethod;
	confirmation: boolean;
}