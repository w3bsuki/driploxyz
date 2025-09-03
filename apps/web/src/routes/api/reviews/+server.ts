import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { z } from 'zod';

const reviewSchema = z.object({
	order_id: z.string().uuid().optional(),
	orderId: z.string().uuid().optional(), // backward compatibility
	rating: z.number().int().min(1).max(5),
	title: z.string().max(255).optional(),
	comment: z.string().max(2000).optional(),
	image_urls: z.array(z.string().url()).max(5).optional()
}).refine(data => data.order_id || data.orderId, {
	message: "Either order_id or orderId is required"
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	
	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parseResult = reviewSchema.safeParse(body);
		
		if (!parseResult.success) {
			return json({ 
				error: 'Validation failed', 
				details: parseResult.error.issues 
			}, { status: 400 });
		}

		const { rating, title, comment, image_urls } = parseResult.data;
		const order_id = parseResult.data.order_id || parseResult.data.orderId;
		
		if (!order_id) {
			return json({ error: 'Order ID is required' }, { status: 400 });
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

		// For V1, only buyers can review sellers
		if (!isBuyerReview) {
			return json({ error: 'Only buyers can leave reviews in V1' }, { status: 400 });
		}

		// Check if buyer has already reviewed this order
		if (order.buyer_rated) {
			return json({ error: 'You have already reviewed this order' }, { status: 400 });
		}

		// Check if review already exists (double-check with DB constraint)
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
			reviewee_id: order.seller_id, // V1: buyers review sellers only
			product_id: order.product_id,
			order_id: order_id,
			rating,
			title: title || null,
			comment: comment || null,
			image_urls: image_urls || null
		};

		const { data: review, error: reviewError } = await locals.supabase
			.from('reviews')
			.insert(reviewData)
			.select(`
				*,
				reviewer:profiles!reviewer_id(id, username, full_name, avatar_url),
				reviewee:profiles!reviewee_id(id, username, full_name, avatar_url)
			`)
			.single();

		if (reviewError) {
			console.error('Failed to create review:', reviewError);
			return json({ error: 'Failed to create review' }, { status: 500 });
		}

		// Update order to mark buyer as having rated
		const { error: orderUpdateError } = await locals.supabase
			.from('orders')
			.update({ 
				buyer_rated: true,
				updated_at: new Date().toISOString()
			})
			.eq('id', order_id);

		if (orderUpdateError) {
			console.error('Failed to update order buyer_rated flag:', orderUpdateError);
			// Don't fail the request since review was created successfully
		}

		// Note: Profile rating update is handled by database triggers automatically

		// Send notification to seller
		await locals.supabase
			.from('notifications')
			.insert({
				user_id: order.seller_id,
				type: 'new_review',
				title: `New ${rating}⭐ review!`,
				message: `${order.buyer.username} left you a ${rating}-star review for "${order.product.title}"`,
				order_id: order_id,
				data: { 
					review_id: review.id, 
					rating,
					reviewer_username: order.buyer.username
				},
				category: 'reviews',
				priority: 'normal'
			});

		return json({
			success: true,
			data: {
				review,
				message: 'Review submitted successfully'
			}
		});

	} catch (error) {
		console.error('Error creating review:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};