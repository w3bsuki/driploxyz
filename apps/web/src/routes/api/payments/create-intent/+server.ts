import { json } from '@sveltejs/kit';
import { createStripeService } from '$lib/services/stripe';
import { stripe } from '$lib/stripe/server';
import { enforceRateLimit } from '$lib/security/rate-limiter';
import type { RequestHandler } from './$types';
import type { PaymentIntentCreateParams, Currency } from '$lib/stripe/types';
import { paymentLogger } from '$lib/utils/log';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Critical rate limiting for payment operations
	const rateLimitResponse = await enforceRateLimit(
		request,
		getClientAddress,
		'payment',
		`payment:${getClientAddress()}`
	);
	if (rateLimitResponse) return rateLimitResponse;

	let user: Awaited<ReturnType<typeof locals.safeGetSession>>['user'] | undefined = undefined;

	try {
		const { session, user: authenticatedUser } = await locals.safeGetSession();
		user = authenticatedUser;
		if (!session || !user) {
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
			currency: currency as Currency,
			productId,
			sellerId,
			buyerId: user.id,
			metadata
		};

		const result = await stripeService.createPaymentIntent(params);

		if (result.error) {
			paymentLogger.error('Error creating payment intent', result.error, {
				productId: params.productId,
				buyerId: params.buyerId,
				sellerId: params.sellerId,
				amount: params.amount
			});
			return json({ error: result.error.message }, { status: 500 });
		}

		return json({
			client_secret: result.clientSecret,
			id: result.paymentIntent?.id
		});
	} catch (error) {
		paymentLogger.error('Error creating payment intent', error, {
			userId: user?.id
		});
		return json({ error: 'Failed to create payment intent' }, { status: 500 });
	}
};