import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';
import type { Database } from '@repo/database';
import { sendEmail, emailTemplates } from '$lib/email/resend';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!stripe) {
			return json({ error: 'Payment processing not available' }, { status: 503 });
		}

		const { paymentIntentId } = await request.json();

		if (!paymentIntentId) {
			return json({ error: 'Payment intent ID is required' }, { status: 400 });
		}

		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status === 'succeeded') {
			// Get current user session
			const { session } = await locals.safeGetSession();
			if (!session?.user) {
				return json({ error: 'Authentication required' }, { status: 401 });
			}

			// Extract metadata from payment intent
			const { productId, sellerId } = paymentIntent.metadata;
			
			if (!productId || !sellerId) {
				return json({ error: 'Invalid payment metadata' }, { status: 400 });
			}

			// Get product details to verify it's still available
			const { data: product, error: productError } = await locals.supabase
				.from('products')
				.select('*')
				.eq('id', productId)
				.single();

			if (productError || !product) {
				return json({ error: 'Product not found' }, { status: 404 });
			}

			if (product.status === 'sold') {
				return json({ error: 'Product already sold' }, { status: 400 });
			}

			// Calculate fees (matching checkout calculation)
			const shippingCost = 500; // €5.00 in cents
			const serviceFee = Math.round(product.price * 0.03); // 3% service fee
			const taxAmount = 0; // Can be calculated based on location

			// Create order record
			const { data: order, error: orderError } = await locals.supabase
				.from('orders')
				.insert({
					buyer_id: session.user.id,
					seller_id: sellerId,
					product_id: productId,
					status: 'paid',
					total_amount: paymentIntent.amount,
					shipping_cost: shippingCost,
					tax_amount: taxAmount,
					notes: `Payment Intent: ${paymentIntent.id}`
				})
				.select()
				.single();

			if (orderError) {
				console.error('Error creating order:', orderError);
				return json({ error: 'Failed to create order' }, { status: 500 });
			}

			// Update product status to sold
			const { error: updateError } = await locals.supabase
				.from('products')
				.update({ status: 'sold' })
				.eq('id', productId);

			if (updateError) {
				console.error('Error updating product status:', updateError);
			}

			// Send confirmation emails (only if RESEND_API_KEY is configured)
			if (process.env.RESEND_API_KEY) {
				// Get buyer email
				const { data: buyer } = await locals.supabase.auth.admin.getUserById(session.user.id);
				
				// Get seller details
				const { data: seller } = await locals.supabase
					.from('profiles')
					.select('username, id')
					.eq('id', sellerId)
					.single();
				
				if (buyer?.email) {
					// Send order confirmation to buyer
					await sendEmail(buyer.email, emailTemplates.orderConfirmation({
						id: order.id,
						product: { title: product.title },
						total_amount: paymentIntent.amount,
						seller: { username: seller?.username || 'Seller' }
					}));
				}
				
				// Send sold notification to seller
				const { data: sellerAuth } = await locals.supabase.auth.admin.getUserById(sellerId);
				if (sellerAuth?.email) {
					await sendEmail(sellerAuth.email, emailTemplates.productSold({
						product: { title: product.title },
						amount: paymentIntent.amount,
						commission: serviceFee,
						net_amount: paymentIntent.amount - serviceFee
					}));
				}
			}
			
			// Create in-app notification for seller
			await locals.supabase
				.from('notifications')
				.insert({
					user_id: sellerId,
					type: 'sale',
					title: 'Product Sold!',
					message: `Your item "${product.title}" has been sold!`,
					related_id: order.id,
					related_table: 'orders'
				});
			
			return json({
				success: true,
				orderId: order.id,
				paymentIntent: {
					id: paymentIntent.id,
					status: paymentIntent.status,
					amount: paymentIntent.amount,
					currency: paymentIntent.currency
				}
			});
		}

		return json({
			success: false,
			status: paymentIntent.status
		});
	} catch (error) {
		console.error('Error confirming payment:', error);
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};