import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';
import { stripe } from '$lib/stripe/server.js';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession, country } }) => {
  console.log('[Checkout API] Starting checkout process');
  
  const { session } = await safeGetSession();
  
  if (!session?.user) {
    console.log('[Checkout API] No session found');
    return json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {

    console.log('[Checkout API] User authenticated:', session.user.id);

    const { productId, selectedSize, bundleItems } = await request.json();
    console.log('[Checkout API] Request data:', { productId, selectedSize, bundleItemsCount: bundleItems?.length });

    // Handle bundle checkout
    if (bundleItems && bundleItems.length > 0) {
      // Validate all items are from the same seller
      const sellerIds = [...new Set(bundleItems.map((item: any) => item.seller_id))];
      if (sellerIds.length > 1) {
        return error(400, { message: 'All items must be from the same seller' });
      }

      // Check if any items are sold or belong to buyer
      for (const item of bundleItems) {
        const { data: product } = await supabase
          .from('products')
          .select('id, is_sold, seller_id')
          .eq('id', item.id)
          .eq('country_code', country || 'BG')
          .single();
        
        if (!product || product.is_sold) {
          return error(400, { message: `Product ${item.title} is no longer available` });
        }
        if (product.seller_id === session.user.id) {
          return error(400, { message: 'You cannot buy your own products' });
        }
      }

      // Continue with bundle logic below
    } else if (!productId) {
      return error(400, { message: 'Product ID is required' });
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

    // Single product logic (backward compatible)
    if (!bundleItems) {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey (
            id,
            username
          ),
          product_images (
            id,
            image_url,
            display_order
          )
        `)
        .eq('id', productId)
        .eq('country_code', country || 'BG')
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

      // Calculate total amount for single product (NO SHIPPING - paid on delivery)
      const productPriceCents = Math.round(product.price * 100);
      const serviceFee = Math.round(productPriceCents * 0.05) + 140; // 5% + 1.40 BGN
      const totalAmount = productPriceCents + serviceFee;
      console.log('[Checkout API] Product price in cents:', productPriceCents, 'Service fee:', serviceFee, 'Total:', totalAmount);

      // Create payment intent for single product
      console.log('[Checkout API] Creating payment intent for single product');
      
      const { paymentIntent, clientSecret, error: stripeError } = await services.stripe!.createPaymentIntent({
        amount: totalAmount,
        currency: 'bgn',
        productId,
        sellerId: product.seller_id,
        buyerId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          selectedSize: selectedSize || '',
          productTitle: product.title,
          isBundle: 'false',
          itemCount: '1'
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

      // Return checkout session data for single product
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
          productPrice: productPriceCents / 100,
          serviceFee: serviceFee / 100,
          totalAmount: totalAmount / 100
        },
        isBundle: false
      });
    } else {
      // Bundle checkout logic
      console.log('[Checkout API] Processing bundle checkout for', bundleItems.length, 'items');
      
      // Calculate bundle total (NO SHIPPING - paid on delivery)
      const itemsTotal = bundleItems.reduce((sum: number, item: any) => sum + (item.price * 100), 0);
      const serviceFee = Math.round(itemsTotal * 0.05) + 140; // 5% + 1.40 BGN (in cents)
      const totalAmount = itemsTotal + serviceFee;
      
      // Create bundle session
      const { data: bundleSession } = await supabase
        .from('bundle_sessions')
        .insert({
          buyer_id: session.user.id,
          seller_id: bundleItems[0].seller_id,
          product_ids: bundleItems.map((item: any) => item.id),
          expires_at: new Date(Date.now() + 30 * 60000).toISOString()
        })
        .select()
        .single();
      
      // Create payment intent for bundle
      const { paymentIntent, clientSecret, error: stripeError } = await services.stripe!.createPaymentIntent({
        amount: totalAmount,
        currency: 'bgn',
        productId: bundleItems[0].id, // Primary item
        sellerId: bundleItems[0].seller_id,
        buyerId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          isBundle: 'true',
          itemCount: bundleItems.length.toString(),
          itemIds: bundleItems.map((item: any) => item.id).join(','),
          bundleSessionId: bundleSession?.id || ''
        }
      });
      
      if (stripeError || !paymentIntent || !clientSecret) {
        console.error('Stripe error:', stripeError);
        return error(500, { message: 'Failed to create payment intent' });
      }
      
      // Return bundle checkout data
      return json({
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret,
        bundleDetails: {
          items: bundleItems,
          sessionId: bundleSession?.id,
          itemsTotal: itemsTotal / 100,
          serviceFee: serviceFee / 100,
          totalAmount: totalAmount / 100
        },
        isBundle: true
      });
    }

  } catch (err) {
    console.error('Checkout API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};