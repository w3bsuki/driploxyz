# Supabase Backend Audit & Refactor Plan

## Executive Summary
Complete audit of Driplo's Supabase backend reveals critical security vulnerabilities, performance bottlenecks, and SSR configuration issues that must be addressed before production launch. This document provides a comprehensive refactor plan with exact SQL migrations and implementation steps.

## Current State Assessment

### Database Architecture
- **29 tables** in public schema with mixed RLS enforcement
- **135 categories** structured in 3-tier hierarchy (L1/L2/L3)
- **36 products**, **20 profiles**, **42 messages** (current data volume)
- **Multiple regions supported**: BG (Bulgaria), UK with currency handling (BGN, GBP, EUR)

### Authentication & SSR Configuration ✅
- **PKCE flow correctly implemented** for enhanced security
- **Server-side auth using @supabase/ssr** with proper cookie handling
- **Session validation on each request** via `safeGetSession()`
- **Automatic token refresh** configured in browser client
- **Proper SSR/CSR separation** - no client leakage to server

### Critical Security Issues Found 🔴

#### 1. RLS Policy Violations (HIGH SEVERITY)
- **4 tables with RLS enabled but NO policies**: `admin_notifications`, `payout_requests`, `seller_balances`, `system_logs`
- **1 table with RLS DISABLED**: `slug_processing_queue` (public exposure risk)
- **SECURITY DEFINER view**: `messages_with_details` bypasses RLS (critical vulnerability)

#### 2. Function Security Issues (MEDIUM SEVERITY)
- **3 functions with mutable search_path**: `get_homepage_data`, `get_category_hierarchy`, `queue_slug_generation`
- **Missing SECURITY INVOKER** on critical functions
- **RLS policy performance issues**: 5 policies using `auth.uid()` instead of `(SELECT auth.uid())`

#### 3. Authentication Vulnerabilities (MEDIUM SEVERITY)
- **OTP expiry > 1 hour** (should be < 1 hour for security)
- **Leaked password protection DISABLED** (HaveIBeenPwned integration off)
- **Mobile deep-link redirects missing** for native apps

### Performance Issues Found 🟡

#### 1. Missing Critical Indexes (HIGH IMPACT)
- **6 unindexed foreign keys** causing slow JOINs
- **Homepage RPC without proper indexes** on join columns
- **No index on products search_vector** for full-text search
- **Missing composite indexes** for common query patterns

#### 2. Unused Indexes (Maintenance Overhead)
- **43 unused indexes** identified, consuming storage and slowing writes
- Includes critical seeming indexes like `idx_products_search_vector`, `idx_products_region`

#### 3. RLS Policy Performance
- **Multiple permissive policies** on `presence` table (4 policies per action)
- **auth.uid() re-evaluation** in 5 policies instead of subquery optimization

### SSR Implementation Review ✅
- **Proper cookie-based auth** with path explicitly set to `/`
- **PKCE flow enabled** for OAuth security
- **Session validation** properly implemented with JWT verification
- **Correct header filtering** for content-range and x-supabase-api-version
- **Type safety** with generated Database types

## CRITICAL REFACTOR PLAN - PHASE 1: SECURITY (DO IMMEDIATELY)

### 1A. Fix RLS Policy Gaps 🔴 CRITICAL
```sql
-- Migration: 20250829_critical_rls_fixes.sql
-- CRITICAL: Add missing policies for tables with RLS enabled but no policies

-- Admin notifications (restrict to admins only)
CREATE POLICY "admin_notifications_admin_only" ON public.admin_notifications
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  ));

-- Payout requests (users see own, admins see all)
CREATE POLICY "payout_requests_own" ON public.payout_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  ));

CREATE POLICY "payout_requests_insert" ON public.payout_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Seller balances (users see own only)
CREATE POLICY "seller_balances_own" ON public.seller_balances
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- System logs (admin read-only)
CREATE POLICY "system_logs_admin_read" ON public.system_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  ));

-- CRITICAL: Enable RLS on slug_processing_queue
ALTER TABLE public.slug_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slug_queue_system_only" ON public.slug_processing_queue
  FOR ALL TO service_role
  USING (true);
```

