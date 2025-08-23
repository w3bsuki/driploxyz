import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';
import Stripe from 'stripe';

// Initialize Stripe with secret key - only on server runtime
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    })
  : null;

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, { message: 'Authentication required' });
    }

    const { productId, selectedSize } = await request.json();

    if (!productId) {
      return error(400, { message: 'Product ID is required' });
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_seller_id_fkey (
          id,
          username,
          email
        )
      `)
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return error(404, { message: 'Product not found' });
    }

    if (product.is_sold) {
      return error(400, { message: 'Product is no longer available' });
    }

    if (product.seller_id === session.user.id) {
      return error(400, { message: 'You cannot buy your own product' });
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

    // Calculate total amount (convert price to cents)
    const productPriceCents = Math.round(product.price * 100);
    const calculation = services.stripe['calculatePaymentAmounts'](productPriceCents);

    // Create payment intent
    const { paymentIntent, clientSecret, error: stripeError } = await services.stripe.createPaymentIntent({
      amount: calculation.totalAmount,
      currency: 'eur', // Using EUR as in your config
      productId,
      sellerId: product.seller_id,
      buyerId: session.user.id,
      metadata: {
        selectedSize: selectedSize || '',
        productTitle: product.title
      }
    });

    if (stripeError || !paymentIntent || !clientSecret) {
      console.error('Stripe error:', stripeError);
      return error(500, { message: 'Failed to create payment intent' });
    }

    // Return checkout session data
    return json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.product_images?.[0]?.image_url || '/placeholder-product.svg',
        seller: product.profiles?.username,
        selectedSize
      },
      amounts: {
        productPrice: calculation.productPrice / 100,
        serviceFee: calculation.serviceFee / 100,
        shippingCost: calculation.shippingCost / 100,
        totalAmount: calculation.totalAmount / 100
      }
    });

  } catch (err) {
    console.error('Checkout API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};