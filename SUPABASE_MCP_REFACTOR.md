# Supabase MCP Refactor Plan

## Overview
This document provides a comprehensive refactor plan for optimizing the Supabase database, RLS policies, queries, and overall performance for production readiness.

## Objectives
- Optimize database schema for performance and scalability
- Audit and enhance Row Level Security (RLS) policies
- Improve query performance and reduce execution time
- Optimize database indexes for common query patterns
- Clean up and optimize database functions
- Fix type generation issues and ensure type safety

## Prerequisites
- Supabase CLI installed and configured
- Access to Supabase project with admin privileges
- MCP server connection established (`supabase` MCP server)
- Database backup created before starting

---

## 1. Database Schema Optimization

### 1.1 Schema Audit
```bash
# Use MCP to list all tables
supabase list_tables

# Use MCP to list all extensions
supabase list_extensions

# Use MCP to list all migrations
supabase list_migrations
```

### 1.2 Schema Analysis
```sql
-- Analyze table sizes and row counts
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Check for unused columns
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### 1.3 Schema Optimization Tasks
1. **Identify and remove unused tables/columns**
2. **Optimize data types for storage efficiency**
3. **Add proper constraints and defaults**
4. **Normalize denormalized data where appropriate**

---

## 2. RLS Policy Audit and Optimization

### 2.1 Current Policy Analysis
```sql
-- Check all existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for tables without RLS
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
```

### 2.2 Policy Optimization
```sql
-- Create optimized RLS policies following the pattern:
-- Replace auth.uid() with (SELECT auth.uid()) to prevent re-evaluation per row

-- Example for products table
DROP POLICY IF EXISTS "Users can view products" ON public.products;
CREATE POLICY "Users can view products" ON public.products
FOR SELECT USING (
  status = 'active' 
  OR seller_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);
```

### 2.3 Policy Performance Testing
```sql
-- Test policy performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM products WHERE status = 'active';
EXPLAIN ANALYZE SELECT * FROM products WHERE seller_id = (SELECT auth.uid());
```

---

## 3. Query Performance Improvements

### 3.1 Slow Query Analysis
```sql
-- Identify slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Check query plans
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM products WHERE category_id = $1 AND status = 'active';
```

### 3.2 Query Optimization
```sql
-- Optimize common query patterns

-- 1. Pagination optimization
CREATE OR REPLACE FUNCTION get_products_paginated(
  category_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price DECIMAL,
  seller_id UUID,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.seller_id,
    p.created_at
  FROM products p
  WHERE 
    (category_id_param IS NULL OR p.category_id = category_id_param)
    AND p.status = 'active'
    AND p.is_sold = false
  ORDER BY p.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 Connection Pooling
```typescript
// Optimize Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    db: {
      poolSize: 10, // Adjust based on your needs
      connectionTimeoutMillis: 10000,
    }
  }
);
```

---

## 4. Index Optimization

### 4.1 Index Analysis
```sql
-- Check existing indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 4.2 Missing Indexes
```sql
-- Find tables that might need indexes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  )
ORDER BY table_name, ordinal_position;
```

### 4.3 Create Performance Indexes
```sql
-- Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status_price 
ON products(category_id, status, price);

-- Add partial indexes for filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_not_sold 
ON products(created_at DESC) 
WHERE status = 'active' AND is_sold = false;

-- Add unique indexes where appropriate
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_product_unique 
ON favorites(user_id, product_id);
```

---

## 5. Function Cleanup

### 5.1 Function Audit
```sql
-- List all custom functions
SELECT 
  proname,
  pronargs,
  prorettype::regtype,
  prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;
```

### 5.2 Function Optimization
```sql
-- Optimize functions for performance and security

