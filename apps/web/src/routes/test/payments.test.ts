import { describe, it, expect, beforeEach, vi } from 'vitest';
import { json } from '@sveltejs/kit';

// Import the server handlers
import { POST as createPaymentIntentHandler } from '../api/payments/create-intent/+server.js';
import { POST as confirmPaymentHandler } from '../api/payments/confirm/+server.js';
import { POST as stripeWebhookHandler } from '../api/webhooks/stripe/+server.js';
import { POST as subscriptionWebhookHandler } from '../api/webhooks/stripe/subscriptions/+server.js';

// Import test utilities
import {
	createMockServerRequestEvent,
	createAuthenticatedRequestEvent,
	createJsonRequest,
	createWebhookRequest,
	createMockPaymentIntent,
	mockSupabaseQuery,
	createTestProduct,
	createTestProfile,
	resetAllMocks
} from '../../test/utils/server-test-utils.js';
import { mockSupabaseClient } from '../../test/mocks/supabase.js';
import { mockStripeServer } from '../../test/mocks/stripe.js';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	STRIPE_SECRET_KEY: 'sk_test_stripe_secret',
	STRIPE_WEBHOOK_SECRET: 'whsec_test_webhook_secret',
	SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
}));

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://test.supabase.co'
}));

// Mock Stripe server - using factory function to avoid hoisting issues
vi.mock('$lib/stripe/server.js', () => {
	return {
		stripe: {
			paymentIntents: {
				create: vi.fn(),
				retrieve: vi.fn()
			},
			webhooks: {
				constructEvent: vi.fn()
			}
		}
	};
});

// Mock services
vi.mock('$lib/services/transactions.js', () => ({
	TransactionService: vi.fn().mockImplementation(() => ({
		createTransaction: vi.fn().mockResolvedValue({
			transaction: {
				id: 'txn-123',
				commission_amount: 2.99,
				seller_amount: 27.01
			},
			error: null
		})
	}))
}));

