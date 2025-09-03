import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type Review = Tables['reviews']['Row'];
type ReviewInsert = Tables['reviews']['Insert'];
// Note: ReviewUpdate is available but not used in current implementation

interface CreateReviewParams {
	orderId: string;
	reviewerId: string;
	rating: number;
	title?: string;
	comment?: string;
	imageUrls?: string[];
}

interface GetReviewsParams {
	sellerId: string;
	limit?: number;
	offset?: number;
	ratingFilter?: number;
}

interface ReviewStats {
	averageRating: number;
	totalReviews: number;
	distribution: Record<number, number>;
}

interface ReviewWithDetails extends Review {
	reviewer: {
		id: string;
		username: string;
		full_name: string | null;
		avatar_url: string | null;
	};
	reviewee: {
		id: string;
		username: string;
		full_name: string | null;
		avatar_url: string | null;
	};
	product: {
		id: string;
		title: string;
		product_images: Array<{ image_url: string }>;
	} | null;
	order: {
		id: string;
		created_at: string;
		total_amount: number;
	} | null;
}

export class ReviewService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Create a new review for an order
	 */
	async createReview(params: CreateReviewParams): Promise<{
		review: ReviewWithDetails | null;
		error: Error | null;
	}> {
		try {
			// Get and validate order
			const orderValidation = await this.validateReviewEligibility(params.orderId, params.reviewerId);
			if (orderValidation.error) {
				return { review: null, error: orderValidation.error };
			}

			const order = orderValidation.order!;

			// Create review
			const reviewData: ReviewInsert = {
				reviewer_id: params.reviewerId,
				reviewee_id: order.seller_id, // V1: buyers review sellers
				product_id: order.product_id,
				order_id: params.orderId,
				rating: params.rating,
				title: params.title || null,
				comment: params.comment || null,
				image_urls: params.imageUrls || null,
				is_public: true
			};

			const { data: review, error: reviewError } = await this.supabase
				.from('reviews')
				.insert(reviewData)
				.select(`
					*,
					reviewer:profiles!reviewer_id(id, username, full_name, avatar_url),
					reviewee:profiles!reviewee_id(id, username, full_name, avatar_url),
					product:products(
						id, 
						title,
						product_images(image_url)
					),
					order:orders(id, created_at, total_amount)
				`)
				.single();

			if (reviewError) {
				console.error('Failed to create review:', reviewError);
				return { review: null, error: new Error('Failed to create review') };
			}

			// Update order to mark buyer as having rated
			await this.supabase
				.from('orders')
				.update({ 
					buyer_rated: true,
					updated_at: new Date().toISOString()
				})
				.eq('id', params.orderId);

			return { review: review as ReviewWithDetails, error: null };

		} catch (error) {
			console.error('Error in createReview:', error);
			return { review: null, error: error as Error };
		}
	}

	/**
	 * Validate if a user can review a specific order
	 */
	async validateReviewEligibility(orderId: string, userId: string): Promise<{
		order: any | null;
		error: Error | null;
	}> {
		try {
			// Get order details
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.select(`
					*,
					product:products(id, title),
					seller:profiles!seller_id(id, username),
					buyer:profiles!buyer_id(id, username)
				`)
				.eq('id', orderId)
				.single();

			if (orderError || !order) {
				return { order: null, error: new Error('Order not found') };
			}

			// Only delivered orders can be reviewed
			if (order.status !== 'delivered') {
				return { order: null, error: new Error('Only delivered orders can be reviewed') };
			}

			// Check if user is buyer (only buyers can review in V1)
			if (order.buyer_id !== userId) {
				return { order: null, error: new Error('Only buyers can leave reviews') };
			}

			// Check if already reviewed
			if (order.buyer_rated) {
				return { order: null, error: new Error('You have already reviewed this order') };
			}

			// Double-check with reviews table
			const { data: existingReview } = await this.supabase
				.from('reviews')
				.select('id')
				.eq('order_id', orderId)
				.eq('reviewer_id', userId)
				.single();

			if (existingReview) {
				return { order: null, error: new Error('Review already exists') };
			}

			return { order, error: null };

		} catch (error) {
			console.error('Error validating review eligibility:', error);
			return { order: null, error: error as Error };
		}
	}

	/**
	 * Get reviews for a seller with pagination and filtering
	 */
	async getSellerReviews(params: GetReviewsParams): Promise<{
		reviews: ReviewWithDetails[];
		pagination: {
			limit: number;
			offset: number;
			total: number;
			hasMore: boolean;
		};
		stats: ReviewStats;
		error: Error | null;
	}> {
		try {
			const { sellerId, limit = 20, offset = 0, ratingFilter } = params;

			// Build base query
			let query = this.supabase
				.from('reviews')
				.select(`
					*,
					reviewer:profiles!reviewer_id(id, username, full_name, avatar_url),
					product:products(
						id, 
						title,
						product_images(image_url)
					),
					order:orders(id, created_at, total_amount)
				`, { count: 'exact' })
				.eq('reviewee_id', sellerId)
				.eq('is_public', true)
				.order('created_at', { ascending: false });

			// Apply rating filter if specified
			if (ratingFilter !== undefined) {
				query = query.eq('rating', ratingFilter);
			}

			// Execute query with pagination
			const { data: reviews, error: reviewsError, count } = await query
				.range(offset, offset + limit - 1);

			if (reviewsError) {
				console.error('Failed to fetch reviews:', reviewsError);
				return {
					reviews: [],
					pagination: { limit, offset, total: 0, hasMore: false },
					stats: { averageRating: 0, totalReviews: 0, distribution: {} },
					error: new Error('Failed to fetch reviews')
				};
			}

			// Get seller stats and rating distribution
			const statsResult = await this.getSellerStats(sellerId);

			return {
				reviews: (reviews as ReviewWithDetails[]) || [],
				pagination: {
					limit,
					offset,
					total: count || 0,
					hasMore: (count || 0) > offset + limit
				},
				stats: statsResult.stats,
				error: null
			};

		} catch (error) {
			console.error('Error fetching seller reviews:', error);
			return {
				reviews: [],
				pagination: { limit: 0, offset: 0, total: 0, hasMore: false },
				stats: { averageRating: 0, totalReviews: 0, distribution: {} },
				error: error as Error
			};
		}
	}

	/**
	 * Get seller review statistics
	 */
	async getSellerStats(sellerId: string): Promise<{
		stats: ReviewStats;
		error: Error | null;
	}> {
		try {
			// Get aggregate stats from profile
			const { data: sellerProfile, error: profileError } = await this.supabase
				.from('profiles')
				.select('rating, review_count')
				.eq('id', sellerId)
				.single();

			if (profileError) {
				console.error('Failed to fetch seller profile:', profileError);
				return {
					stats: { averageRating: 0, totalReviews: 0, distribution: {} },
					error: new Error('Failed to fetch seller stats')
				};
			}

			// Get rating distribution
			const { data: ratingData, error: distributionError } = await this.supabase
				.from('reviews')
				.select('rating')
				.eq('reviewee_id', sellerId)
				.eq('is_public', true);

			if (distributionError) {
				console.error('Failed to fetch rating distribution:', distributionError);
				return {
					stats: { averageRating: 0, totalReviews: 0, distribution: {} },
					error: new Error('Failed to fetch rating distribution')
				};
			}

			// Calculate distribution
			const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
			if (ratingData && Array.isArray(ratingData)) {
				for (const review of ratingData) {
					if (review?.rating && typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5) {
						const rating = review.rating as number;
						distribution[rating] = (distribution[rating] || 0) + 1;
					}
				}
			}

			return {
				stats: {
					averageRating: sellerProfile?.rating || 0,
					totalReviews: sellerProfile?.review_count || 0,
					distribution
				},
				error: null
			};

		} catch (error) {
			console.error('Error fetching seller stats:', error);
			return {
				stats: { averageRating: 0, totalReviews: 0, distribution: {} },
				error: error as Error
			};
		}
	}

	/**
	 * Get review status for an order
	 */
	async getOrderReviewStatus(orderId: string, userId: string): Promise<{
		canReview: boolean;
		hasReviewed: boolean;
		review: ReviewWithDetails | null;
		orderStatus: {
			status: string;
			deliveredAt: string | null;
			buyerRated: boolean;
			sellerRated: boolean;
		} | null;
		error: Error | null;
	}> {
		try {
			// Get order details
			const { data: order, error: orderError } = await this.supabase
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
				return {
					canReview: false,
					hasReviewed: false,
					review: null,
					orderStatus: null,
					error: new Error('Order not found')
				};
			}

			// Verify user is part of this transaction
			if (order.buyer_id !== userId && order.seller_id !== userId) {
				return {
					canReview: false,
					hasReviewed: false,
					review: null,
					orderStatus: null,
					error: new Error('Access denied')
				};
			}

			// Check if user can leave a review (V1: only buyers)
			const canReview = order.status === 'delivered' && 
				order.buyer_id === userId && 
				!order.buyer_rated;

			// Check for existing review
			const { data: existingReview } = await this.supabase
				.from('reviews')
				.select(`
					*,
					reviewer:profiles!reviewer_id(id, username, full_name, avatar_url),
					reviewee:profiles!reviewee_id(id, username, full_name, avatar_url)
				`)
				.eq('order_id', orderId)
				.eq('reviewer_id', userId)
				.single();

			return {
				canReview,
				hasReviewed: !!existingReview,
				review: existingReview as ReviewWithDetails || null,
				orderStatus: {
					status: order.status || 'unknown',
					deliveredAt: order.delivered_at || null,
					buyerRated: order.buyer_rated || false,
					sellerRated: order.seller_rated || false
				},
				error: null
			};

		} catch (error) {
			console.error('Error checking review status:', error);
			return {
				canReview: false,
				hasReviewed: false,
				review: null,
				orderStatus: null,
				error: error as Error
			};
		}
	}

	/**
	 * Send review notification to seller
	 */
	async sendReviewNotification(review: ReviewWithDetails): Promise<void> {
		try {
			await this.supabase
				.from('notifications')
				.insert({
					user_id: review.reviewee.id,
					type: 'new_review',
					title: `New ${review.rating}⭐ review!`,
					message: `${review.reviewer.username} left you a ${review.rating}-star review${review.product ? ` for "${review.product.title}"` : ''}`,
					order_id: review.order_id,
					data: {
						review_id: review.id,
						rating: review.rating,
						reviewer_username: review.reviewer.username,
						product_title: review.product?.title
					},
					category: 'reviews',
					priority: 'normal'
				});
		} catch (error) {
			console.error('Failed to send review notification:', error);
			// Don't throw - this shouldn't fail the review creation
		}
	}

	/**
	 * Get reviews that need to be prompted (delivered orders without reviews)
	 */
	async getReviewPromptCandidates(userId: string): Promise<{
		orders: Array<{
			id: string;
			product: { id: string; title: string; image_url?: string };
			seller: { id: string; username: string };
			delivered_at: string;
		}>;
		error: Error | null;
	}> {
		try {
			const { data: orders, error } = await this.supabase
				.from('orders')
				.select(`
					id,
					delivered_at,
					product:products!inner(
						id,
						title,
						product_images(image_url)
					),
					seller:profiles!seller_id(id, username)
				`)
				.eq('buyer_id', userId)
				.eq('status', 'delivered')
				.eq('buyer_rated', false)
				.order('delivered_at', { ascending: false })
				.limit(5);

			if (error) {
				console.error('Failed to fetch review candidates:', error);
				return { orders: [], error: new Error('Failed to fetch review candidates') };
			}

			const processedOrders = orders?.map(order => ({
				id: order.id,
				product: {
					id: order.product?.id || '',
					title: order.product?.title || '',
					image_url: order.product?.product_images?.[0]?.image_url
				},
				seller: {
					id: order.seller?.id || '',
					username: order.seller?.username || ''
				},
				delivered_at: order.delivered_at || ''
			})) || [];

			return { orders: processedOrders, error: null };

		} catch (error) {
			console.error('Error fetching review prompt candidates:', error);
			return { orders: [], error: error as Error };
		}
	}
}