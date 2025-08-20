import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session?.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { amount, currency = 'eur', productId, metadata = {} } = await request.json();

		// Validate required parameters
		if (!amount || amount < 50) {
			return json({ error: 'Invalid amount. Minimum is 50 cents.' }, { status: 400 });
		}

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		// Check if Stripe is configured
		if (!stripe) {
			// Return a mock payment intent for development/testing
			console.warn('Stripe not configured - returning mock payment intent');
			return json({
				client_secret: 'pi_mock_' + Math.random().toString(36).substring(7) + '_secret_mock',
				id: 'pi_mock_' + Math.random().toString(36).substring(7),
				warning: 'This is a mock payment intent. Configure Stripe to enable real payments.'
			});
		}

		// Get product details from database
		const { data: product, error: productError } = await locals.supabase
			.from('products')
			.select('*, profiles!products_seller_id_fkey(id, username, stripe_account_id)')
			.eq('id', productId)
			.single();

		if (productError || !product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		if (product.status === 'sold') {
			return json({ error: 'Product is no longer available' }, { status: 400 });
		}

		// Create payment intent without Connect (simplified)
		// In production, you'd handle seller payouts separately
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: currency.toLowerCase(),
			automatic_payment_methods: { 
				enabled: true 
			},
			metadata: {
				productId,
				sellerId: product.seller_id,
				sellerName: product.profiles?.username || 'Unknown',
				buyerId: session.user.id,
				productTitle: product.title,
				productPrice: product.price.toString(),
				...metadata
			},
			description: `Purchase: ${product.title}`
		});

		// Create order record in database
		const { error: orderError } = await locals.supabase
			.from('orders')
			.insert({
				product_id: productId,
				buyer_id: session.user.id,
				seller_id: product.seller_id,
				amount: amount,
				currency: currency,
				status: 'pending',
				payment_intent_id: paymentIntent.id,
				metadata: {
					stripe_payment_intent: paymentIntent.id,
					product_title: product.title
				}
			});

		if (orderError) {
			console.error('Error creating order:', orderError);
			// Continue anyway - payment is more important
		}

		return json({
			client_secret: paymentIntent.client_secret,
			id: paymentIntent.id
		});

	} catch (error) {
		console.error('Error creating payment intent:', error);
		
		// Provide more specific error messages
		if (error instanceof Error) {
			if (error.message.includes('api_key')) {
				return json({ 
					error: 'Payment system not configured. Please contact support.',
					details: 'Stripe API key is missing'
				}, { status: 503 });
			}
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ error: 'Failed to create payment intent' }, { status: 500 });
	}
};