-- Performance Optimization Indexes
-- Phase 6 of refactor: Performance Optimization & Production Readiness

-- Add search vector index for products table
-- This enables efficient full-text search on products
CREATE INDEX  IF NOT EXISTS idx_products_search_vector 
ON products USING gin(search_vector);

-- Add composite index for products by category and status
-- This optimizes filtering and browsing by category
CREATE INDEX  IF NOT EXISTS idx_products_category_status 
ON products(category_id, status);

-- Add index for seller profiles
-- This optimizes seller discovery and filtering
CREATE INDEX  IF NOT EXISTS idx_profiles_seller 
ON profiles(is_seller, created_at) WHERE is_seller = true;

-- Add index for orders by buyer and status
-- This optimizes order history and status tracking
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status 
ON orders(buyer_id, status);

-- Additional performance indexes for common query patterns

-- Index for products by seller and created_at (for seller profile pages)
CREATE INDEX  IF NOT EXISTS idx_products_seller_created 
ON products(seller_id, created_at DESC);

-- Index for products by price range (for filtering)
CREATE INDEX  IF NOT EXISTS idx_products_price 
ON products(price);

-- Index for products by status and created_at (for admin dashboards)
CREATE INDEX  IF NOT EXISTS idx_products_status_created 
ON products(status, created_at DESC);

-- Index for favorites table by user and product (for quick favorite checks)
CREATE INDEX  IF NOT EXISTS idx_favorites_user_product 
ON favorites(user_id, product_id);

-- Index for messages by conversation and created_at (for message threads)
CREATE INDEX  IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Index for reviews by reviewee (seller) and created_at
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_created 
ON reviews(reviewee_id, created_at DESC);

-- Partial index for active products only
CREATE INDEX  IF NOT EXISTS idx_products_active_created 
ON products(created_at DESC) WHERE status = 'active' AND is_sold = false;

-- Partial index for completed orders
CREATE INDEX  IF NOT EXISTS idx_orders_completed_created 
ON orders(created_at DESC) WHERE status = 'completed';

-- Index for categories by parent_id (for category navigation)
CREATE INDEX  IF NOT EXISTS idx_categories_parent 
ON categories(parent_id) WHERE parent_id IS NOT NULL;
