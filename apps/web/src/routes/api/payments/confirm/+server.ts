import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Get current user session
		const { session } = await locals.safeGetSession();
		if (!session?.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { paymentIntentId, orderId } = await request.json();

		if (!paymentIntentId) {
			return json({ error: 'Payment intent ID is required' }, { status: 400 });
		}

		// If Stripe is not configured, simulate success for testing
		if (!stripe) {
			console.warn('Stripe not configured - simulating payment confirmation');
			
			// Update order status in database
			if (orderId) {
				const { error: updateError } = await locals.supabase
					.from('orders')
					.update({ 
						status: 'completed',
						completed_at: new Date().toISOString()
					})
					.eq('id', orderId);

				if (updateError) {
					console.error('Error updating order:', updateError);
				}
			}

			return json({
				success: true,
				orderId: orderId || 'mock_order_' + Math.random().toString(36).substring(7),
				warning: 'This is a mock confirmation. Configure Stripe to enable real payments.'
			});
		}

		// Retrieve the payment intent from Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== 'succeeded') {
			return json({ 
				error: `Payment not completed. Status: ${paymentIntent.status}` 
			}, { status: 400 });
		}

		// Extract metadata
		const { productId, sellerId, buyerId } = paymentIntent.metadata;

		// Create or update order in database
		const { data: existingOrder } = await locals.supabase
			.from('orders')
			.select('id')
			.eq('payment_intent_id', paymentIntentId)
			.single();

		let order;
		if (existingOrder) {
			// Update existing order
			const { data, error } = await locals.supabase
				.from('orders')
				.update({
					status: 'completed',
					completed_at: new Date().toISOString(),
					stripe_payment_intent: paymentIntentId
				})
				.eq('id', existingOrder.id)
				.select()
				.single();

			if (error) throw error;
			order = data;
		} else {
			// Create new order
			const { data, error } = await locals.supabase
				.from('orders')
				.insert({
					product_id: productId,
					buyer_id: buyerId || session.user.id,
					seller_id: sellerId,
					amount: paymentIntent.amount,
					currency: paymentIntent.currency,
					status: 'completed',
					payment_intent_id: paymentIntentId,
					stripe_payment_intent: paymentIntentId,
					completed_at: new Date().toISOString(),
					metadata: paymentIntent.metadata
				})
				.select()
				.single();

			if (error) throw error;
			order = data;
		}

		// Update product status to sold
		if (productId) {
			const { error: productError } = await locals.supabase
				.from('products')
				.update({ 
					status: 'sold',
					sold_at: new Date().toISOString()
				})
				.eq('id', productId);

			if (productError) {
				console.error('Error updating product status:', productError);
			}
		}

		// Create transaction record for accounting
		const serviceFee = Math.round(paymentIntent.amount * 0.03); // 3% service fee
		const sellerAmount = paymentIntent.amount - serviceFee;

		const { error: transactionError } = await locals.supabase
			.from('transactions')
			.insert({
				order_id: order.id,
				product_id: productId,
				buyer_id: buyerId || session.user.id,
				seller_id: sellerId,
				amount: paymentIntent.amount / 100, // Convert cents to dollars
				commission_amount: serviceFee / 100,
				seller_amount: sellerAmount / 100,
				currency: paymentIntent.currency,
				status: 'completed',
				stripe_payment_intent_id: paymentIntentId,
				metadata: paymentIntent.metadata
			});

		if (transactionError) {
			console.error('Error creating transaction:', transactionError);
			// Don't fail the request - payment is already successful
		}

		// Send notifications (could be moved to a background job)
		try {
			// Notify seller
			if (sellerId) {
				await locals.supabase
					.from('notifications')
					.insert({
						user_id: sellerId,
						type: 'sale',
						title: 'Item Sold!',
						message: `Your item has been sold for €${(paymentIntent.amount / 100).toFixed(2)}`,
						metadata: { orderId: order.id, productId }
					});
			}

			// Notify buyer
			await locals.supabase
				.from('notifications')
				.insert({
					user_id: session.user.id,
					type: 'purchase',
					title: 'Purchase Confirmed',
					message: `Your order has been confirmed. Order #${order.id}`,
					metadata: { orderId: order.id, productId }
				});
		} catch (notificationError) {
			console.error('Error sending notifications:', notificationError);
			// Don't fail the request
		}

		return json({
			success: true,
			orderId: order.id,
			message: 'Payment confirmed successfully'
		});

	} catch (error) {
		console.error('Error confirming payment:', error);
		
		if (error instanceof Error) {
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};