import { vi } from 'vitest';

// Mock Stripe client-side
export const createMockStripe = () => ({
	elements: vi.fn().mockReturnValue({
		create: vi.fn().mockReturnValue({
			mount: vi.fn(),
			unmount: vi.fn(),
			destroy: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
			update: vi.fn()
		}),
		getElement: vi.fn(),
		fetchUpdates: vi.fn().mockResolvedValue({})
	}),
	confirmCardPayment: vi.fn().mockResolvedValue({
		paymentIntent: {
			id: 'pi_test_123',
			status: 'succeeded'
		},
		error: null
	}),
	confirmPayment: vi.fn().mockResolvedValue({
		paymentIntent: {
			id: 'pi_test_123',
			status: 'succeeded'
		},
		error: null
	}),
	createToken: vi.fn().mockResolvedValue({
		token: {
			id: 'tok_test_123'
		},
		error: null
	}),
	createSource: vi.fn().mockResolvedValue({
		source: {
			id: 'src_test_123'
		},
		error: null
	}),
	retrievePaymentIntent: vi.fn().mockResolvedValue({
		paymentIntent: {
			id: 'pi_test_123',
			status: 'requires_payment_method'
		},
		error: null
	}),
	handleCardAction: vi.fn().mockResolvedValue({
		paymentIntent: {
			id: 'pi_test_123',
			status: 'requires_confirmation'
		},
		error: null
	})
});

// Mock server-side Stripe
export const createMockStripeServer = () => ({
	paymentIntents: {
		create: vi.fn().mockResolvedValue({
			id: 'pi_test_123',
			client_secret: 'pi_test_123_secret_456',
			amount: 2000,
			currency: 'usd',
			status: 'requires_payment_method'
		}),
		retrieve: vi.fn().mockResolvedValue({
			id: 'pi_test_123',
			status: 'succeeded',
			amount: 2000,
			currency: 'usd'
		}),
		update: vi.fn().mockResolvedValue({
			id: 'pi_test_123',
			status: 'requires_payment_method'
		}),
		confirm: vi.fn().mockResolvedValue({
			id: 'pi_test_123',
			status: 'succeeded'
		}),
		cancel: vi.fn().mockResolvedValue({
			id: 'pi_test_123',
			status: 'canceled'
		})
	},
	customers: {
		create: vi.fn().mockResolvedValue({
			id: 'cus_test_123',
			email: 'test@example.com'
		}),
		retrieve: vi.fn().mockResolvedValue({
			id: 'cus_test_123',
			email: 'test@example.com'
		}),
		update: vi.fn().mockResolvedValue({
			id: 'cus_test_123',
			email: 'updated@example.com'
		}),
		del: vi.fn().mockResolvedValue({
			id: 'cus_test_123',
			deleted: true
		})
	},
	subscriptions: {
		create: vi.fn().mockResolvedValue({
			id: 'sub_test_123',
			status: 'active',
			current_period_end: Math.floor(Date.now() / 1000) + 2592000 // 30 days from now
		}),
		retrieve: vi.fn().mockResolvedValue({
			id: 'sub_test_123',
			status: 'active'
		}),
		update: vi.fn().mockResolvedValue({
			id: 'sub_test_123',
			status: 'active'
		}),
		cancel: vi.fn().mockResolvedValue({
			id: 'sub_test_123',
			status: 'canceled'
		})
	},
	products: {
		create: vi.fn().mockResolvedValue({
			id: 'prod_test_123',
			name: 'Test Product'
		}),
		retrieve: vi.fn().mockResolvedValue({
			id: 'prod_test_123',
			name: 'Test Product'
		})
	},
	prices: {
		create: vi.fn().mockResolvedValue({
			id: 'price_test_123',
			unit_amount: 2000,
			currency: 'usd'
		}),
		retrieve: vi.fn().mockResolvedValue({
			id: 'price_test_123',
			unit_amount: 2000,
			currency: 'usd'
		})
	},
	webhooks: {
		constructEvent: vi.fn().mockReturnValue({
			id: 'evt_test_123',
			type: 'payment_intent.succeeded',
			data: {
				object: {
					id: 'pi_test_123',
					status: 'succeeded'
				}
			}
		})
	}
});

// Mock the Stripe modules
vi.mock('@stripe/stripe-js', () => ({
	loadStripe: vi.fn().mockResolvedValue(createMockStripe())
}));

vi.mock('stripe', () => {
	const mockStripe = createMockStripeServer();
	return {
		default: vi.fn().mockImplementation(() => mockStripe),
		Stripe: vi.fn().mockImplementation(() => mockStripe)
	};
});

vi.mock('$lib/stripe/client', () => ({
	stripe: createMockStripe()
}));

vi.mock('$lib/stripe/server', () => ({
	stripe: createMockStripeServer()
}));

export const mockStripe = createMockStripe();
export const mockStripeServer = createMockStripeServer();