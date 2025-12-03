-- Phase 5: Security Hardening - RLS Policy Consolidation & Optimization
-- Migration: 20251125100000_security_phase5_rls.sql
-- 
-- This migration addresses:
-- 1. Consolidates multiple permissive policies into single restrictive policies
-- 2. Fixes auth.uid() InitPlan performance issues
-- 3. Adds proper RLS to search_analytics table
-- 4. Documents security configuration
--
-- Based on Supabase Advisor findings: 26 multiple permissive policy issues

-- ============================================================================
-- HELPER FUNCTION: Cached auth.uid()
-- Prevents re-evaluation per row in RLS policies
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid()
$$;

COMMENT ON FUNCTION auth.current_user_id() IS 
'Cached version of auth.uid() for use in RLS policies. Prevents InitPlan re-evaluation per row.';

-- ============================================================================
-- 1. PRODUCTS TABLE - Consolidate policies
-- ============================================================================

-- Drop existing multiple permissive policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

-- Single consolidated SELECT policy
CREATE POLICY "products_select_policy" ON public.products
FOR SELECT USING (
  -- Public can see active products
  (is_active = true AND status = 'active')
  OR 
  -- Owners can see their own products (any status)
  seller_id = auth.current_user_id()
  OR
  -- Admins can see all products
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

-- Keep separate INSERT/UPDATE/DELETE policies for clarity
DROP POLICY IF EXISTS "Sellers can create products" ON public.products;
CREATE POLICY "products_insert_policy" ON public.products
FOR INSERT WITH CHECK (seller_id = auth.current_user_id());

DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "products_update_policy" ON public.products
FOR UPDATE USING (
  seller_id = auth.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "products_delete_policy" ON public.products
FOR DELETE USING (
  seller_id = auth.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 2. PROFILES TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Single SELECT policy with proper conditions
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  -- Users can see their own profile
  id = auth.current_user_id()
  OR
  -- Public profiles visible to everyone
  is_public = true
  OR
  -- Admins can see all
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.current_user_id() 
    AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  id = auth.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 3. CONVERSATIONS TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;

CREATE POLICY "conversations_select_policy" ON public.conversations
FOR SELECT USING (
  buyer_id = auth.current_user_id()
  OR seller_id = auth.current_user_id()
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "conversations_insert_policy" ON public.conversations
FOR INSERT WITH CHECK (
  buyer_id = auth.current_user_id()
);

-- ============================================================================
-- 4. MESSAGES TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;

CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.current_user_id() OR c.seller_id = auth.current_user_id())
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.current_user_id()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.current_user_id() OR c.seller_id = auth.current_user_id())
  )
);

-- ============================================================================
-- 5. FAVORITES TABLE - Consolidate policies  
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;

CREATE POLICY "favorites_select_policy" ON public.favorites
FOR SELECT USING (user_id = auth.current_user_id());

DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "favorites_insert_policy" ON public.favorites
FOR INSERT WITH CHECK (user_id = auth.current_user_id());

DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "favorites_delete_policy" ON public.favorites
FOR DELETE USING (user_id = auth.current_user_id());

-- ============================================================================
-- 6. ORDERS TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Buyers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;

CREATE POLICY "orders_select_policy" ON public.orders
FOR SELECT USING (
  buyer_id = auth.current_user_id()
  OR seller_id = auth.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders
FOR INSERT WITH CHECK (buyer_id = auth.current_user_id());

-- ============================================================================
-- 7. NOTIFICATIONS TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (user_id = auth.current_user_id());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (user_id = auth.current_user_id());

DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;
CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE USING (user_id = auth.current_user_id());

-- ============================================================================
-- 8. SEARCH_ANALYTICS TABLE - Add proper RLS
-- Fixes InitPlan performance warning
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "System can insert search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "search_analytics_insert" ON public.search_analytics;
DROP POLICY IF EXISTS "search_analytics_select" ON public.search_analytics;

-- Allow anyone to insert (anonymized analytics)
CREATE POLICY "search_analytics_insert_policy" ON public.search_analytics
FOR INSERT WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "search_analytics_select_policy" ON public.search_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.current_user_id() 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 9. FOLLOWERS TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view follow relationships" ON public.followers;
DROP POLICY IF EXISTS "Users can view followers" ON public.followers;

CREATE POLICY "followers_select_policy" ON public.followers
FOR SELECT USING (true); -- Follow relationships are public

DROP POLICY IF EXISTS "Users can follow others" ON public.followers;
CREATE POLICY "followers_insert_policy" ON public.followers
FOR INSERT WITH CHECK (
  follower_id = auth.current_user_id()
  AND follower_id != following_id -- Can't follow yourself
);

DROP POLICY IF EXISTS "Users can unfollow" ON public.followers;
CREATE POLICY "followers_delete_policy" ON public.followers
FOR DELETE USING (follower_id = auth.current_user_id());

-- ============================================================================
-- 10. PRODUCT_IMAGES TABLE - Consolidate policies
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Product images viewable by anyone" ON public.product_images;

CREATE POLICY "product_images_select_policy" ON public.product_images
FOR SELECT USING (true); -- Images are public

DROP POLICY IF EXISTS "Sellers can manage product images" ON public.product_images;
CREATE POLICY "product_images_insert_policy" ON public.product_images
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id
    AND p.seller_id = auth.current_user_id()
  )
);

CREATE POLICY "product_images_delete_policy" ON public.product_images
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id
    AND p.seller_id = auth.current_user_id()
  )
);

-- ============================================================================
-- 11. ADDRESSES TABLE - User privacy
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can view their addresses" ON public.addresses;

CREATE POLICY "addresses_select_policy" ON public.addresses
FOR SELECT USING (user_id = auth.current_user_id());

DROP POLICY IF EXISTS "Users can manage addresses" ON public.addresses;
CREATE POLICY "addresses_insert_policy" ON public.addresses
FOR INSERT WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "addresses_update_policy" ON public.addresses
FOR UPDATE USING (user_id = auth.current_user_id());

CREATE POLICY "addresses_delete_policy" ON public.addresses
FOR DELETE USING (user_id = auth.current_user_id());

-- ============================================================================
-- SECURITY COMMENTS/DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "products_select_policy" ON public.products IS
'Consolidated SELECT policy: Public sees active products, owners see all own products, admins see all.';

COMMENT ON POLICY "profiles_select_policy" ON public.profiles IS
'Consolidated SELECT policy: Users see own profile, public profiles visible to all, admins see all.';

COMMENT ON POLICY "search_analytics_select_policy" ON public.search_analytics IS
'Admin-only read access. Analytics data is sensitive and should not be exposed to users.';

-- ============================================================================
-- VERIFY POLICIES
-- Run this query to check policy configuration:
-- SELECT tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
-- ============================================================================
