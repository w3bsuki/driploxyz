import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe as coreStripe } from '@repo/core/stripe/server';
import Stripe from 'stripe';
import { createServiceClient } from '$lib/server/supabase.server';
import { env } from '$env/dynamic/private';
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
import { dev } from '$app/environment';

const isDebug = dev;

/**
 * Stripe Subscription Webhook Handler
 * 
 * Handles subscription lifecycle events:
 * - customer.subscription.created - New subscription started
 * - customer.subscription.updated - Subscription plan/status changed
 * - customer.subscription.deleted - Subscription cancelled/expired
 * - invoice.payment_succeeded - Recurring payment successful
 * - invoice.payment_failed - Recurring payment failed
 */
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

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        if (event.data.object.billing_reason === 'subscription_cycle') {
          await handleSubscriptionPaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        }
        break;

      case 'invoice.payment_failed':
        await handleSubscriptionPaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

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

/**
 * Handle new subscription created
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createServiceClient>
) {
  if (!supabase) return;
  
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;
  
  // Get user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('[Subscription Webhook] No profile found for customer:', customerId);
    return;
  }

  // Determine plan from price
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId);

  // Access current_period_start and current_period_end safely
  const currentPeriodStart = (subscription as any).current_period_start;
  const currentPeriodEnd = (subscription as any).current_period_end;

  // Upsert subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.user_id || profile.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status: subscription.status,
      plan: plan,
      current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) {
    console.error('[Subscription Webhook] Error creating subscription:', error);
    return;
  }

  // Update profile account type
  await supabase
    .from('profiles')
    .update({ 
      account_type: plan === 'brand' ? 'brand' : 'pro',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  // Create notification
  await supabase
    .from('notifications')
    .insert({
      user_id: profile.user_id || profile.id,
      type: 'subscription_created',
      title: 'Subscription Activated! 🎉',
      message: `Your ${plan} subscription is now active. Enjoy your premium features!`,
      category: 'billing',
      priority: 'normal'
    });

  if (isDebug) {
    console.log('[Subscription Webhook] Created subscription for user:', profile.id, 'plan:', plan);
  }
}

/**
 * Handle subscription updated (plan change, renewal, etc.)
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createServiceClient>
) {
  if (!supabase) return;

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId);

  // Access current_period_start and current_period_end safely
  const currentPeriodStart = (subscription as any).current_period_start;
  const currentPeriodEnd = (subscription as any).current_period_end;

  // Update subscription record
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      plan: plan,
      stripe_price_id: priceId,
      current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('[Subscription Webhook] Error updating subscription:', error);
    return;
  }

  // Get user ID for notifications
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub) {
    // Update profile account type based on status
    const accountType = subscription.status === 'active' 
      ? (plan === 'brand' ? 'brand' : 'pro')
      : 'personal';

    await supabase
      .from('profiles')
      .update({ 
        account_type: accountType,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sub.user_id);

    // Notify about cancellation schedule
    if (subscription.cancel_at_period_end && currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd * 1000);
      await supabase
        .from('notifications')
        .insert({
          user_id: sub.user_id,
          type: 'subscription_canceling',
          title: 'Subscription Scheduled to Cancel',
          message: `Your subscription will end on ${endDate.toLocaleDateString()}. You'll retain access until then.`,
          category: 'billing',
          priority: 'normal'
        });
    }
  }

  if (isDebug) {
    console.log('[Subscription Webhook] Updated subscription:', subscription.id, 'status:', subscription.status);
  }
}

/**
 * Handle subscription deleted (cancelled or expired)
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createServiceClient>
) {
  if (!supabase) return;

  // Get subscription record
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  // Update subscription status
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('[Subscription Webhook] Error deleting subscription:', error);
    return;
  }

  if (sub) {
    // Downgrade profile to personal
    await supabase
      .from('profiles')
      .update({ 
        account_type: 'personal',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sub.user_id);

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: sub.user_id,
        type: 'subscription_ended',
        title: 'Subscription Ended',
        message: 'Your subscription has ended. Upgrade anytime to regain access to premium features.',
        category: 'billing',
        priority: 'normal',
        action_url: '/settings/billing',
        action_required: false
      });
  }

  if (isDebug) {
    console.log('[Subscription Webhook] Deleted subscription:', subscription.id);
  }
}

/**
 * Handle successful subscription payment (renewal)
 */
async function handleSubscriptionPaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createServiceClient>
) {
  if (!supabase) return;

  // Access subscription safely as it may not be in the type definition
  const invoiceSubscription = (invoice as any).subscription;
  const subscriptionId = typeof invoiceSubscription === 'string'
    ? invoiceSubscription
    : invoiceSubscription?.id;

  if (!subscriptionId) return;

  // Get subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // Create payment record
    await supabase
      .from('subscription_payments')
      .insert({
        user_id: sub.user_id,
        stripe_subscription_id: subscriptionId,
        stripe_invoice_id: invoice.id,
        amount: (invoice.amount_paid || 0) / 100, // Convert from cents
        currency: invoice.currency,
        status: 'succeeded',
        paid_at: new Date().toISOString()
      });

    // Create notification for renewal
    await supabase
      .from('notifications')
      .insert({
        user_id: sub.user_id,
        type: 'payment_succeeded',
        title: 'Payment Successful ✅',
        message: `Your ${sub.plan} subscription has been renewed. Thank you for your continued support!`,
        category: 'billing',
        priority: 'low'
      });
  }

  if (isDebug) {
    console.log('[Subscription Webhook] Payment succeeded for subscription:', subscriptionId);
  }
}

/**
 * Handle failed subscription payment
 */
async function handleSubscriptionPaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createServiceClient>
) {
  if (!supabase) return;

  // Access subscription safely as it may not be in the type definition
  const invoiceSubscription = (invoice as any).subscription;
  const subscriptionId = typeof invoiceSubscription === 'string'
    ? invoiceSubscription
    : invoiceSubscription?.id;

  if (!subscriptionId) return;

  // Get subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // Create failed payment record
    await supabase
      .from('subscription_payments')
      .insert({
        user_id: sub.user_id,
        stripe_subscription_id: subscriptionId,
        stripe_invoice_id: invoice.id,
        amount: (invoice.amount_due || 0) / 100,
        currency: invoice.currency,
        status: 'failed',
        failed_at: new Date().toISOString()
      });

    // Create urgent notification
    await supabase
      .from('notifications')
      .insert({
        user_id: sub.user_id,
        type: 'payment_failed',
        title: 'Payment Failed ⚠️',
        message: 'We couldn\'t process your subscription payment. Please update your payment method to avoid service interruption.',
        category: 'billing',
        priority: 'high',
        action_url: '/settings/billing',
        action_required: true
      });
  }

  if (isDebug) {
    console.log('[Subscription Webhook] Payment failed for subscription:', subscriptionId);
  }
}

/**
 * Map Stripe price ID to plan name
 */
function getPlanFromPriceId(priceId?: string): 'pro' | 'brand' | 'free' {
  // These should match your Stripe price IDs
  const pricePlanMap: Record<string, 'pro' | 'brand'> = {
    // Add your actual Stripe price IDs here
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
    'price_brand_monthly': 'brand',
    'price_brand_yearly': 'brand'
  };

  if (priceId && pricePlanMap[priceId]) {
    return pricePlanMap[priceId];
  }

  // Default to pro if we can't determine
  return priceId ? 'pro' : 'free';
}
