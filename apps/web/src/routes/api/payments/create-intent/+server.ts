import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!stripe) {
			return json({ error: 'Payment processing not available' }, { status: 503 });
		}

		const { amount, currency = 'eur', productId, metadata = {} } = await request.json();

		if (!amount || amount < 50) {
			return json({ error: 'Amount must be at least 50 cents' }, { status: 400 });
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			automatic_payment_methods: {
				enabled: true
			},
			metadata: {
				productId,
				...metadata
			}
		});

		return json({
			client_secret: paymentIntent.client_secret,
			id: paymentIntent.id
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		return json({ error: 'Failed to create payment intent' }, { status: 500 });
	}
};