import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

// Order with joined user data for notifications
interface OrderWithUsers extends OrderRow {
  buyer?: { username?: string | null };
  seller?: { username?: string | null };
}

export interface CreateReviewData {
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewResult {
  success: boolean;
  review?: ReviewRow;
  error?: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  order?: OrderWithUsers;
  error?: string;
  canReview?: boolean;
  reviewerRole?: 'buyer' | 'seller';
}

/**
 * Reviews service - handles review creation, validation, and management
 * Enforces business rules: one review per order, only for delivered orders
 */
export class ReviewsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Validate if a user can review a specific order
   */
  async validateOrderForReview(
    orderId: string, 
    userId: string
  ): Promise<OrderValidationResult> {
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
        return {
          isValid: false,
          error: 'Order not found'
        };
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        return {
          isValid: false,
          order,
          error: 'Only delivered orders can be reviewed'
        };
      }

      // Determine if user is buyer or seller
      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;

      if (!isBuyer && !isSeller) {
        return {
          isValid: false,
          order,
          error: 'You are not part of this transaction'
        };
      }

      // Check if review already exists
      const { data: existingReview } = await this.supabase
        .from('reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('reviewer_id', userId)
        .single();

      if (existingReview) {
        return {
          isValid: false,
          order,
          error: 'You have already reviewed this order'
        };
      }

      return {
        isValid: true,
        order,
        canReview: true,
        reviewerRole: isBuyer ? 'buyer' : 'seller'
      };
    } catch {
      return {
        isValid: false,
        error: 'Failed to validate order'
      };
    }
  }

  /**
   * Create a new review for an order
   */
  async createReview(
    reviewData: CreateReviewData, 
    userId: string
  ): Promise<ReviewResult> {
    // Validate the order first
    const validation = await this.validateOrderForReview(reviewData.orderId, userId);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const { order, reviewerRole } = validation;
    
    if (!order || !reviewerRole) {
      return {
        success: false,
        error: 'Invalid order data'
      };
    }

    // Determine reviewee
    const revieweeId = reviewerRole === 'buyer' ? order.seller_id : order.buyer_id;

    const newReview: ReviewInsert = {
      reviewer_id: userId,
      reviewee_id: revieweeId,
      product_id: order.product_id,
      order_id: reviewData.orderId,
      rating: reviewData.rating,
      title: reviewData.title || null,
      comment: reviewData.comment || null
    };

    try {
      // Create the review
      const { data: review, error: reviewError } = await this.supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .single();

      if (reviewError) {
        // Handle unique constraint violation
        if (reviewError.code === '23505') {
          return {
            success: false,
            error: 'You have already reviewed this order'
          };
        }
        
        return {
          success: false,
          error: 'Failed to create review'
        };
      }

      // Update profile ratings asynchronously (don't block response)
      this.updateProfileRatings(revieweeId).catch(() => {
        // Profile rating update failed, continue silently
      });

      // Send notification asynchronously
      this.sendReviewNotification(review, order, reviewerRole).catch(() => {
        // Notification failed, continue silently
      });

      return {
        success: true,
        review
      };
    } catch {
      return {
        success: false,
        error: 'Unexpected error creating review'
      };
    }
  }

  /**
   * Update user profile ratings based on all their reviews
   */
  private async updateProfileRatings(userId: string): Promise<void> {
    const { data: reviews } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await this.supabase
        .from('profiles')
        .update({
          rating: Math.round(avgRating * 100) / 100, // Round to 2 decimals
          review_count: reviews.length
        })
        .eq('id', userId);
    }
  }

  /**
   * Send notification to reviewee
   */
  private async sendReviewNotification(
    review: ReviewRow,
    order: OrderWithUsers,
    reviewerRole: 'buyer' | 'seller'
  ): Promise<void> {
    const reviewerUsername = reviewerRole === 'buyer' 
      ? order.buyer?.username 
      : order.seller?.username;

    await this.supabase
      .from('notifications')
      .insert({
        user_id: review.reviewee_id,
        type: 'order_update',
        title: `New ${review.rating}⭐ review!`,
        message: `${reviewerUsername || 'Someone'} left you a review`,
        order_id: order.id,
        data: { 
          review_id: review.id, 
          rating: review.rating 
        }
      });
  }

  /**
   * Get reviews for a user (as reviewee)
   */
  async getUserReviews(userId: string, limit = 10, offset = 0) {
    return await this.supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, username, avatar_url),
        product:products(id, title, image_urls)
      `)
      .eq('reviewee_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  /**
   * Get reviews by a user (as reviewer)
   */
  async getReviewsByUser(userId: string, limit = 10, offset = 0) {
    return await this.supabase
      .from('reviews')
      .select(`
        *,
        reviewee:profiles!reviewee_id(id, username, avatar_url),
        product:products(id, title, image_urls)
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  /**
   * Check if user can review a specific order (convenience method)
   */
  async canUserReviewOrder(orderId: string, userId: string): Promise<boolean> {
    const validation = await this.validateOrderForReview(orderId, userId);
    return validation.isValid && validation.canReview === true;
  }
}

/**
 * Helper function to create ReviewsService instance
 */
export function createReviewsService(supabase: SupabaseClient<Database>) {
  return new ReviewsService(supabase);
}