### 1B. Fix Security Definer View 🔴 CRITICAL
```sql
-- Migration: 20250829_fix_security_definer_view.sql
-- Remove SECURITY DEFINER from messages_with_details view
DROP VIEW IF EXISTS public.messages_with_details;

CREATE VIEW public.messages_with_details AS
SELECT 
  m.*,
  sender.username as sender_username,
  receiver.username as receiver_username
FROM public.messages m
LEFT JOIN public.profiles sender ON m.sender_id = sender.id
LEFT JOIN public.profiles receiver ON m.receiver_id = receiver.id;
-- View will now respect RLS policies of underlying tables
```

### 1C. Fix Function Security 🔴 CRITICAL
```sql
-- Migration: 20250829_fix_function_security.sql
-- Fix search_path for all functions to prevent injection attacks

-- Fix get_homepage_data
CREATE OR REPLACE FUNCTION public.get_homepage_data(
  promoted_limit integer DEFAULT 12,
  featured_limit integer DEFAULT 8,
  top_sellers_limit integer DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
-- [Keep existing function body]
$$;

-- Fix get_category_hierarchy  
CREATE OR REPLACE FUNCTION public.get_category_hierarchy()
RETURNS TABLE(id uuid, name varchar, slug varchar, level int, parent_id uuid)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
-- [Keep existing function body]
$$;

-- Fix queue_slug_generation
CREATE OR REPLACE FUNCTION public.queue_slug_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
-- [Keep existing function body]
$$;
```

## PHASE 2: PERFORMANCE OPTIMIZATION

### 2A. Fix RLS Policy Performance 🟡
```sql
-- Migration: 20250829_optimize_rls_policies.sql
-- Replace auth.uid() with (SELECT auth.uid()) for query plan optimization

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = (SELECT auth.uid()) OR 
    receiver_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.messages;
CREATE POLICY "Users can mark received messages as read" ON public.messages
  FOR UPDATE USING (receiver_id = (SELECT auth.uid()));

-- Fix presence policies (consolidate multiple permissive policies)
DROP POLICY IF EXISTS "Users can view presence" ON public.presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.presence;

CREATE POLICY "presence_read_all" ON public.presence
  FOR SELECT USING (true);

CREATE POLICY "presence_write_own" ON public.presence
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- Fix products policy
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
CREATE POLICY "Authenticated users can create products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = (SELECT auth.uid()));
```

### 2B. Add Missing Critical Indexes 🟡
```sql
-- Migration: 20250829_add_critical_indexes.sql
-- Add missing foreign key indexes for performance

-- Critical foreign key indexes
CREATE INDEX CONCURRENTLY idx_admin_actions_admin_id 
  ON public.admin_actions(admin_id);

CREATE INDEX CONCURRENTLY idx_balance_history_created_by 
  ON public.balance_history(created_by);

CREATE INDEX CONCURRENTLY idx_bundle_sessions_buyer_seller 
  ON public.bundle_sessions(buyer_id, seller_id);

CREATE INDEX CONCURRENTLY idx_payout_requests_processed_by 
  ON public.payout_requests(processed_by);

CREATE INDEX CONCURRENTLY idx_user_subscriptions_plan_id 
  ON public.user_subscriptions(plan_id);

-- Homepage performance indexes
CREATE INDEX CONCURRENTLY idx_products_homepage 
  ON public.products(is_active, is_sold, created_at DESC)
  WHERE is_active = true AND is_sold = false;

CREATE INDEX CONCURRENTLY idx_products_promoted 
  ON public.products(promotion_end_date DESC)
  WHERE is_promoted = true;

CREATE INDEX CONCURRENTLY idx_profiles_top_sellers 
  ON public.profiles(total_sales DESC, rating DESC)
  WHERE is_seller = true;
```

