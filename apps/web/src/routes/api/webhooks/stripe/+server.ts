import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json({ error: 'No signature provided' }, { status: 400 });
	}

	let event;

	try {
		const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret) {
			console.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification');
			event = JSON.parse(body);
		} else {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
	
	// TODO: Implement order processing logic:
	// 1. Update order status in Supabase
	// 2. Notify seller
	// 3. Send confirmation email to buyer
	// 4. Update product availability if needed
	
	const { productId, sellerId } = paymentIntent.metadata;
	
	if (productId && sellerId) {
		// Example: Create order record in database
		// await supabase.from('orders').insert({
		//   id: generateOrderId(),
		//   product_id: productId,
		//   seller_id: sellerId,
		//   buyer_id: buyerId, // Get from user session
		//   amount: paymentIntent.amount,
		//   status: 'paid',
		//   payment_intent_id: paymentIntent.id,
		//   created_at: new Date().toISOString()
		// });
		
		console.log(`Order created for product ${productId} by seller ${sellerId}`);
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