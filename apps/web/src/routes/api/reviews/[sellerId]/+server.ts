import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { z } from 'zod';

const querySchema = z.object({
	limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
	offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
	rating: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const { sellerId } = params;
	
	// Parse query parameters
	const queryParams = Object.fromEntries(url.searchParams);
	const parseResult = querySchema.safeParse(queryParams);
	
	if (!parseResult.success) {
		return json({ error: 'Invalid query parameters' }, { status: 400 });
	}
	
	const { limit, offset, rating } = parseResult.data;

	try {
		// Build query to get seller's reviews
		let query = locals.supabase
			.from('reviews')
			.select(`
				*,
				reviewer:profiles!reviewer_id(
					id,
					username,
					full_name,
					avatar_url
				),
				product:products(
					id,
					title,
					product_images(image_url)
				),
				order:orders(
					id,
					created_at,
					total_amount
				)
			`)
			.eq('reviewee_id', sellerId)
			.eq('is_public', true)
			.order('created_at', { ascending: false });

		// Apply rating filter if specified
		if (rating !== undefined) {
			query = query.eq('rating', rating);
		}

		// Apply pagination
		const { data: reviews, error: reviewsError, count } = await query
			.range(offset, offset + limit - 1)
			.limit(limit);

		if (reviewsError) {
			return json({ error: 'Failed to fetch reviews' }, { status: 500 });
		}

		// Get seller's aggregate stats
		const { data: sellerStats, error: statsError } = await locals.supabase
			.from('profiles')
			.select('rating, review_count')
			.eq('id', sellerId)
			.single();

		if (statsError) {
			return json({ error: 'Failed to fetch seller stats' }, { status: 500 });
		}

		// Get rating distribution
		const { data: ratingDistribution, error: distributionError } = await locals.supabase
			.from('reviews')
			.select('rating')
			.eq('reviewee_id', sellerId)
			.eq('is_public', true);

		if (distributionError) {
			return json({ error: 'Failed to fetch rating distribution' }, { status: 500 });
		}

		// Calculate rating distribution
		const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		ratingDistribution?.forEach(review => {
			distribution[review.rating as keyof typeof distribution]++;
		});

		return json({
			success: true,
			data: {
				reviews: reviews || [],
				pagination: {
					limit,
					offset,
					total: count || 0,
					hasMore: (count || 0) > offset + limit
				},
				stats: {
					averageRating: sellerStats?.rating || 0,
					totalReviews: sellerStats?.review_count || 0,
					distribution
				}
			}
		});

	} catch {
		
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};