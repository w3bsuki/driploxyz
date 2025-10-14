#!/bin/bash
# Drop unused indexes one by one using CONCURRENTLY
# This script should be run via: psql "$DATABASE_URL" -f drop-unused-indexes.sh

echo "Dropping 32 unused indexes concurrently..."

# SEARCH_ANALYTICS TABLE (4 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS search_analytics_query_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS search_analytics_created_at_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS search_analytics_user_id_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_search_analytics_clicked_product_id;"

# PRODUCTS TABLE (8 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS products_search_vector_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS products_status_active_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS products_is_active_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS products_category_id_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS products_brand_idx;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_products_boost_history_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_products_drip_nominated_by;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_products_drip_reviewed_by;"

# BOOST_HISTORY TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_boost_history_user_id;"

# BUNDLE_SESSIONS TABLE (2 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_bundle_sessions_buyer_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_bundle_sessions_seller_id;"

# CONVERSATIONS TABLE (3 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_order_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_participant_two_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_product_id;"

# MESSAGES TABLE (2 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_messages_conversation_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_messages_order_id;"

# DRIP_NOMINATIONS TABLE (3 indexes)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_nominated_by;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_product_id;"
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_drip_nominations_reviewed_by;"

# NOTIFICATIONS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_notifications_order_id;"

# ORDERS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_orders_buyer_id;"

# PAYOUT_REQUESTS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_payout_requests_processed_by;"

# PRODUCT_VIEWS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_product_views_user_id;"

# REVIEWS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_reviews_order_id;"

# USER_PAYMENTS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_user_payments_user_id;"

# USER_SUBSCRIPTIONS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_user_subscriptions_plan_id;"

# ADMIN_ACTIONS TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_admin_actions_admin_id;"

# BALANCE_HISTORY TABLE (1 index)
psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_balance_history_created_by;"

echo "Completed dropping 32 unused indexes"
echo "Run performance advisor to verify: SELECT * FROM performance_linter();"
