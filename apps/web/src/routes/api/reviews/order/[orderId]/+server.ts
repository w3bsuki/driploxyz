import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { orderId } = params;
	const { session } = await locals.safeGetSession();
	
	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Get order to verify user has permission
		const { data: order, error: orderError } = await locals.supabase
			.from('orders')
			.select(`
				id,
				buyer_id,
				seller_id,
				status,
				delivered_at,
				buyer_rated,
				seller_rated
			`)
			.eq('id', orderId)
			.single();

		if (orderError || !order) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		// Verify user is part of this transaction
		if (order.buyer_id !== session.user.id && order.seller_id !== session.user.id) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		// Check if user can leave a review
		const canReview = order.status === 'delivered' && 
			((order.buyer_id === session.user.id && !order.buyer_rated) ||
			 (order.seller_id === session.user.id && !order.seller_rated));

		// Check if user has already reviewed
		const { data: existingReview, error: _reviewError } = await locals.supabase
			.from('reviews')
			.select(`
				*,
				reviewer:profiles!reviewer_id(
					id,
					username,
					full_name,
					avatar_url
				),
				reviewee:profiles!reviewee_id(
					id,
					username,
					full_name,
					avatar_url
				)
			`)
			.eq('order_id', orderId)
			.eq('reviewer_id', session.user.id)
			.single();

		return json({
			success: true,
			data: {
				canReview,
				hasReviewed: !!existingReview,
				review: existingReview || null,
				orderStatus: {
					status: order.status,
					deliveredAt: order.delivered_at,
					buyerRated: order.buyer_rated,
					sellerRated: order.seller_rated
				}
			}
		});

	} catch (error) {
		
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};