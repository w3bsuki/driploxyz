import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { TransactionService } from '$lib/services/transactions';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { paymentLogger } from '$lib/utils/log';

const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

export const POST: RequestHandler = async ({ request }) => {
	const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json({ error: 'No signature provided' }, { status: 400 });
	}

	let event;

	try {
		if (!STRIPE_WEBHOOK_SECRET) {
			paymentLogger.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification');
			event = JSON.parse(body);
		} else if (!stripe) {
			paymentLogger.error('Stripe not initialized', new Error('Stripe instance is null'));
			return json({ error: 'Stripe not available' }, { status: 500 });
		} else {
			event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
		}
	} catch (err) {
		paymentLogger.error('Webhook signature verification failed', err, { hasSignature: signature ? 'true' : 'false' });
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	try {
		switch (event.type) {
			case 'payment_intent.succeeded':
				await handlePaymentSuccess(event.data.object);
				break;
			case 'payment_intent.payment_failed':
				await handlePaymentFailed(event.data.object);
				break;
			case 'payment_intent.canceled':
				await handlePaymentCanceled(event.data.object);
				break;
			default:
				paymentLogger.info('Unhandled event type', { eventType: event.type });
		}

		return json({ received: true });
	} catch (error) {
		paymentLogger.error('Error processing webhook', error, { eventType: event?.type });
		return json({ error: 'Webhook processing failed' }, { status: 500 });
	}
};

async function handlePaymentSuccess(paymentIntent: any) {
	paymentLogger.info('Payment succeeded', {
		paymentIntentId: paymentIntent.id,
		metadata: paymentIntent.metadata
	});
	
	const { product_id: productId, seller_id: sellerId, buyer_id: buyerId, order_id: orderId } = paymentIntent.metadata;
	
	if (productId && sellerId && buyerId && orderId) {
		try {
			if (!SUPABASE_SERVICE_ROLE_KEY) {
				paymentLogger.error('SUPABASE_SERVICE_ROLE_KEY not available in payment success handler', new Error('Service role key missing'), {
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

			// Get order details to extract amounts
			const { data: order, error: orderError } = await supabase
				.from('orders')
				.select('total_amount, shipping_cost')
				.eq('id', orderId)
				.single();

			if (orderError || !order) {
				paymentLogger.error('Failed to get order details', orderError, {
					orderId,
					paymentIntentId: paymentIntent.id
				});
				return;
			}

			const transactionService = new TransactionService(supabase);
			
			// Create transaction record with commission calculation
			const { transaction, error } = await transactionService.createTransaction({
				orderId,
				sellerId,
				buyerId,
				productId,
				productPrice: order.total_amount - (order.shipping_cost || 0),
				shippingCost: order.shipping_cost || 0,
				stripePaymentIntentId: paymentIntent.id
			});

			if (error) {
				paymentLogger.error('Error creating transaction', error, {
					orderId,
					paymentIntentId: paymentIntent.id,
					productId,
					sellerId,
					buyerId
				});
				return;
			}

			// Update order status to paid
			await supabase
				.from('orders')
				.update({ 
					status: 'paid',
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			// Mark product as sold
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

			// Insert sale notification for seller
			await supabase
				.from('notifications')
				.insert({
					user_id: sellerId,
					type: 'sale',
					title: 'New sale! 🎉',
					message: `Your listing "${product?.title || 'Item'}" was purchased`,
					order_id: orderId,
					metadata: {
						product_id: productId,
						buyer_id: buyerId,
						amount: transaction?.seller_earnings
					}
				});

			// Insert purchase confirmation for buyer
			await supabase
				.from('notifications')
				.insert({
					user_id: buyerId,
					type: 'purchase',
					title: 'Purchase confirmed ✅',
					message: `You bought "${product?.title || 'Item'}"`,
					order_id: orderId,
					metadata: {
						product_id: productId,
						seller_id: sellerId,
						amount: order.total_amount
					}
				});

			paymentLogger.info('Payment processing completed successfully', {
				transactionId: transaction?.id,
				commissionAmount: transaction?.commission_amount,
				sellerEarnings: transaction?.seller_earnings,
				orderId,
				productId,
				notificationsSent: 'true'
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

async function handlePaymentFailed(paymentIntent: any) {
	paymentLogger.warn('Payment failed', {
		paymentIntentId: paymentIntent.id,
		metadata: paymentIntent.metadata
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

			// Update order status to failed
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

			// Notify buyer of failure
			await supabase
				.from('notifications')
				.insert({
					user_id: buyerId,
					title: 'Payment Failed',
					message: 'Your payment could not be processed. Please try again or contact support.',
					type: 'payment_failed',
					metadata: {
						product_id: productId,
						order_id: orderId
					}
				});

			paymentLogger.info('Successfully processed payment failure', {
				paymentIntentId: paymentIntent.id,
				orderId,
				productId
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

async function handlePaymentCanceled(paymentIntent: any) {
	paymentLogger.info('Payment canceled', {
		paymentIntentId: paymentIntent.id,
		metadata: paymentIntent.metadata
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