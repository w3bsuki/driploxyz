-- ============================================================================
-- REMOVE UNUSED DATABASE INDEXES
-- ============================================================================
-- Migration: Drop 32 unused indexes identified by Performance Advisor
-- Date: 2025-10-14
-- Issue: Unused indexes consume storage and slow down write operations
-- Impact: Faster INSERTs/UPDATEs, reduced storage, faster vacuum operations
-- NOTE: DROP INDEX CONCURRENTLY cannot run inside a transaction block
-- ============================================================================

-- ============================================================================
-- 1. SEARCH_ANALYTICS TABLE (4 unused indexes)
-- ============================================================================
-- These indexes have 0 scans and are not used by any queries

DROP INDEX CONCURRENTLY IF EXISTS search_analytics_query_idx;
DROP INDEX CONCURRENTLY IF EXISTS search_analytics_created_at_idx;
DROP INDEX CONCURRENTLY IF EXISTS search_analytics_user_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS idx_search_analytics_clicked_product_id;

-- ============================================================================
-- 2. PRODUCTS TABLE (5 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS products_search_vector_idx;
DROP INDEX CONCURRENTLY IF EXISTS products_status_active_idx;
DROP INDEX CONCURRENTLY IF EXISTS products_is_active_idx;
DROP INDEX CONCURRENTLY IF EXISTS products_category_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS products_brand_idx;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_boost_history_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_drip_nominated_by;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_drip_reviewed_by;

-- ============================================================================
-- 3. BOOST_HISTORY TABLE (2 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_boost_history_user_id;

-- ============================================================================
-- 4. BUNDLE_SESSIONS TABLE (2 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_bundle_sessions_buyer_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_bundle_sessions_seller_id;

-- ============================================================================
-- 5. CONVERSATIONS TABLE (3 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_order_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_participant_two_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_product_id;

-- ============================================================================
-- 6. MESSAGES TABLE (2 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_messages_conversation_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_messages_order_id;

-- ============================================================================
-- 7. DRIP_NOMINATIONS TABLE (3 unused indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_nominated_by;
DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_product_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_reviewed_by;

-- ============================================================================
-- 8. NOTIFICATIONS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_notifications_order_id;

-- ============================================================================
-- 9. ORDERS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_orders_buyer_id;

-- ============================================================================
-- 10. PAYOUT_REQUESTS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_payout_requests_processed_by;

-- ============================================================================
-- 11. PRODUCT_VIEWS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_product_views_user_id;

-- ============================================================================
-- 12. REVIEWS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_reviews_order_id;

-- ============================================================================
-- 13. USER_PAYMENTS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_user_payments_user_id;

-- ============================================================================
-- 14. USER_SUBSCRIPTIONS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_user_subscriptions_plan_id;

-- ============================================================================
-- 15. ADMIN_ACTIONS TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_admin_actions_admin_id;

-- ============================================================================
-- 16. BALANCE_HISTORY TABLE (1 unused index)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_balance_history_created_by;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after migration to verify index removal:
--
-- -- Check remaining indexes and their usage
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch,
--   pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
--   AND idx_scan = 0  -- Still unused
-- ORDER BY pg_relation_size(indexrelid) DESC;
--
-- -- Expected: Significantly fewer results (should be close to 0)
-- ============================================================================
