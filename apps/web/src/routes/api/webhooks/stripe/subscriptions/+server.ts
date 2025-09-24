import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/stripe/server';
import { createServiceClient } from '$lib/server/supabase.server';
import { SubscriptionService } from '$lib/services/subscriptions';
import { env } from '$env/dynamic/private';
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
import { dev } from '$app/environment';

const isDebug = dev;

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    if (isDebug) {
      console.error('Missing webhook signature or secret');
    }
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  let event: import('stripe').Stripe.Event;

  try {
    if (!stripe) {
      
      return json({ error: 'Stripe not available' }, { status: 500 });
    }
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    if (isDebug) {
      console.error('Webhook signature verification error:', err);
    }
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
        if (isDebug) {
          console.log('Processing subscription event:', event.type);
        }
        await subscriptionService.handleStripeWebhook(event, stripe);
        break;

      case 'invoice.payment_succeeded':
        if (event.data.object.billing_reason === 'subscription_cycle') {
          if (isDebug) {
            console.log('Processing subscription cycle payment');
          }
          const invoiceObject = event.data.object as any;
          if (invoiceObject.subscription) {
            await subscriptionService.handleStripeWebhook({
              type: 'customer.subscription.updated',
              data: { object: invoiceObject.subscription },
              id: 'mock_event_' + Date.now(),
              object: 'event',
              api_version: null,
              created: Date.now(),
              livemode: false,
              pending_webhooks: 0,
              request: { id: null, idempotency_key: null }
            } as any, stripe);
          }
        }
        break;

      case 'invoice.payment_failed': {
        if (isDebug) {
          console.log('Processing payment failed event');
        }
        if (!stripe) {
          console.error('Stripe not available for payment failed handling');
          break;
        }
        const invoiceObject = event.data.object as any;
        if (invoiceObject.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoiceObject.subscription);
          await subscriptionService.handleStripeWebhook({
            type: 'customer.subscription.updated',
            data: { object: subscription },
            id: 'webhook_event_' + Date.now(),
            object: 'event',
            api_version: null,
            created: Date.now(),
            livemode: false,
            pending_webhooks: 0,
            request: { id: null, idempotency_key: null }
          } as any, stripe);
        }
        break;
      }

      default:
        if (isDebug) {
          console.log('Unhandled subscription event:', event.type);
        }
    }

    return json({ received: true });
    
  } catch (error) {
    if (isDebug) {
      console.error('Webhook error:', error);
    }
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
};