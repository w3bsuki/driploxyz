# Supabase Backend Audit & Refactor Plan

## 🔴 CRITICAL FIX APPLIED (Just Fixed!)

**SSR Session Validation Security Issue FIXED**
- **Issue**: `safeGetSession()` was not validating JWT before trusting session
- **Risk**: Could allow tampered/invalid sessions on server side
- **Fix Applied**: Updated `lib/server/supabase-hooks.ts` to call `auth.getUser()` FIRST
- **File**: `apps/web/src/lib/server/supabase-hooks.ts` lines 54-66
- **Status**: ✅ NOW SECURE - Following Supabase best practices

## Executive Summary
Complete audit of Driplo's Supabase backend reveals critical security vulnerabilities and performance bottlenecks that must be addressed before production launch. SSR configuration has been FIXED to follow Supabase best practices (JWT validation before session trust). This document provides a comprehensive refactor plan with exact SQL migrations and implementation steps.

## Current State Assessment

### Database Architecture
- **29 tables** in public schema with mixed RLS enforcement
- **135 categories** structured in 3-tier hierarchy (L1/L2/L3)
- **36 products**, **20 profiles**, **42 messages** (current data volume)
- **Multiple regions supported**: BG (Bulgaria), UK with currency handling (BGN, GBP, EUR)

### Authentication & SSR Configuration ✅ NOW FIXED
- **PKCE flow correctly implemented** for enhanced OAuth 2.0 security
- **Server-side auth using @supabase/ssr** with proper cookie handling (path explicitly set to `/`)
- **Session validation pattern** NOW follows Supabase docs exactly (FIXED):
  - `safeGetSession()` validates JWT via `auth.getUser()` FIRST before getting session
  - Never trusts unencoded session data on server side
  - **FIX APPLIED**: Changed order to call `getUser()` before `getSession()`
- **Automatic token refresh** configured in browser client with `autoRefreshToken: true`
- **Proper SSR/CSR separation** - server uses `createServerClient`, browser uses `createBrowserClient`
- **Cookie management** correctly implements `getAll()` and `setAll()` with path `/`
- **Auth state sync** via `onAuthStateChange` in layout with proper invalidation

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
-- Following Codex suggestion: regular RPCs should be SECURITY INVOKER

