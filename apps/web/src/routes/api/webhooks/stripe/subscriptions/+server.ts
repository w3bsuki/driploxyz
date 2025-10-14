import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe as coreStripe } from '@repo/core/stripe/server';
import Stripe from 'stripe';
import { createServiceClient } from '$lib/server/supabase.server';
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
    const localStripe: Stripe | null = coreStripe ?? (env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' }) : null);
    if (!localStripe) {
      return json({ error: 'Stripe not available' }, { status: 500 });
    }
    event = localStripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    if (isDebug) {
      console.error('Webhook signature verification error:', err);
    }
    return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Use service client for webhook processing (no user context)
  const supabase = createServiceClient({ required: false });

  if (!supabase) {
    if (isDebug) {
      console.error('Supabase service role key not configured; webhook processing disabled');
    }
    return json({ error: 'Webhook processing unavailable' }, { status: 503 });
  }
  // const subscriptionService = new SubscriptionService(supabase);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        if (isDebug) {
          console.log('Processing subscription event:', event.type);
        }
  // TODO: implement subscription handling in core subscription service
  // Currently a no-op to acknowledge
        break;

      case 'invoice.payment_succeeded':
        if (event.data.object.billing_reason === 'subscription_cycle') {
          if (isDebug) {
            console.log('Processing subscription cycle payment');
          }
          const invoiceObject = event.data.object as Stripe.Invoice;
          const subscriptionField = (invoiceObject as unknown as { subscription?: string | import('stripe').Stripe.Subscription }).subscription;
          if (subscriptionField) {
            // Acknowledge without downstream side-effects for now
          }
        }
        break;

      case 'invoice.payment_failed': {
        if (isDebug) {
          console.log('Processing payment failed event');
        }
        if (!coreStripe && !env.STRIPE_SECRET_KEY) {
          console.error('Stripe not available for payment failed handling');
          break;
        }
        const invoiceObject = event.data.object as Stripe.Invoice;
        const subscriptionField = (invoiceObject as unknown as { subscription?: string | import('stripe').Stripe.Subscription }).subscription;
        if (subscriptionField) {
          // Acknowledge without downstream side-effects for now
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
