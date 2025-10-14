import { json } from '@sveltejs/kit';
import { stripe as coreStripe } from '@repo/core/stripe/server';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { TransactionService } from '@repo/core';
import { OrderService } from '@repo/core';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { paymentLogger } from '$lib/utils/log';
import { handleApiError, generateRequestId } from '$lib/utils/api-error-handler';

const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

export const POST: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

	try {
		const body = await request.text();
		const signature = request.headers.get('stripe-signature');

		if (!signature) {
			return handleApiError(new Error('No signature provided'), {
				operation: 'webhook_signature_validation',
				requestId
			});
		}

		let event: Stripe.Event;

		if (!STRIPE_WEBHOOK_SECRET) {
			paymentLogger.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification', {
				requestId
			});
			event = JSON.parse(body);
		} else {
			// Prefer initialized core instance; fallback to creating a local one from env
			const localStripe: Stripe | null = coreStripe ?? (env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' }) : null);
			if (!localStripe) throw new Error('Stripe not initialized');
			event = localStripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
		}

		paymentLogger.info('Processing webhook event', {
			eventType: event.type,
			requestId
		});

		// Handle different event types
		switch (event.type) {
			case 'payment_intent.succeeded':
				await handlePaymentSuccess(event.data.object, requestId);
				break;
			case 'payment_intent.payment_failed':
				await handlePaymentFailed(event.data.object);
				break;
			case 'payment_intent.canceled':
				await handlePaymentCanceled(event.data.object);
				break;
			default:
				paymentLogger.info('Unhandled event type', {
					eventType: event.type,
					requestId
				});
		}

		return json({
			received: true,
			eventId: event.id,
			requestId
		});
	} catch (error) {
		paymentLogger.error('Error processing webhook', error, {
			requestId,
			errorType: error instanceof Error ? error.constructor.name : 'Unknown'
		});
		return handleApiError(error, {
			operation: 'webhook_processing',
			requestId
		});
	}
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, requestId: string) {
	paymentLogger.info('Payment succeeded', {
		paymentIntentId: paymentIntent.id,
		metadata: JSON.stringify(paymentIntent.metadata),
		requestId
	});
	
	const { product_id: productId, seller_id: sellerId, buyer_id: buyerId, order_id: orderId } = paymentIntent.metadata as Record<string, string>;
	
	if (productId && sellerId && buyerId && orderId) {
		try {
			if (!SUPABASE_SERVICE_ROLE_KEY) {
				paymentLogger.error('SUPABASE_SERVICE_ROLE_KEY not available in payment success handler', new Error('Service role key missing'), {
					paymentIntentId: paymentIntent.id,
					requestId
				});
				return;
			}
			
			// Initialize Supabase client
			const supabase = createServerClient(
				PUBLIC_SUPABASE_URL!,
				SUPABASE_SERVICE_ROLE_KEY!,
				{
					cookies: {
						getAll: () => [],
						setAll: () => {}
					}
				}
			);

			// Get order details to extract amounts
			const { data: order, error: orderError1 } = await supabase
				.from('orders')
				.select('total_amount, shipping_cost')
				.eq('id', orderId)
				.single();

			if (orderError1 || !order) {
				paymentLogger.error('Failed to get order details', orderError1, {
					orderId,
					paymentIntentId: paymentIntent.id
				});
				return;
			}

			const transactionService = new TransactionService(supabase);
			const orderService = new OrderService(supabase);
			
			// Create transaction record with commission calculation
			// Record a generic payment transaction according to core types
			const { transaction, error: transactionError } = await transactionService.createPaymentTransaction(
				orderId,
				buyerId,
				order.total_amount,
				paymentIntent.id
			);

			if (transactionError) {
				paymentLogger.error('Error creating transaction', transactionError, {
					orderId,
					paymentIntentId: paymentIntent.id,
					productId,
					sellerId,
					buyerId
				});
				return;
			}

			// Update order status to paid using OrderService (handles inventory and notifications)
			const { error: orderError2 } = await orderService.updateOrderStatus({
				orderId,
				status: 'paid',
				userId: sellerId // System update, use seller as the updating user
			});

			if (orderError2) {
				paymentLogger.error('Error updating order to paid status', orderError2, {
					orderId,
					paymentIntentId: paymentIntent.id
				});
				return;
			}

			// Mark product as sold (inventory management)
			const { data: product } = await supabase
				.from('products')
				.update({ 
					is_sold: true, 
					sold_at: new Date().toISOString(),
					status: 'sold'
				})
				.eq('id', productId)
				.select('title')
				.single();

			// Create comprehensive notifications
			const notifications = [
				// Seller notification
				{
					user_id: sellerId,
					type: 'sale',
					title: 'New sale! 🎉',
					message: `Your listing "${product?.title || 'Item'}" was purchased for ${order.total_amount} BGN`,
					order_id: orderId,
					category: 'sales',
					priority: 'normal',
					data: {
						product_id: productId,
						buyer_id: buyerId,
						amount: order.total_amount
					}
				},
				// Buyer notification
				{
					user_id: buyerId,
					type: 'purchase',
					title: 'Purchase confirmed ✅',
					message: `You successfully purchased "${product?.title || 'Item'}". The seller will ship it soon.`,
					order_id: orderId,
					category: 'purchases',
					priority: 'normal',
					data: {
						product_id: productId,
						seller_id: sellerId,
						amount: order.total_amount
					}
				}
			];

			await supabase.from('notifications').insert(notifications);

			// Create order conversation for buyer-seller communication
			try {
				// Check if conversation already exists
				const { data: existingConversation } = await supabase
					.from('conversations')
					.select('id')
					.or(`(participant_one_id.eq.${buyerId},participant_two_id.eq.${sellerId}),(participant_one_id.eq.${sellerId},participant_two_id.eq.${buyerId})`)
					.eq('product_id', productId)
					.single();

				if (!existingConversation) {
					// Create new conversation
					const { error: conversationError } = await supabase
						.from('conversations')
						.insert({
							participant_one_id: buyerId,
							participant_two_id: sellerId,
							product_id: productId,
							order_id: orderId,
							last_message_at: new Date().toISOString(),
							status: 'active'
						})
						.select()
						.single();

					if (conversationError) {
						paymentLogger.error('Error creating conversation', conversationError, {
							orderId,
							productId,
							buyerId,
							sellerId
						});
					} else {
						paymentLogger.info('Conversation created successfully', {
							orderId,
							productId,
							buyerId,
							sellerId
						});
					}
				} else {
					paymentLogger.info('Conversation already exists', {
						orderId,
						productId,
						buyerId,
						sellerId,
						conversationId: existingConversation.id
					});
				}
			} catch (conversationError) {
				paymentLogger.error('Error in conversation creation process', conversationError, {
					orderId,
					productId,
					buyerId,
					sellerId
				});
				// Don't fail the payment process due to conversation creation error
			}

			paymentLogger.info('Payment processing completed successfully', {
				transactionId: transaction?.id,
				orderId,
				productId,
				productTitle: product?.title,
				notificationsSent: 'true',
				conversationCreated: 'true'
			});
			
		} catch (error) {
			paymentLogger.error('Error processing payment success', error, {
				paymentIntentId: paymentIntent.id,
				productId,
				buyerId,
				sellerId
			});
		}
	}
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
	paymentLogger.warn('Payment failed', {
		paymentIntentId: paymentIntent.id,
		metadata: JSON.stringify(paymentIntent.metadata)
	});
	
	const { product_id: productId, seller_id: sellerId, buyer_id: buyerId, order_id: orderId } = paymentIntent.metadata;
	
	if (productId && sellerId && buyerId && orderId) {
		try {
			if (!SUPABASE_SERVICE_ROLE_KEY) {
				paymentLogger.error('SUPABASE_SERVICE_ROLE_KEY not available in payment failed handler', new Error('Service role key missing'), {
					paymentIntentId: paymentIntent.id
				});
				return;
			}
			
			// Initialize Supabase client
			const supabase = createServerClient(
				PUBLIC_SUPABASE_URL!,
				SUPABASE_SERVICE_ROLE_KEY!,
				{
					cookies: {
						getAll: () => [],
						setAll: () => {}
					}
				}
			);

			// Update order status to failed (this will restore product availability)
			await supabase
				.from('orders')
				.update({ 
					status: 'failed',
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			// Update transaction status to failed
			await supabase
				.from('transactions')
				.update({
					status: 'failed',
					payment_status: 'failed',
					processed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);

			// Restore product availability
			await supabase
				.from('products')
				.update({
					is_sold: false,
					sold_at: null,
					status: 'active'
				})
				.eq('id', productId);

			// Get product details for notification
			const { data: product } = await supabase
				.from('products')
				.select('title')
				.eq('id', productId)
				.single();

			// Notify buyer of failure with actionable message
			await supabase
				.from('notifications')
				.insert({
					user_id: buyerId,
					type: 'payment_failed',
					title: 'Payment Failed',
					message: `Your payment for "${product?.title || 'Item'}" could not be processed. The item is still available for purchase.`,
					order_id: orderId,
					category: 'purchases',
					priority: 'high',
					action_required: true,
					data: {
						product_id: productId,
						order_id: orderId,
						failure_reason: paymentIntent.last_payment_error?.message || 'Payment processing failed'
					}
				});

			// Notify seller that sale fell through
			await supabase
				.from('notifications')
				.insert({
					user_id: sellerId,
					type: 'sale_failed',
					title: 'Sale Payment Failed',
					message: `Payment for your listing "${product?.title || 'Item'}" failed. The item is available again.`,
					order_id: orderId,
					category: 'sales',
					priority: 'normal',
					data: {
						product_id: productId,
						order_id: orderId,
						buyer_id: buyerId
					}
				});

			paymentLogger.info('Successfully processed payment failure', {
				paymentIntentId: paymentIntent.id,
				orderId,
				productId,
				productRestored: 'true',
				notificationsSent: 'true'
			});
		} catch (error) {
			paymentLogger.error('Error processing payment failure', error, {
				paymentIntentId: paymentIntent.id,
				productId,
				buyerId,
				sellerId
			});
		}
	}
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
	paymentLogger.info('Payment canceled', {
		paymentIntentId: paymentIntent.id,
		metadata: JSON.stringify(paymentIntent.metadata)
	});
	
	const { product_id: productId, seller_id: sellerId, buyer_id: buyerId, order_id: orderId } = paymentIntent.metadata;
	
	if (productId && sellerId && buyerId && orderId) {
		try {
			if (!SUPABASE_SERVICE_ROLE_KEY) {
				paymentLogger.error('SUPABASE_SERVICE_ROLE_KEY not available in payment canceled handler', new Error('Service role key missing'), {
					paymentIntentId: paymentIntent.id
				});
				return;
			}
			
			// Initialize Supabase client
			const supabase = createServerClient(
				PUBLIC_SUPABASE_URL!,
				SUPABASE_SERVICE_ROLE_KEY!,
				{
					cookies: {
						getAll: () => [],
						setAll: () => {}
					}
				}
			);

			// Update order status to canceled
			await supabase
				.from('orders')
				.update({ 
					status: 'cancelled',
					cancelled_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			// Update transaction status to cancelled
			await supabase
				.from('transactions')
				.update({
					status: 'cancelled',
					payment_status: 'cancelled',
					processed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);

			// Product remains available for purchase (don't mark as sold)
			// Notify buyer of cancellation
			await supabase
				.from('notifications')
				.insert({
					user_id: buyerId,
					title: 'Payment Cancelled',
					message: 'Your payment was cancelled. The item is still available for purchase.',
					type: 'payment_cancelled',
					metadata: {
						product_id: productId,
						order_id: orderId
					}
				});

			paymentLogger.info('Successfully processed payment cancellation', {
				paymentIntentId: paymentIntent.id,
				orderId,
				productId
			});
		} catch (error) {
			paymentLogger.error('Error processing payment cancellation', error, {
				paymentIntentId: paymentIntent.id,
				productId,
				buyerId,
				sellerId
			});
		}
	}
}