-- Fix get_homepage_data (regular RPC - use SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.get_homepage_data(
  promoted_limit integer DEFAULT 12,
  featured_limit integer DEFAULT 8,
  top_sellers_limit integer DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER  -- Regular RPC, not admin
SET search_path = public  -- Prevent injection
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

### 3B. SSR Configuration VERIFIED ✅ 
```typescript
// Current implementation follows Supabase best practices exactly:

// hooks.server.ts - CORRECT pattern from Supabase docs
event.locals.safeGetSession = async () => {
  // First validate JWT to prevent tampering (CRITICAL for SSR)
  const { data: { user }, error } = await event.locals.supabase.auth.getUser();
  if (error || !user) return { session: null, user: null };
  
  // Only get session after validation
  const { data: { session } } = await event.locals.supabase.auth.getSession();
  return { session, user };
};

// Client configuration - PERFECT
auth: {
  flowType: 'pkce',           // ✅ OAuth 2.0 PKCE for enhanced security
  detectSessionInUrl: true,   // ✅ Handle auth callbacks
  persistSession: true,       // ✅ Store in cookies for SSR
  autoRefreshToken: true      // ✅ Auto-refresh before expiry
}

// Cookie configuration - REQUIRED for SvelteKit
cookies: {
  setAll: (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      event.cookies.set(name, value, { ...options, path: '/' }); // Path MUST be '/'
    });
  }
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


## PHASE 6: IMPLEMENT CODEX BEST PRACTICES

### 6A. Add Strong Type Constraints
```sql
-- Migration: 20250829_add_type_constraints.sql
-- Add NOT NULL constraints and sensible defaults for data integrity

ALTER TABLE public.products 
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ADD CONSTRAINT check_price_positive CHECK (price >= 0),
  ADD CONSTRAINT check_size_valid CHECK (size IS NOT NULL AND size != '');

ALTER TABLE public.product_images
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN display_order SET NOT NULL;

ALTER TABLE public.categories
  ADD CONSTRAINT unique_slug UNIQUE (slug),
  ADD CONSTRAINT unique_parent_slug UNIQUE (parent_id, slug);
```

### 6B. Implement Full-Text Search
```sql
-- Migration: 20250829_add_fulltext_search.sql
-- Add tsvector for fast text search on products

ALTER TABLE public.products 
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX idx_products_search_vector_gin 
  ON public.products USING GIN (search_vector);

-- Search query example:
-- SELECT * FROM products WHERE search_vector @@ plainto_tsquery('english', 'vintage nike');
```

### 6C. Add Denormalized Counters
```sql
-- Migration: 20250829_add_denormalized_counters.sql
-- Maintain counters via triggers to avoid expensive COUNTs

ALTER TABLE public.products
  ADD COLUMN favorites_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN views_count integer DEFAULT 0 NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN products_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN sold_count integer DEFAULT 0 NOT NULL;

-- Trigger for favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET favorites_count = favorites_count + 1 
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET favorites_count = favorites_count - 1 
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_product_favorites
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION update_favorites_count();
```

### 6D. Optimize Messaging Indexes
```sql
-- Migration: 20250829_optimize_messaging.sql
-- Add composite indexes for messaging performance

CREATE INDEX CONCURRENTLY idx_messages_conversation 
  ON public.messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_unread 
  ON public.messages(receiver_id, is_read) 
  WHERE is_read = false;

-- Make mark_as_read idempotent
CREATE OR REPLACE FUNCTION mark_messages_as_read(message_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE messages 
  SET is_read = true, read_at = COALESCE(read_at, now())
  WHERE id = ANY(message_ids) 
    AND receiver_id = (SELECT auth.uid())
    AND is_read = false;  -- Idempotent
END;
$$;
```

### 6E. Implement Atomic Business Logic
```sql
-- Migration: 20250829_atomic_operations.sql
-- Move critical business logic to DB for atomicity

CREATE OR REPLACE FUNCTION create_order(
  p_product_id uuid,
  p_buyer_id uuid,
  p_shipping_address jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_product record;
BEGIN
  -- Lock product row to prevent race conditions
  SELECT * INTO v_product FROM products 
  WHERE id = p_product_id AND is_sold = false 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not available';
  END IF;
  
  -- Create order atomically
  INSERT INTO orders (
    buyer_id, seller_id, total_amount, 
    shipping_address, status
  ) VALUES (
    p_buyer_id, v_product.seller_id, v_product.price,
    p_shipping_address, 'pending'
  ) RETURNING id INTO v_order_id;
  
  -- Mark product as sold
  UPDATE products SET 
    is_sold = true,
    is_active = false,
    sold_at = now()
  WHERE id = p_product_id;
  
  -- Update seller balance
  INSERT INTO seller_balances (user_id, pending_balance)
  VALUES (v_product.seller_id, v_product.price)
  ON CONFLICT (user_id) DO UPDATE
  SET pending_balance = seller_balances.pending_balance + v_product.price;
  
  RETURN v_order_id;
END;
$$;
```

## BEST PRACTICES SUMMARY

### ✅ VERIFIED CORRECT
- **SSR Setup**: Using @supabase/ssr with PKCE flow
- **Cookie Management**: Path explicitly set to `/`
- **Session Validation**: JWT validated before trusting session
- **Client Separation**: Different clients for server/browser

### 🎯 PERFORMANCE OPTIMIZATIONS
- **RLS Policies**: Use `(SELECT auth.uid())` not `auth.uid()`
- **Indexes**: Add missing FK indexes, remove unused ones
- **Counters**: Denormalized via triggers, not COUNT queries
- **Text Search**: tsvector with GIN index for products

### 🔒 SECURITY REQUIREMENTS
- **RLS**: Enable on ALL public tables
- **Functions**: Set search_path, use SECURITY INVOKER for regular RPCs
- **Service Role**: Only use in server routes, never expose to client
- **Constraints**: Add NOT NULL, CHECK constraints for data integrity

### 📦 PRODUCTION CHECKLIST
- [ ] Apply all security migrations (Phase 1)
- [ ] Fix RLS performance issues (Phase 2A)
- [ ] Add missing indexes (Phase 2B)
- [ ] Enable auth security features (Phase 3A)
- [ ] Add type constraints (Phase 6A)
- [ ] Implement text search if needed (Phase 6B)
- [ ] Add denormalized counters (Phase 6C)
- [ ] Move atomic operations to DB (Phase 6E)
- [ ] Test with different user roles
- [ ] Monitor pg_stat_statements

### ⚠️ AVOID THESE MISTAKES
- Never use `auth.getSession()` alone on server (not secure)
- Never trust unencoded session data
- Never expose service role key to client
- Never disable RLS once enabled
- Never use SECURITY DEFINER without role validation
- Never skip setting search_path on functions

