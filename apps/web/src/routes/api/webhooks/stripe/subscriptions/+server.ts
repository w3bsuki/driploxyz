import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/stripe/server.js';
import { createServiceClient } from '$lib/server/supabase.server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { env } from '$env/dynamic/private';
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
import { dev } from '$app/environment';

const isDebug = dev;

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    if (isDebug) console.error('[Webhook] Missing Stripe signature or webhook secret');
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    if (isDebug) console.error('[Webhook] Signature verification failed:', err.message);
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Use service client for webhook processing (no user context)
  const supabase = createServiceClient();
  const subscriptionService = new SubscriptionService(supabase);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        if (isDebug) console.log(`[Webhook] Processing: ${event.type}`);
        await subscriptionService.handleStripeWebhook(event, stripe);
        break;

      case 'invoice.payment_succeeded':
        if (event.data.object.billing_reason === 'subscription_cycle') {
          if (isDebug) console.log('[Webhook] Recurring payment succeeded');
          await subscriptionService.handleStripeWebhook({
            type: 'customer.subscription.updated',
            data: { object: event.data.object.subscription }
          }, stripe);
        }
        break;

      case 'invoice.payment_failed':
        if (isDebug) console.log('[Webhook] Payment failed');
        const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription);
        await subscriptionService.handleStripeWebhook({
          type: 'customer.subscription.updated',
          data: { object: subscription }
        }, stripe);
        break;

      default:
        if (isDebug) console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
    
  } catch (error) {
    if (isDebug) console.error('[Webhook] Processing error:', error);
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
};