import { vi } from 'vitest';

// Mock Stripe payment data
export const mockPaymentIntent = {
	id: 'pi_test_123',
	client_secret: 'pi_test_123_secret_456',
	amount: 2000,
	currency: 'usd',
	status: 'requires_payment_method' as const,
	payment_method: null,
	created: Math.floor(Date.now() / 1000),
	description: 'Test payment'
};

export const mockSuccessfulPaymentIntent = {
	...mockPaymentIntent,
	status: 'succeeded' as const,
	payment_method: 'pm_test_123'
};

export const mockCustomer = {
	id: 'cus_test_123',
	email: 'test@example.com',
	created: Math.floor(Date.now() / 1000),
	description: 'Test customer'
};

export const mockSubscription = {
	id: 'sub_test_123',
	customer: 'cus_test_123',
	status: 'active' as const,
	current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days from now
	current_period_start: Math.floor(Date.now() / 1000),
	created: Math.floor(Date.now() / 1000)
};

export const mockProduct = {
	id: 'prod_test_123',
	name: 'Test Product',
	description: 'A test product',
	active: true,
	created: Math.floor(Date.now() / 1000)
};

export const mockPrice = {
	id: 'price_test_123',
	product: 'prod_test_123',
	unit_amount: 2000,
	currency: 'usd',
	recurring: null,
	active: true,
	created: Math.floor(Date.now() / 1000)
};

export const mockWebhookEvent = {
	id: 'evt_test_123',
	type: 'payment_intent.succeeded' as const,
	created: Math.floor(Date.now() / 1000),
	data: {
		object: mockSuccessfulPaymentIntent
	},
	livemode: false,
	pending_webhooks: 0,
	request: {
		id: 'req_test_123',
		idempotency_key: null
	}
};

// Helper functions for creating test scenarios
export const createPaymentIntentScenario = (status: string = 'requires_payment_method') => ({
	...mockPaymentIntent,
	status
});

export const createSubscriptionScenario = (status: string = 'active') => ({
	...mockSubscription,
	status
});

export const createWebhookScenario = (type: string, data: any = mockSuccessfulPaymentIntent) => ({
	...mockWebhookEvent,
	type,
	data: { object: data }
});

// Mock Stripe errors
export const mockStripeError = {
	type: 'card_error' as const,
	code: 'card_declined',
	message: 'Your card was declined.',
	decline_code: 'generic_decline'
};

export const mockApiError = {
	type: 'api_error' as const,
	message: 'Something went wrong on our end.'
};

// Helper to simulate Stripe responses
export const mockStripeResponse = <T>(data: T, error: any = null) => {
	if (error) {
		return Promise.reject(error);
	}
	return Promise.resolve(data);
};