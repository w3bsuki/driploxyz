import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { paymentIntentId } = await request.json();

		if (!paymentIntentId) {
			return json({ error: 'Payment intent ID is required' }, { status: 400 });
		}

		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status === 'succeeded') {
			// Here you would typically:
			// 1. Update order status in database
			// 2. Send confirmation emails
			// 3. Trigger any business logic
			
			return json({
				success: true,
				paymentIntent: {
					id: paymentIntent.id,
					status: paymentIntent.status,
					amount: paymentIntent.amount,
					currency: paymentIntent.currency
				}
			});
		}

		return json({
			success: false,
			status: paymentIntent.status
		});
	} catch (error) {
		console.error('Error confirming payment:', error);
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};