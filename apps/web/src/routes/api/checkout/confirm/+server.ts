import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '@repo/core/services';
import { stripe } from '@repo/core/stripe/server';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  const { supabase, safeGetSession } = locals;
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

    if (paymentIntent?.status !== 'succeeded') {
      return error(400, { message: `Payment not successful: ${paymentIntent?.status}` });
    }

    // Create order in database via RPC
    const metadata = paymentIntent.metadata;
    const { data: orderResult, error: orderError } = await supabase.rpc('create_order_from_payment' as any, {
      p_payment_intent_id: paymentIntent.id,
      p_amount_total: paymentIntent.amount,
      p_currency: paymentIntent.currency,
      p_buyer_id: metadata.buyerId,
      p_seller_id: metadata.sellerId,
      p_metadata: metadata,
      p_country_code: (locals as any).country || 'BG'
    });

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return error(500, { message: 'Payment successful but order creation failed. Please contact support.' });
    }

    const orderId = (orderResult as any)?.id;

    return json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      order: { id: orderId },
      message: 'Payment confirmed and order created!'
    });

  } catch {
    return error(500, { message: 'Internal server error' });
  }
};
