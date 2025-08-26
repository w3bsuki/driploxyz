import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';
import { stripe } from '$lib/stripe/server.js';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    console.log('[Checkout API] Starting checkout process');
    
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      console.log('[Checkout API] No session found');
      return error(401, { message: 'Authentication required' });
    }

    console.log('[Checkout API] User authenticated:', session.user.id);

    const { productId, selectedSize } = await request.json();
    console.log('[Checkout API] Request data:', { productId, selectedSize });

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
          username
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
      console.log('[Checkout API] Stripe not configured');
      return error(500, { message: 'Payment service not configured' });
    }

    console.log('[Checkout API] Creating services...');
    // Create services with Stripe instance
    const services = createServices(supabase, stripe);

    if (!services.stripe) {
      console.log('[Checkout API] Services.stripe not available');
      return error(500, { message: 'Payment service not available' });
    }

    console.log('[Checkout API] Services created successfully');

    // Calculate total amount (convert price to cents)
    const productPriceCents = Math.round(product.price * 100);
    console.log('[Checkout API] Product price in cents:', productPriceCents);
    
    const calculation = services.stripe!.calculatePaymentAmounts(productPriceCents);
    console.log('[Checkout API] Payment calculation:', calculation);

    // Create payment intent
    console.log('[Checkout API] Creating payment intent with params:', {
      amount: calculation.totalAmount,
      currency: 'eur',
      productId,
      sellerId: product.seller_id,
      buyerId: session.user.id,
      userEmail: session.user.email
    });
    
    const { paymentIntent, clientSecret, error: stripeError } = await services.stripe!.createPaymentIntent({
      amount: calculation.totalAmount,
      currency: 'eur', // Using EUR as in your config
      productId,
      sellerId: product.seller_id,
      buyerId: session.user.id,
      userEmail: session.user.email,
      metadata: {
        selectedSize: selectedSize || '',
        productTitle: product.title
      }
    });
    
    console.log('[Checkout API] Payment intent result:', { 
      paymentIntentId: paymentIntent?.id, 
      clientSecretExists: !!clientSecret, 
      error: stripeError?.message 
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