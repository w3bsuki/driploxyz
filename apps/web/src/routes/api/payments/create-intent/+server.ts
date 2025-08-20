import { json } from '@sveltejs/kit';
import { createStripeService } from '$lib/services/stripe.js';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';
import type { PaymentIntentCreateParams } from '$lib/stripe/types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session?.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { amount, currency = 'eur', productId, sellerId, metadata = {} } = await request.json();

		if (!amount || !productId || !sellerId) {
			return json({ error: 'Missing required parameters' }, { status: 400 });
		}

		if (!stripe) {
			return json({ error: 'Stripe not configured' }, { status: 500 });
		}

		const stripeService = createStripeService(locals.supabase, stripe);
		
		const params: PaymentIntentCreateParams = {
			amount,
			currency: currency as any,
			productId,
			sellerId,
			buyerId: session.user.id,
			metadata
		};

		const result = await stripeService.createPaymentIntent(params);

		if (result.error) {
			console.error('Error creating payment intent:', result.error);
			return json({ error: result.error.message }, { status: 500 });
		}

		return json({
			client_secret: result.clientSecret,
			id: result.paymentIntent?.id
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		return json({ error: 'Failed to create payment intent' }, { status: 500 });
	}
};