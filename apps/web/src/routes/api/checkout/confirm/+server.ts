import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '@repo/core/services';
import { stripe } from '@repo/core/stripe/server';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession }, getClientAddress }) => {
  // Critical rate limiting for checkout confirmation
  const rateLimitResponse = await enforceRateLimit(
    request, 
    getClientAddress, 
    'checkout',
    `checkout-confirm:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  try {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
      return error(401, { message: 'Authentication required' });
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return error(400, { message: 'Payment intent ID is required' });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return error(500, { message: 'Payment service not configured' });
    }

  // Create services with Stripe instance
  const services = createServices(supabase, stripe);

    if (!services.stripe) {
      return error(500, { message: 'Payment service not available' });
    }

    // Confirm payment intent using StripeService API
    const { paymentIntent, error: confirmError } = await services.stripe.confirmPayment(paymentIntentId);

    if (confirmError) {
      return error(500, { message: confirmError?.message || 'Payment confirmation failed' });
    }

    return json({
      success: true,
      paymentIntentId: paymentIntent?.id ?? paymentIntentId,
      status: paymentIntent?.status ?? 'unknown',
      message: 'Payment confirmed successfully!'
    });

  } catch {
    return error(500, { message: 'Internal server error' });
  }
};
