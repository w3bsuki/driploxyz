import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

function createSupabaseAdmin() {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return error(400, 'Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return error(400, 'Invalid signature');
  }

  console.log('Webhook received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return text('Success');
  } catch (err) {
    console.error('Webhook handler error:', err);
    return error(500, 'Webhook handler failed');
  }
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  console.log('Processing successful payment:', {
    paymentIntentId: paymentIntent.id,
    metadata
  });

  // Check if this is a product purchase (not account upgrade)
  if (!metadata.product_id) {
    console.log('No product_id in metadata, skipping product purchase handling');
    return;
  }

  const { product_id, buyer_id, seller_id } = metadata;

  const supabase = createSupabaseAdmin();

  // Update transaction status to completed
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      payment_status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (transactionError) {
    console.error('Failed to update transaction:', transactionError);
    throw new Error('Failed to update transaction status');
  }

  // Update order status from pending_payment to paid
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('product_id', product_id)
    .eq('buyer_id', buyer_id)
    .eq('status', 'pending_payment');

  if (orderError) {
    console.error('Failed to update order status:', orderError);
    throw new Error('Failed to update order status');
  }

  // Mark product as sold
  const { error: productError } = await supabase
    .from('products')
    .update({
      is_sold: true,
      is_active: false,
      sold_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', product_id);

  if (productError) {
    console.error('Failed to mark product as sold:', productError);
    throw new Error('Failed to mark product as sold');
  }

  // Create notification for buyer
  await supabase
    .from('notifications')
    .insert({
      user_id: buyer_id,
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully. The seller will ship your item soon.',
      type: 'order_update',
      metadata: {
        product_id,
        order_status: 'paid'
      }
    });

  // Create notification for seller  
  await supabase
    .from('notifications')
    .insert({
      user_id: seller_id,
      title: 'Item Sold!',
      message: 'Great news! Your item has been sold. Please prepare it for shipping.',
      type: 'order_update', 
      metadata: {
        product_id,
        order_status: 'paid'
      }
    });

  console.log('Successfully processed payment for product:', product_id);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  console.log('Processing failed payment:', {
    paymentIntentId: paymentIntent.id,
    metadata
  });

  const supabase = createSupabaseAdmin();

  // Update transaction status to failed
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({
      status: 'failed',
      payment_status: 'failed',
      processed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (transactionError) {
    console.error('Failed to update transaction:', transactionError);
  }

  // If there's a buyer, send them a notification
  if (metadata.buyer_id) {
    await supabase
      .from('notifications')
      .insert({
        user_id: metadata.buyer_id,
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again or contact support.',
        type: 'payment_failed',
        metadata: {
          product_id: metadata.product_id
        }
      });
  }

  console.log('Successfully processed failed payment for:', paymentIntent.id);
}