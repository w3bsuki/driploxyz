-- Phase 4: Performance Optimization - Database Indexes
-- Additional indexes to improve query performance based on common access patterns
-- Migration: 20251125000000_performance_phase4_indexes.sql

-- ============================================================================
-- SEARCH OPTIMIZATION INDEXES
-- Optimize search queries and filtering
-- ============================================================================

-- Composite index for product search with active status and price filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_search
ON products(is_active, status, price, created_at DESC)
WHERE is_active = true AND status = 'active';

-- Index for brand filtering in search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_brand_active
ON products(brand, is_active, status)
WHERE is_active = true AND status = 'active';

-- Index for condition filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_condition_active
ON products(condition, is_active, status, created_at DESC)
WHERE is_active = true AND status = 'active';

-- Index for size filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_size_active
ON products(size, is_active, status)
WHERE is_active = true AND status = 'active';

-- ============================================================================
-- PROFILE/USER RELATED INDEXES
-- Optimize user lookups and profile queries
-- ============================================================================

-- Index for username lookups (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username_lower
ON profiles(LOWER(username));

-- Index for profiles with followers/following counts for leaderboards
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_follower_stats
ON profiles(followers_count DESC, following_count)
WHERE is_seller = true;

-- ============================================================================
-- ORDER/TRANSACTION INDEXES
-- Optimize order queries and status tracking
-- ============================================================================

-- Composite index for seller order management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_status_date
ON orders(seller_id, status, created_at DESC);

-- Index for orders pending fulfillment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_pending
ON orders(created_at DESC)
WHERE status IN ('pending', 'paid', 'processing');

-- Index for payout calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payout_pending
ON orders(seller_id, created_at)
WHERE status = 'completed' AND payout_status = 'pending';

-- ============================================================================
-- ANALYTICS INDEXES
-- Optimize analytics and reporting queries
-- ============================================================================

-- Index for search analytics by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_analytics_date
ON search_analytics(created_at DESC);

-- Index for product view tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_date
ON product_views(product_id, viewed_at DESC);

-- ============================================================================
-- MESSAGING INDEXES
-- Optimize chat and conversation queries
-- ============================================================================

-- Index for unread messages count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread
ON messages(conversation_id, is_read)
WHERE is_read = false;

-- ============================================================================
-- FAVORITES/WISHLIST INDEXES
-- Optimize wishlist and favorites queries
-- ============================================================================

-- Index for checking if user favorited a specific product
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_check
ON favorites(user_id, product_id);

-- Index for user's favorites list ordered by creation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_list
ON favorites(user_id, created_at DESC);

-- ============================================================================
-- REVIEWS INDEXES
-- Optimize review queries
-- ============================================================================

-- Index for seller ratings calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_seller_rating
ON reviews(reviewee_id, rating, created_at DESC)
WHERE is_public = true;

-- ============================================================================
-- NOTIFICATION INDEXES
-- Optimize notification queries
-- ============================================================================

-- Index for user's unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread
ON notifications(user_id, created_at DESC)
WHERE is_read = false;

-- ============================================================================
-- ANALYZE TABLES
-- Update statistics for query planner
-- ============================================================================

ANALYZE products;
ANALYZE profiles;
ANALYZE orders;
ANALYZE favorites;
ANALYZE messages;
ANALYZE reviews;
ANALYZE notifications;