-- Example: Optimize product search function
CREATE OR REPLACE FUNCTION search_products(
  search_term TEXT DEFAULT '',
  category_id UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  seller_id UUID,
  category_id UUID,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.seller_id,
    p.category_id,
    p.created_at
  FROM products p
  WHERE 
    p.status = 'active'
    AND p.is_sold = false
    AND (search_term = '' OR p.search_vector @@ plainto_tsquery('english', search_term))
    AND (category_id IS NULL OR p.category_id = category_id)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY 
    CASE WHEN search_term != '' THEN ts_rank(p.search_vector, plainto_tsquery('english', search_term)) ELSE 0 END DESC,
    p.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.3 Remove Unused Functions
```sql
-- Drop unused functions (after careful verification)
DROP FUNCTION IF EXISTS function_name(args);
```

---

## 6. Type Generation Fixes

### 6.1 Generate TypeScript Types
```bash
# Generate types using MCP
supabase generate_typescript_types
```

### 6.2 Type Generation Configuration
```typescript
// Configure type generation in supabase/config.toml
[types]
enabled = true
```

### 6.3 Type Optimization
```typescript
// Create optimized type definitions
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          seller_id: string;
          category_id: string | null;
          status: 'active' | 'inactive' | 'sold';
          is_sold: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      // ... other tables
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_products: {
        Args: {
          search_term?: string;
          category_id?: string;
          min_price?: number;
          max_price?: number;
          limit_param?: number;
          offset_param?: number;
        };
        Returns: Array<{
          id: string;
          title: string;
          description: string | null;
          price: number;
          seller_id: string;
          category_id: string | null;
          created_at: string;
        }>;
      };
      // ... other functions
    };
    Enums: {
      product_status: 'active' | 'inactive' | 'sold';
      user_role: 'user' | 'admin' | 'moderator';
      // ... other enums
    };
  };
}
```

---

## 7. Database Maintenance

### 7.1 Regular Maintenance Tasks
```sql
-- Update table statistics
ANALYZE;

-- Rebuild indexes
REINDEX DATABASE CONCURRENTLY your_database_name;

-- Vacuum and analyze
VACUUM ANALYZE;
```

### 7.2 Monitoring Setup
```sql
-- Create monitoring views
CREATE OR REPLACE VIEW db_stats AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

---

## 8. Security Enhancements

### 8.1 Security Audit
```sql
-- Check for security issues
SELECT 
  usename,
  usecreatedb,
  usesuper,
  userepl,
  passwduntil
FROM pg_user;

-- Check table privileges
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public';
```

### 8.2 Security Hardening
```sql
-- Remove unnecessary public access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Grant specific permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
```

---

## 9. Performance Monitoring

### 9.1 Set up Monitoring
```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create performance monitoring function
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  rows BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
  FROM pg_stat_statements
  WHERE mean_time > 100 -- queries taking more than 100ms
  ORDER BY mean_time DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 9.2 Performance Alerts
```typescript
// Set up performance monitoring
const checkPerformance = async () => {
  const { data, error } = await supabase
    .rpc('get_slow_queries');
    
  if (data && data.length > 0) {
    console.warn('Slow queries detected:', data);
    // Send alert to monitoring system
  }
};
```

---

## 10. Verification Steps

### 10.1 Performance Verification
```sql
-- Test key queries with EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM products WHERE status = 'active' LIMIT 20;
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = $1 AND status = 'active';
EXPLAIN ANALYZE SELECT * FROM products WHERE seller_id = $1;
```

### 10.2 RLS Policy Verification
```sql
-- Test RLS policies with different user contexts
SELECT * FROM products; -- Should be filtered by RLS
```

### 10.3 Index Usage Verification
```sql
-- Check index usage after optimization
SELECT 
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 11. Success Criteria

### 11.1 Performance Metrics
- All queries execute under 100ms average response time
- Database connection pool utilization under 80%
- Index usage rate above 90% for common queries
- No full table scans in production queries

### 11.2 Security Metrics
- All tables have RLS policies enabled
- No direct table access without proper authorization
- All functions use SECURITY DEFINER where appropriate
- No SQL injection vulnerabilities

### 11.3 Code Quality Metrics
- All TypeScript types generated successfully
- No unused functions or indexes
- All database migrations are reversible
- Comprehensive test coverage for database operations

---

## 12. Rollback Plan

### 12.1 Migration Rollback
```bash
# Rollback to previous migration if needed
supabase migration down <migration_name>
```

### 12.2 Emergency Procedures
```sql
-- Disable RLS temporarily if needed
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

---

## 13. Implementation Checklist

- [ ] Create database backup
- [ ] Review and optimize schema
- [ ] Audit and optimize RLS policies
- [ ] Create performance indexes
- [ ] Optimize database functions
- [ ] Generate TypeScript types
- [ ] Set up monitoring
- [ ] Verify performance improvements
- [ ] Document changes
- [ ] Test rollback procedures

---

## 14. MCP Commands Summary

```bash
# List database objects
supabase list_tables
supabase list_extensions
supabase list_migrations

# Execute SQL
supabase execute_sql --query="ANALYZE;"

# Apply migrations
supabase apply_migration --name="optimize_performance" --query="CREATE INDEX..."

# Generate types
supabase generate_typescript_types

# Check advisors
supabase get_advisors --type="performance"
supabase get_advisors --type="security"

# Get logs
supabase get_logs --service="postgres"
```

---

## 15. Next Steps

1. Execute this refactor plan in a staging environment first
2. Monitor performance metrics closely
3. Gradually roll out changes to production
4. Continuously optimize based on real-world usage patterns
5. Schedule regular database maintenance and optimization