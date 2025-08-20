import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types.js';
import { createServerClient } from '@supabase/ssr';
import { TransactionService } from '$lib/services/transactions.js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
  const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json({ error: 'No signature provided' }, { status: 400 });
	}

	let event;

	try {
		if (!STRIPE_WEBHOOK_SECRET) {
			console.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification');
			event = JSON.parse(body);
		} else {
			event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
		}
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
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
				console.log(`Unhandled event type: ${event.type}`);
		}

		return json({ received: true });
	} catch (error) {
		console.error('Error processing webhook:', error);
		return json({ error: 'Webhook processing failed' }, { status: 500 });
	}
};

async function handlePaymentSuccess(paymentIntent: any) {
	console.log('Payment succeeded:', paymentIntent.id);
	
	const { productId, sellerId, buyerId, orderId, productPrice, shippingCost } = paymentIntent.metadata;
	
	if (productId && sellerId && buyerId && orderId) {
		try {
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

			const transactionService = new TransactionService(supabase);
			
			// Create transaction record with commission calculation
			const { transaction, error } = await transactionService.createTransaction({
				orderId,
				sellerId,
				buyerId,
				productId,
				productPrice: parseFloat(productPrice),
				shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
				stripePaymentIntentId: paymentIntent.id
			});

			if (error) {
				console.error('Error creating transaction:', error);
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
			await supabase
				.from('products')
				.update({ 
					is_sold: true, 
					sold_at: new Date().toISOString(),
					status: 'sold'
				})
				.eq('id', productId);

			console.log(`Transaction created successfully: ${transaction?.id}`);
			console.log(`Commission: ${transaction?.commission_amount} BGN, Seller gets: ${transaction?.seller_amount} BGN`);
			
		} catch (error) {
			console.error('Error processing payment success:', error);
		}
	}
}

async function handlePaymentFailed(paymentIntent: any) {
	console.log('Payment failed:', paymentIntent.id);
	
	// TODO: Handle payment failure:
	// 1. Update order status to failed
	// 2. Notify buyer of failure
	// 3. Free up product inventory
}

async function handlePaymentCanceled(paymentIntent: any) {
	console.log('Payment canceled:', paymentIntent.id);
	
	// TODO: Handle payment cancellation:
	// 1. Update order status to canceled
	// 2. Free up product inventory
}