import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	
	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { order_id, rating, title, comment } = await request.json();

	if (!order_id || !rating) {
		return json({ error: 'Order ID and rating are required' }, { status: 400 });
	}

	if (rating < 1 || rating > 5) {
		return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
	}

	// Get order details to determine reviewer and reviewee
	const { data: order, error: orderError } = await locals.supabase
		.from('orders')
		.select(`
			*,
			product:products(id, title),
			seller:profiles!seller_id(id, username),
			buyer:profiles!buyer_id(id, username)
		`)
		.eq('id', order_id)
		.single();

	if (orderError || !order) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	// Only delivered orders can be reviewed
	if (order.status !== 'delivered') {
		return json({ error: 'Only delivered orders can be reviewed' }, { status: 400 });
	}

	// Determine if this is a buyer reviewing seller or vice versa
	const isBuyerReview = order.buyer_id === session.user.id;
	const isSellerReview = order.seller_id === session.user.id;

	if (!isBuyerReview && !isSellerReview) {
		return json({ error: 'You are not part of this transaction' }, { status: 403 });
	}

	// Check if review already exists
	const { data: existingReview } = await locals.supabase
		.from('reviews')
		.select('id')
		.eq('order_id', order_id)
		.eq('reviewer_id', session.user.id)
		.single();

	if (existingReview) {
		return json({ error: 'You have already reviewed this order' }, { status: 400 });
	}

	// Create review
	const reviewData = {
		reviewer_id: session.user.id,
		reviewee_id: isBuyerReview ? order.seller_id : order.buyer_id,
		product_id: order.product_id,
		order_id: order_id,
		rating,
		title: title || null,
		comment: comment || null
	};

	const { data: review, error: reviewError } = await locals.supabase
		.from('reviews')
		.insert(reviewData)
		.select()
		.single();

	if (reviewError) {
		return json({ error: 'Failed to create review' }, { status: 500 });
	}

	// Update profile rating for the reviewee
	const { data: reviews } = await locals.supabase
		.from('reviews')
		.select('rating')
		.eq('reviewee_id', reviewData.reviewee_id);

	if (reviews && reviews.length > 0) {
		const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
		
		await locals.supabase
			.from('profiles')
			.update({
				rating: avgRating,
				review_count: reviews.length
			})
			.eq('id', reviewData.reviewee_id);
	}

	// Send notification to reviewee
	await locals.supabase
		.from('notifications')
		.insert({
			user_id: reviewData.reviewee_id,
			type: 'order_update',
			title: `New ${rating}⭐ review!`,
			message: `${isBuyerReview ? order.buyer.username : order.seller.username} left you a review`,
			order_id: order_id,
			data: { review_id: review.id, rating }
		});

	return json({
		success: true,
		review
	});
};