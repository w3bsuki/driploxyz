import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';
import { stripe } from '$lib/stripe/server.js';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
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

    // Confirm payment intent and process order
    const { order, transaction, success, error: confirmError } = await services.stripe.confirmPaymentIntent({
      paymentIntentId,
      buyerId: session.user.id
    });

    if (!success || confirmError) {
      console.error('Payment confirmation error:', confirmError);
      return error(500, { message: confirmError?.message || 'Payment confirmation failed' });
    }

    return json({
      success: true,
      order,
      transaction,
      message: 'Payment confirmed successfully!'
    });

  } catch (err) {
    console.error('Payment confirmation API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};
