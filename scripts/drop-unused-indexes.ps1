# PowerShell script to drop unused indexes concurrently
# Run this with: $env:DATABASE_URL = "your-connection-string"; .\drop-unused-indexes.ps1

Write-Host "Dropping 32 unused indexes concurrently..." -ForegroundColor Yellow

$indexes = @(
    # SEARCH_ANALYTICS TABLE (4 indexes)
    "search_analytics_query_idx",
    "search_analytics_created_at_idx",
    "search_analytics_user_id_idx",
    "idx_search_analytics_clicked_product_id",
    
    # PRODUCTS TABLE (8 indexes)
    "products_search_vector_idx",
    "products_status_active_idx",
    "products_is_active_idx",
    "products_category_id_idx",
    "products_brand_idx",
    "idx_products_boost_history_id",
    "idx_products_drip_nominated_by",
    "idx_products_drip_reviewed_by",
    
    # BOOST_HISTORY TABLE (1 index)
    "idx_boost_history_user_id",
    
    # BUNDLE_SESSIONS TABLE (2 indexes)
    "idx_bundle_sessions_buyer_id",
    "idx_bundle_sessions_seller_id",
    
    # CONVERSATIONS TABLE (3 indexes)
    "idx_conversations_order_id",
    "idx_conversations_participant_two_id",
    "idx_conversations_product_id",
    
    # MESSAGES TABLE (2 indexes)
    "idx_messages_conversation_id",
    "idx_messages_order_id",
    
    # DRIP_NOMINATIONS TABLE (3 indexes)
    "idx_drip_nominations_nominated_by",
    "idx_drip_nominations_product_id",
    "idx_drip_nominations_reviewed_by",
    
    # NOTIFICATIONS TABLE (1 index)
    "idx_notifications_order_id",
    
    # ORDERS TABLE (1 index)
    "idx_orders_buyer_id",
    
    # PAYOUT_REQUESTS TABLE (1 index)
    "idx_payout_requests_processed_by",
    
    # PRODUCT_VIEWS TABLE (1 index)
    "idx_product_views_user_id",
    
    # REVIEWS TABLE (1 index)
    "idx_reviews_order_id",
    
    # USER_PAYMENTS TABLE (1 index)
    "idx_user_payments_user_id",
    
    # USER_SUBSCRIPTIONS TABLE (1 index)
    "idx_user_subscriptions_plan_id",
    
    # ADMIN_ACTIONS TABLE (1 index)
    "idx_admin_actions_admin_id",
    
    # BALANCE_HISTORY TABLE (1 index)
    "idx_balance_history_created_by"
)

$count = 0
foreach ($index in $indexes) {
    $count++
    Write-Host "[$count/$($indexes.Count)] Dropping $index..." -ForegroundColor Cyan
    $query = "DROP INDEX CONCURRENTLY IF EXISTS $index;"
    psql $env:DATABASE_URL -c $query
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dropped $index" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to drop $index" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Completed dropping $count unused indexes" -ForegroundColor Yellow
Write-Host "Run performance advisor to verify no unused indexes remain" -ForegroundColor Cyan
