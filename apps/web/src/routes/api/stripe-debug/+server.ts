import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { stripe } from '$lib/stripe/server';
import { dev } from '$app/environment';

export const GET: RequestHandler = async () => {
  // Disable in production unless explicitly enabled
  if (!dev && env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return new Response('Not Found', { status: 404 });
  }
  try {
    // Check environment variables
    const hasStripeKey = !!env.STRIPE_SECRET_KEY;
    const hasWebhookSecret = !!env.STRIPE_WEBHOOK_SECRET;
    const hasSupabaseKey = !!env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check Stripe initialization
    const stripeInitialized = !!stripe;
    
    // Try to create a test object with Stripe if initialized
    let stripeWorks = false;
    let stripeError = null;
    
    if (stripe) {
      try {
        // Try to list products (lightweight operation)
        const products = await stripe.products.list({ limit: 1 });
        stripeWorks = true;
      } catch (err: any) {
        stripeError = err.message || 'Unknown Stripe error';
      }
    }
    
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasStripeKey,
        hasWebhookSecret,
        hasSupabaseKey,
        stripeKeyPrefix: env.STRIPE_SECRET_KEY ? env.STRIPE_SECRET_KEY.substring(0, 7) : null
      },
      stripe: {
        initialized: stripeInitialized,
        works: stripeWorks,
        error: stripeError
      }
    });
  } catch (error: any) {
    return json({
      status: 'error',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};
