-- Performance Optimization Indexes
-- Phase 6 of refactor: Performance Optimization & Production Readiness

-- Add search vector index for products table
-- This enables efficient full-text search on products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_vector 
ON products USING gin(search_vector);

-- Add composite index for products by category and status
-- This optimizes filtering and browsing by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status 
ON products(category_id, status);

-- Add index for seller profiles
-- This optimizes seller discovery and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_seller 
ON profiles(is_seller, created_at) WHERE is_seller = true;

-- Add index for orders by user and status
-- This optimizes order history and status tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

-- Additional performance indexes for common query patterns

-- Index for products by seller and created_at (for seller profile pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_created 
ON products(seller_id, created_at DESC);

-- Index for products by price range (for filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price 
ON products(price);

-- Index for products by status and created_at (for admin dashboards)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status_created 
ON products(status, created_at DESC);

-- Index for favorites table by user and product (for quick favorite checks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_product 
ON favorites(user_id, product_id);

-- Index for messages by conversation and created_at (for message threads)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Index for reviews by seller and created_at (for seller profile pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_seller_created 
ON reviews(seller_id, created_at DESC);

-- Partial index for active products only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_created 
ON products(created_at DESC) WHERE status = 'active' AND is_sold = false;

-- Partial index for completed orders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_completed_created 
ON orders(created_at DESC) WHERE status = 'completed';

-- Index for categories by parent_id (for category navigation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent 
ON categories(parent_id) WHERE parent_id IS NOT NULL;