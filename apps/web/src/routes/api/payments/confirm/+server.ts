import { json } from '@sveltejs/kit';
import { createStripeService } from '@repo/core';
import { stripe } from '@repo/core/stripe/server';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';
import type { RequestHandler } from './$types';
import { paymentLogger } from '$lib/utils/log';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Critical rate limiting for payment confirmation
	const rateLimitResponse = await enforceRateLimit(
		request, 
		() => locals.clientIp ?? getClientAddress(), 
		'payment',
		`payment-confirm:${locals.clientIp ?? getClientAddress()}`
	);
	if (rateLimitResponse) return rateLimitResponse;
	
	try {
		// Get current user session
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { paymentIntentId } = await request.json();

		if (!paymentIntentId) {
			return json({ error: 'Payment intent ID is required' }, { status: 400 });
		}

		if (!stripe) {
			return json({ error: 'Stripe not configured' }, { status: 500 });
		}

		const stripeService = createStripeService(stripe);

		const result = await stripeService.confirmPayment(paymentIntentId);

		if (result.error || !result.paymentIntent) {
			paymentLogger.error('Error confirming payment', result.error, {
				paymentIntentId
			});
			return json({ error: result.error?.message || 'Failed to confirm payment' }, { status: 500 });
		}

		// Minimal success response - further order handling can be added server-side as needed
		return json({
			success: true,
			paymentIntentId: result.paymentIntent.id,
			status: result.paymentIntent.status
		});
	} catch (error) {
			paymentLogger.error('Error confirming payment', error);
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};