### 2C. Clean Up Unused Indexes 🟡
```sql
-- Migration: 20250829_remove_unused_indexes.sql
-- Remove indexes that have never been used (monitor first in production)

-- Only drop after confirming these are truly unused in production
DROP INDEX IF EXISTS idx_products_search_vector; -- Unused but might be needed
DROP INDEX IF EXISTS idx_products_region; -- Consider keeping for multi-region
-- ... (review each of the 43 unused indexes individually)
```

## PHASE 3: AUTHENTICATION & CONFIGURATION

### 3A. Fix Auth Settings 🔴
```sql
-- Migration: 20250829_auth_security_settings.sql
-- These need to be set via Supabase Dashboard or Management API

-- 1. Enable leaked password protection (Dashboard > Auth > Security)
-- 2. Set OTP expiry to 3600 seconds (1 hour)
-- 3. Add mobile deep-link URLs:
--    - driplo://auth/callback
--    - exp://localhost:19000
--    - exp://192.168.x.x:19000 (your dev IP)
```

### 3B. SSR Configuration Updates ✅
```typescript
// Already properly configured, but document best practices:

// hooks.server.ts - Correct implementation
event.locals.safeGetSession = async () => {
  const { data: { session } } = await event.locals.supabase.auth.getSession();
  if (!session) return { session: null, user: null };
  
  // Validate JWT
  const { data: { user }, error } = await event.locals.supabase.auth.getUser();
  if (error) return { session: null, user: null };
  
  return { session, user };
};

// Client configuration - Correct
auth: {
  flowType: 'pkce', // ✅ Using PKCE
  detectSessionInUrl: true,
  persistSession: true,
  autoRefreshToken: true
}
```

## PHASE 4: DATA INTEGRITY & CLEANUP

### 4A. Normalize Product Status Field
```sql
-- Migration: 20250829_normalize_product_status.sql
-- Fix inconsistency between status='active' and is_active=true

-- Update any remaining status-based policies
DROP POLICY IF EXISTS "Users can view active products" ON public.products;
CREATE POLICY "Users can view active products" ON public.products
  FOR SELECT USING (is_active = true OR seller_id = (SELECT auth.uid()));

-- Ensure data consistency
UPDATE public.products 
SET is_active = CASE WHEN status = 'active' THEN true ELSE false END
WHERE status IS NOT NULL;

-- Drop the redundant status column if safe
-- ALTER TABLE public.products DROP COLUMN status;
```

## PHASE 5: MONITORING & OBSERVABILITY

### 5A. Enable Query Performance Monitoring
```sql
-- Migration: 20250829_enable_monitoring.sql
-- Enable pg_stat_statements for query analysis

-- This is typically enabled at the database level via Supabase Dashboard
-- Dashboard > Database > Extensions > pg_stat_statements

-- Create monitoring queries
CREATE OR REPLACE FUNCTION public.get_slow_queries()
RETURNS TABLE(
  query text,
  calls bigint,
  mean_exec_time float,
  total_exec_time float
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time
  FROM pg_stat_statements
  WHERE mean_exec_time > 100 -- queries slower than 100ms
  ORDER BY mean_exec_time DESC
  LIMIT 20;
$$;
```

## EXECUTION CHECKLIST

### Pre-Production Requirements ✅
- [ ] Run all PHASE 1 security migrations
- [ ] Test RLS policies with different user roles
- [ ] Verify auth flow with PKCE
- [ ] Enable leaked password protection
- [ ] Set OTP expiry to 1 hour
- [ ] Add mobile deep-link URLs

### Performance Optimization ✅
- [ ] Apply PHASE 2 performance migrations
- [ ] Monitor query performance for 24-48 hours
- [ ] Review and selectively drop unused indexes
- [ ] Test homepage load times after indexing

### Production Deployment ✅
- [ ] Backup database before migrations
- [ ] Run migrations in transaction blocks
- [ ] Monitor error rates after deployment
- [ ] Keep rollback scripts ready

## CLI Commands

```bash
# Generate new migration
supabase migration new critical_security_fixes

# Test locally
supabase db reset
supabase start

# Apply to production (careful!)
supabase db push

# Generate fresh types
pnpm db:types

# Monitor performance
supabase db query "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10"
```

