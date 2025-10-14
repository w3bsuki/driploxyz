import { json } from '@sveltejs/kit';
import { createStripeService } from '@repo/core';
import { stripe } from '@repo/core/stripe/server';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';
import type { RequestHandler } from './$types';
import { paymentLogger } from '$lib/utils/log';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Critical rate limiting for payment operations
	const rateLimitResponse = await enforceRateLimit(
		request,
		() => locals.clientIp ?? getClientAddress(),
		'payment',
		`payment:${locals.clientIp ?? getClientAddress()}`
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

		if (!user.email) {
			return json({ error: 'User email required for payment' }, { status: 400 });
		}

		const stripeService = createStripeService(stripe);

		const result = await stripeService.createPaymentIntent({
			amount,
			currency,
			productId,
			sellerId,
			buyerId: user.id,
			userEmail: user.email,
			metadata
		});

		if (result.error) {
			paymentLogger.error('Error creating payment intent', result.error, {
				productId,
				buyerId: user.id,
				sellerId,
				amount
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