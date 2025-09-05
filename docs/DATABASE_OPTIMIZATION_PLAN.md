# 🗄️ Database Optimization Plan

## 📊 Current Database Analysis

### Tables Overview
- **products** - Main product listings
- **orders** - Order management
- **reviews** - Product reviews
- **favorites** - User favorites
- **messages** - User messaging
- **profiles** - User profiles
- **categories** - Product categories

## 🚀 Critical Indexes to Add

### 1. Products Table
```sql
-- Performance indexes for products
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
```

### 2. Orders Table
```sql
-- Performance indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
```

### 3. Reviews Table
```sql
-- Performance indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
```

### 4. Favorites Table
```sql
-- Performance indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
```

### 5. Messages Table
```sql
-- Performance indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
```

## 🔍 Query Optimization

### 1. Product Search Queries
```sql
-- Optimize product search with proper indexing
EXPLAIN ANALYZE SELECT * FROM products 
WHERE category_id = $1 
AND price BETWEEN $2 AND $3 
AND status = 'active'
ORDER BY created_at DESC 
LIMIT 20;
```

### 2. User Dashboard Queries
```sql
-- Optimize user dashboard queries
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE buyer_id = $1 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Review Aggregation Queries
```sql
-- Optimize review aggregation
EXPLAIN ANALYZE SELECT 
  product_id,
  AVG(rating) as avg_rating,
  COUNT(*) as review_count
FROM reviews 
WHERE product_id = $1
GROUP BY product_id;
```

## 🛡️ RLS Policy Optimization

### 1. Products RLS
```sql
-- Optimize products RLS policy
CREATE POLICY "products_select_policy" ON products
FOR SELECT USING (
  status = 'active' OR 
  auth.uid() = seller_id
);
```

### 2. Orders RLS
```sql
-- Optimize orders RLS policy
CREATE POLICY "orders_select_policy" ON orders
FOR SELECT USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id
);
```

### 3. Reviews RLS
```sql
-- Optimize reviews RLS policy
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (
  product_id IN (
    SELECT id FROM products WHERE status = 'active'
  )
);
```

## 📈 Performance Monitoring

### 1. Slow Query Detection
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_statement = 'all';
```

### 2. Query Performance Analysis
```sql
-- Analyze query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### 3. Index Usage Analysis
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## 🔧 Database Maintenance

### 1. Regular Maintenance Tasks
- [ ] **VACUUM** - Clean up dead tuples
- [ ] **ANALYZE** - Update table statistics
- [ ] **REINDEX** - Rebuild indexes
- [ ] **CLUSTER** - Reorganize table data

### 2. Automated Maintenance
```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION maintenance_routine()
RETURNS void AS $$
BEGIN
  -- Vacuum all tables
  VACUUM ANALYZE;
  
  -- Reindex if needed
  REINDEX DATABASE driplo;
  
  -- Update statistics
  ANALYZE;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Performance Targets

### Query Performance Goals
- [ ] **Simple queries**: < 10ms
- [ ] **Complex queries**: < 100ms
- [ ] **Aggregation queries**: < 200ms
- [ ] **Full-text search**: < 500ms

### Index Efficiency Goals
- [ ] **Index hit ratio**: > 95%
- [ ] **Index size**: < 20% of table size
- [ ] **Index maintenance**: < 5% overhead

## 🚨 Critical Issues to Fix

### 1. Missing Indexes
- [ ] Add indexes for frequently queried columns
- [ ] Create composite indexes for complex queries
- [ ] Add partial indexes for filtered queries

### 2. Inefficient Queries
- [ ] Optimize N+1 query problems
- [ ] Add proper JOIN conditions
- [ ] Use appropriate WHERE clauses

### 3. RLS Performance
- [ ] Simplify complex RLS policies
- [ ] Add policy-specific indexes
- [ ] Cache policy results where possible

## 🎯 Implementation Priority

### Week 1: Critical Indexes
1. Add product search indexes
2. Add order management indexes
3. Add user dashboard indexes

### Week 2: Query Optimization
1. Optimize search queries
2. Optimize dashboard queries
3. Optimize review queries

### Week 3: RLS Optimization
1. Simplify RLS policies
2. Add policy indexes
3. Test policy performance

### Week 4: Monitoring & Maintenance
1. Set up performance monitoring
2. Implement maintenance routines
3. Create performance reports

---

*This plan should be implemented systematically to achieve optimal database performance.*

---

<!-- CLAUDE_CODE: Database Architecture Analysis & Supabase-Specific Optimizations -->

## 🤖 Claude Code Database Analysis

**CLAUDE_CODE: SUPABASE RLS PERFORMANCE IMPACT**
Critical analysis for marketplace database:
- RLS policies add query overhead but are essential for multi-tenant security
- Use `EXPLAIN (ANALYZE, BUFFERS)` to measure RLS policy impact
- Consider policy-specific indexes for complex filtering conditions
- Monitor `pg_stat_statements` for RLS-impacted queries

**CLAUDE_CODE: C2C MARKETPLACE QUERY PATTERNS**
Optimize for typical marketplace usage:
- Product search: category + price range + location filters (composite indexes)
- User dashboard: orders by user + status (covering indexes)
- Real-time messaging: conversation threads (partial indexes on active conversations)
- Seller analytics: products by seller + date ranges (time-series optimization)

**CLAUDE_CODE: SUPABASE-SPECIFIC INDEX STRATEGY**
Leverage Supabase PostgreSQL features:
```sql
-- Use GIN indexes for full-text search
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || description));

-- Partial indexes for active listings
CREATE INDEX idx_active_products ON products(created_at DESC) WHERE status = 'active';

-- Composite indexes for complex marketplace queries
CREATE INDEX idx_products_category_price ON products(category_id, price) WHERE status = 'active';
```

**CLAUDE_CODE: REAL-TIME SUBSCRIPTION OPTIMIZATION**
Optimize for Supabase real-time features:
- Index message tables for real-time subscriptions
- Consider notification tables for user alerts
- Optimize for WebSocket connection efficiency
- Use database triggers for real-time event publishing

**CLAUDE_CODE: MIGRATION SAFETY FOR PRODUCTION**
Ensure zero-downtime migrations:
```sql
-- Always use CONCURRENTLY for production
CREATE INDEX CONCURRENTLY idx_products_seller_status ON products(seller_id, status);

-- Add NOT NULL constraints safely
ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
UPDATE products SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE products ALTER COLUMN updated_at SET NOT NULL;
```

**CLAUDE_CODE: PERFORMANCE MONITORING INTEGRATION**
Connect to existing monitoring stack:
- Use Supabase Dashboard for query performance metrics
- Set up alerts for slow queries (>1000ms for marketplace)
- Monitor connection pool utilization
- Track index hit ratios and table scan frequencies

**CLAUDE_CODE: MARKETPLACE-SPECIFIC OPTIMIZATIONS**
Additional optimizations for C2C platform:
- Image URL storage optimization (CDN integration)
- Search ranking algorithms (popularity + recency)
- Geographic search optimization (PostGIS if needed)
- Review aggregation performance (materialized views)

**CLAUDE_CODE: BACKUP & RECOVERY STRATEGY**
Ensential for marketplace data protection:
- Verify Supabase automated backups are enabled
- Test point-in-time recovery procedures
- Document critical table dependencies
- Plan for data retention policies (GDPR compliance)

---