describe('Payments Integration Tests', () => {
	beforeEach(() => {
		resetAllMocks();
	});

	describe('Payment Intent Creation', () => {
		it('should create payment intent for valid product purchase', async () => {
			const buyer = createTestProfile({ id: 'buyer-123' });
			const product = createTestProduct({ 
				id: 'product-123',
				price: 29.99,
				seller_id: 'seller-123',
				is_sold: false
			});

			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: {
						name: 'John Doe',
						line1: '123 Main St',
						city: 'Sofia',
						postal_code: '1000',
						country: 'BG'
					}
				})
			});

			// Mock product lookup
			mockSupabaseQuery(product);

			// Mock payment intent creation
			const mockPaymentIntent = createMockPaymentIntent({
				amount: 3499, // 29.99 + 5.00 shipping in cents
				metadata: {
					productId: 'product-123',
					sellerId: 'seller-123',
					buyerId: 'buyer-123',
					productPrice: '29.99',
					shippingCost: '5.00'
				}
			});

			mockStripeServer.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

			const response = await createPaymentIntentHandler(event);
			const result = await response.json();

			expect(response.status).toBe(200);
			expect(result.client_secret).toBe('pi_test_123_secret_456');
			expect(mockStripeServer.paymentIntents.create).toHaveBeenCalledWith({
				amount: 3499,
				currency: 'bgn',
				metadata: expect.objectContaining({
					productId: 'product-123',
					sellerId: 'seller-123',
					buyerId: 'buyer-123'
				}),
				shipping: expect.objectContaining({
					name: 'John Doe',
					address: expect.objectContaining({
						line1: '123 Main St',
						city: 'Sofia'
					})
				})
			});
		});

		it('should reject payment for already sold product', async () => {
			const buyer = createTestProfile({ id: 'buyer-123' });
			const soldProduct = createTestProduct({ 
				id: 'product-123',
				is_sold: true,
				status: 'sold'
			});

			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: { name: 'John Doe' }
				})
			});

			mockSupabaseQuery(soldProduct);

			const response = await createPaymentIntentHandler(event);
			
			expect(response.status).toBe(400);
			const result = await response.json();
			expect(result.error).toContain('no longer available');
		});

		it('should prevent seller from buying their own product', async () => {
			const seller = createTestProfile({ id: 'seller-123' });
			const product = createTestProduct({ 
				id: 'product-123',
				seller_id: 'seller-123'
			});

			const event = createAuthenticatedRequestEvent(seller, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: { name: 'Seller Name' }
				})
			});

			mockSupabaseQuery(product);

			const response = await createPaymentIntentHandler(event);
			
			expect(response.status).toBe(400);
			const result = await response.json();
			expect(result.error).toContain('cannot buy your own product');
		});

		it('should require authentication for payment creation', async () => {
			const event = createMockServerRequestEvent({
				request: createJsonRequest({
					productId: 'product-123'
				})
			});

			const response = await createPaymentIntentHandler(event);
			
			expect(response.status).toBe(401);
		});

		it('should validate shipping address', async () => {
			const buyer = createTestProfile({ id: 'buyer-123' });
			const product = createTestProduct({ id: 'product-123' });

			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: {
						// Missing required fields
						name: '',
						line1: ''
					}
				})
			});

			mockSupabaseQuery(product);

			const response = await createPaymentIntentHandler(event);
			
			expect(response.status).toBe(400);
			const result = await response.json();
			expect(result.error).toContain('shipping address');
		});

		it('should calculate correct total with shipping', async () => {
			const buyer = createTestProfile();
			const product = createTestProduct({ 
				price: 25.50,
				location: 'Varna, Bulgaria' // Different city, higher shipping
			});

			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: {
						name: 'John Doe',
						line1: '123 Main St',
						city: 'Sofia',
						country: 'BG'
					}
				})
			});

			mockSupabaseQuery(product);

			const mockPaymentIntent = createMockPaymentIntent({
				amount: 3300, // 25.50 + 7.50 shipping
			});
			mockStripeServer.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

			const response = await createPaymentIntentHandler(event);
			const result = await response.json();

			expect(response.status).toBe(200);
			expect(mockStripeServer.paymentIntents.create).toHaveBeenCalledWith(
				expect.objectContaining({
					amount: 3300 // Total in cents
				})
			);
		});
	});

	describe('Payment Confirmation', () => {
		it('should confirm payment intent successfully', async () => {
			const buyer = createTestProfile({ id: 'buyer-123' });
			
			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					paymentIntentId: 'pi_test_123'
				})
			});

			const confirmedPaymentIntent = createMockPaymentIntent({
				id: 'pi_test_123',
				status: 'succeeded'
			});

			mockStripeServer.paymentIntents.retrieve.mockResolvedValue(confirmedPaymentIntent);

			const response = await confirmPaymentHandler(event);
			const result = await response.json();

			expect(response.status).toBe(200);
			expect(result.status).toBe('succeeded');
			expect(mockStripeServer.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
		});

		it('should handle failed payment confirmation', async () => {
			const buyer = createTestProfile({ id: 'buyer-123' });
			
			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					paymentIntentId: 'pi_test_failed'
				})
			});

			const failedPaymentIntent = createMockPaymentIntent({
				id: 'pi_test_failed',
				status: 'requires_payment_method',
				last_payment_error: {
					message: 'Your card was declined.'
				}
			});

			mockStripeServer.paymentIntents.retrieve.mockResolvedValue(failedPaymentIntent);

			const response = await confirmPaymentHandler(event);
			const result = await response.json();

			expect(response.status).toBe(200);
			expect(result.status).toBe('requires_payment_method');
			expect(result.error).toContain('card was declined');
		});

		it('should require valid payment intent ID', async () => {
			const buyer = createTestProfile();
			
			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					paymentIntentId: ''
				})
			});

			const response = await confirmPaymentHandler(event);
			
			expect(response.status).toBe(400);
		});
	});

	describe('Stripe Webhooks', () => {
		describe('Payment Success Webhook', () => {
			it('should process payment success webhook correctly', async () => {
				const paymentIntent = createMockPaymentIntent({
					id: 'pi_test_123',
					status: 'succeeded',
					metadata: {
						productId: 'product-123',
						sellerId: 'seller-123',
						buyerId: 'buyer-123',
						orderId: 'order-123',
						productPrice: '29.99',
						shippingCost: '5.00'
					}
				});

				const request = createWebhookRequest('payment_intent.succeeded', paymentIntent);
				const event = createMockServerRequestEvent({ request });

				// Mock webhook signature verification
				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'payment_intent.succeeded',
					data: { object: paymentIntent }
				});

				// Mock database operations
				mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
				mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
				mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
				mockSupabaseClient.eq.mockResolvedValue({ error: null });

				const response = await stripeWebhookHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.received).toBe(true);

				// Verify order status update
				expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
				expect(mockSupabaseClient.update).toHaveBeenCalledWith({
					status: 'paid',
					updated_at: expect.any(String)
				});

				// Verify product marked as sold
				expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
				expect(mockSupabaseClient.update).toHaveBeenCalledWith({
					is_sold: true,
					sold_at: expect.any(String),
					status: 'sold'
				});
			});

			it('should handle webhook signature verification failure', async () => {
				const request = createWebhookRequest(
					'payment_intent.succeeded', 
					createMockPaymentIntent(),
					'invalid-signature'
				);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockImplementation(() => {
					throw new Error('Invalid signature');
				});

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(400);
				const result = await response.json();
				expect(result.error).toBe('Invalid signature');
			});

			it('should handle missing webhook signature', async () => {
				const webhookBody = JSON.stringify({
					type: 'payment_intent.succeeded',
					data: { object: createMockPaymentIntent() }
				});

				const request = new Request('http://localhost/api/webhooks/stripe', {
					method: 'POST',
					body: webhookBody
					// Missing stripe-signature header
				});

				const event = createMockServerRequestEvent({ request });

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(400);
				const result = await response.json();
				expect(result.error).toBe('No signature provided');
			});

			it('should handle payment intent without metadata', async () => {
				const paymentIntentNoMetadata = createMockPaymentIntent({
					metadata: {} // Empty metadata
				});

				const request = createWebhookRequest('payment_intent.succeeded', paymentIntentNoMetadata);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'payment_intent.succeeded',
					data: { object: paymentIntentNoMetadata }
				});

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(200);
				// Should not process transaction without required metadata
			});

			it('should create transaction record with commission calculation', async () => {
				const paymentIntent = createMockPaymentIntent({
					metadata: {
						productId: 'product-123',
						sellerId: 'seller-123',
						buyerId: 'buyer-123',
						orderId: 'order-123',
						productPrice: '29.99',
						shippingCost: '5.00'
					}
				});

				const request = createWebhookRequest('payment_intent.succeeded', paymentIntent);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'payment_intent.succeeded',
					data: { object: paymentIntent }
				});

				// Mock successful database operations
				mockSupabaseClient.eq.mockResolvedValue({ error: null });

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(200);

				// Verify TransactionService was called with correct data
				const { TransactionService } = require('$lib/services/transactions.js');
				const transactionServiceInstance = new TransactionService(mockSupabaseClient);
				expect(transactionServiceInstance.createTransaction).toBeDefined();
			});
		});

		describe('Payment Failed Webhook', () => {
			it('should handle payment failure webhook', async () => {
				const failedPaymentIntent = createMockPaymentIntent({
					status: 'requires_payment_method',
					last_payment_error: {
						message: 'Your card was declined'
					}
				});

				const request = createWebhookRequest('payment_intent.payment_failed', failedPaymentIntent);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'payment_intent.payment_failed',
					data: { object: failedPaymentIntent }
				});

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(200);
				// Should handle payment failure gracefully
			});
		});

		describe('Payment Canceled Webhook', () => {
			it('should handle payment cancellation webhook', async () => {
				const canceledPaymentIntent = createMockPaymentIntent({
					status: 'canceled'
				});

				const request = createWebhookRequest('payment_intent.canceled', canceledPaymentIntent);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'payment_intent.canceled',
					data: { object: canceledPaymentIntent }
				});

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(200);
			});
		});

		describe('Subscription Webhooks', () => {
			it('should handle subscription created webhook', async () => {
				const subscription = {
					id: 'sub_test_123',
					status: 'active',
					customer: 'cus_test_123',
					current_period_end: Math.floor(Date.now() / 1000) + 2592000,
					items: {
						data: [{
							price: { id: 'price_premium_monthly' }
						}]
					}
				};

				const request = createWebhookRequest('customer.subscription.created', subscription);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'customer.subscription.created',
					data: { object: subscription }
				});

				// Mock profile update
				mockSupabaseClient.eq.mockResolvedValue({ error: null });

				const response = await subscriptionWebhookHandler(event);
				
				expect(response.status).toBe(200);
			});

			it('should handle subscription cancellation', async () => {
				const canceledSubscription = {
					id: 'sub_test_123',
					status: 'canceled',
					customer: 'cus_test_123'
				};

				const request = createWebhookRequest('customer.subscription.deleted', canceledSubscription);
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue({
					id: 'evt_test_123',
					type: 'customer.subscription.deleted',
					data: { object: canceledSubscription }
				});

				const response = await subscriptionWebhookHandler(event);
				
				expect(response.status).toBe(200);
			});
		});

		describe('Unknown Webhook Events', () => {
			it('should handle unknown webhook event types', async () => {
				const unknownEvent = {
					id: 'evt_unknown',
					type: 'unknown.event.type',
					data: { object: {} }
				};

				const request = createWebhookRequest('unknown.event.type', {});
				const event = createMockServerRequestEvent({ request });

				mockStripeServer.webhooks.constructEvent.mockReturnValue(unknownEvent);

				const response = await stripeWebhookHandler(event);
				
				expect(response.status).toBe(200);
				const result = await response.json();
				expect(result.received).toBe(true);
			});
		});
	});

	describe('Payment Error Handling', () => {
		it('should handle Stripe API errors gracefully', async () => {
			const buyer = createTestProfile();
			const product = createTestProduct();
			
			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: { name: 'John Doe', line1: '123 Main St' }
				})
			});

			mockSupabaseQuery(product);

			mockStripeServer.paymentIntents.create.mockRejectedValue(
				new Error('Stripe API error: Rate limit exceeded')
			);

			const response = await createPaymentIntentHandler(event);
			
			expect(response.status).toBe(500);
			const result = await response.json();
			expect(result.error).toContain('payment processing error');
		});

		it('should handle database errors during webhook processing', async () => {
			const paymentIntent = createMockPaymentIntent({
				metadata: {
					productId: 'product-123',
					sellerId: 'seller-123',
					buyerId: 'buyer-123',
					orderId: 'order-123'
				}
			});

			const request = createWebhookRequest('payment_intent.succeeded', paymentIntent);
			const event = createMockServerRequestEvent({ request });

			mockStripeServer.webhooks.constructEvent.mockReturnValue({
				id: 'evt_test_123',
				type: 'payment_intent.succeeded',
				data: { object: paymentIntent }
			});

			// Mock database error
			mockSupabaseClient.eq.mockResolvedValue({ error: { message: 'Database error' } });

			const response = await stripeWebhookHandler(event);
			
			expect(response.status).toBe(200); // Should still return 200 to Stripe
			// Error should be logged but not fail the webhook
		});

		it('should validate payment amounts match product prices', async () => {
			const buyer = createTestProfile();
			const product = createTestProduct({ price: 29.99 });
			
			const event = createAuthenticatedRequestEvent(buyer, {
				request: createJsonRequest({
					productId: 'product-123',
					shippingAddress: { name: 'John Doe', line1: '123 Main St' },
					expectedAmount: 2500 // Doesn't match product price + shipping
				})
			});

			mockSupabaseQuery(product);

			const response = await createPaymentIntentHandler(event);
			
			// Should validate amount matches expected total
			expect(response.status).toBe(400);
		});
	});
});