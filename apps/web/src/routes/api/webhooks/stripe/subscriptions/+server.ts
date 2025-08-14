import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/stripe/server.js';
import { createClient } from '$lib/supabase/server';
import { SubscriptionService } from '$lib/services/subscriptions.js';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe signature or webhook secret');
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = createClient();
  const subscriptionService = new SubscriptionService(supabase);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log(`Processing subscription event: ${event.type}`);
        await subscriptionService.handleStripeWebhook(event);
        break;

      case 'invoice.payment_succeeded':
        if (event.data.object.billing_reason === 'subscription_cycle') {
          // Handle successful recurring payment
          console.log('Subscription payment succeeded');
          await subscriptionService.handleStripeWebhook({
            type: 'customer.subscription.updated',
            data: { object: event.data.object.subscription }
          });
        }
        break;

      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Subscription payment failed');
        const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription);
        await subscriptionService.handleStripeWebhook({
          type: 'customer.subscription.updated',
          data: { object: subscription }
        });
        break;

      default:
        console.log(`Unhandled subscription webhook event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error('Error processing subscription webhook:', error);
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
};