## Success Metrics
- **Zero security advisories** from Supabase dashboard
- **Homepage load < 200ms** at p95
- **Zero RLS policy violations** in production
- **100% auth success rate** for valid credentials
- **No exposed data** via public API

## Rollback Plan

Each migration should be wrapped in a transaction for safe rollback:

```sql
-- Example rollback for Phase 1A
BEGIN;
-- Drop new policies if they cause issues
DROP POLICY IF EXISTS "admin_notifications_admin_only" ON public.admin_notifications;
DROP POLICY IF EXISTS "payout_requests_own" ON public.payout_requests;
DROP POLICY IF EXISTS "payout_requests_insert" ON public.payout_requests;
DROP POLICY IF EXISTS "seller_balances_own" ON public.seller_balances;
DROP POLICY IF EXISTS "system_logs_admin_read" ON public.system_logs;
DROP POLICY IF EXISTS "slug_queue_system_only" ON public.slug_processing_queue;
-- Note: Don't disable RLS once enabled - it's a security risk
COMMIT;
```

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| RLS policies block legitimate access | HIGH | Test with multiple user roles in staging |
| Performance degradation from new indexes | MEDIUM | Use CONCURRENTLY, monitor query times |
| Auth flow breaks | HIGH | Test PKCE flow end-to-end before deploy |
| Function security changes break features | MEDIUM | Keep SECURITY DEFINER as fallback |
| Unused index removal affects queries | LOW | Monitor for 48h before dropping |

## Next Steps

1. **IMMEDIATE (Today)**: 
   - Apply Phase 1 security fixes
   - Enable leaked password protection
   - Set OTP expiry to 1 hour

2. **SHORT-TERM (This Week)**:
   - Apply Phase 2 performance optimizations
   - Monitor and adjust indexes
   - Test mobile deep-links

3. **ONGOING**:
   - Monitor pg_stat_statements weekly
   - Review security advisories monthly
   - Optimize slow queries as found


SUGGESTIONS:
- Strong types: add NOT NULL + sensible defaults for hot tables (products.is_active DEFAULT true, products.created_at DEFAULT now(), product_images.display_order DEFAULT 0). Add CHECK (price >= 0) constraints.
- Text search: if full-text search is needed, add a tsvector generated column on products (title, brand, description) with a GIN index; update on insert/update via trigger for fast search queries.
- Denormalized counters: maintain favorites_count, views_count via lightweight triggers to avoid expensive COUNTs on hot paths. Backfill once in a migration.
- Function security: mark admin RPCs as SECURITY DEFINER, set search_path to public, and validate role inside the function; regular RPCs should be SECURITY INVOKER by default.
- RLS stability: prefer (SELECT auth.uid()) in policies and group policies to minimize planner work. Ensure ALTER TABLE ... ENABLE ROW LEVEL SECURITY; on all protected tables.
- Categories integrity: enforce UNIQUE (slug) and optionally UNIQUE (parent_id, slug); keep FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE.
- Presence/messages: add composite indexes for messaging if used (messages(conversation_id, created_at DESC), messages(recipient_id, is_read)), and ensure RPCs like mark_messages_as_read are idempotent and scoped by user.
- Storage cache: set cache-control metadata on public storage objects for images (long max-age + immutable) to cut CDN misses; keep transformations enabled in config.
- Materialization later: if homepage traffic grows, create a materialized view (MV) for the assembled homepage JSON and refresh it via pg_cron (e.g., every 2�5 minutes) or on write-events. Keep the current RPC as a fallback.
- Move business logic to DB where atomic: use SQL functions/WITH statements for multi-table writes (order creation, inventory decrement) so you get all-or-nothing semantics under RLS.
- Migrations hygiene: fold SUPABASE_POLICIES.sql into timestamped migrations to keep history canonical; avoid out-of-band SQL drifting from migration state.
- Service role usage: only call privileged operations from server routes using the service key; never expose it to the client. Keep anon key for browser.

