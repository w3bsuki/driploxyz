-- Migration: Optimize search_analytics RLS policies to avoid repeated auth.uid() calls
-- Track: 0.4 - Critical Security Fixes (Phase 1)
-- Date: 2025-10-13
-- Description: Updates SELECT and INSERT policies on search_analytics to use subqueries for auth.uid(), preventing repeated function evaluation and fixing Supabase Advisor warnings.

-- =========================================================================
-- 1. Optimize SELECT policy
-- =========================================================================

DROP POLICY IF EXISTS "Users can view own search history" ON public.search_analytics;

CREATE POLICY "Users can view own search history"
  ON public.search_analytics
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
  );

-- =========================================================================
-- 2. Optimize INSERT policy
-- =========================================================================

DROP POLICY IF EXISTS "Users can track own searches" ON public.search_analytics;

CREATE POLICY "Users can track own searches"
  ON public.search_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

-- Existing anon and service_role policies remain unchanged.

-- =========================================================================
-- Verification
-- =========================================================================

DO $$
DECLARE
  recreated_count integer;
BEGIN
  SELECT COUNT(*) INTO recreated_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'search_analytics'
    AND policyname IN (
      'Users can view own search history',
      'Users can track own searches'
    );

  IF recreated_count = 2 THEN
    RAISE NOTICE 'Verified search_analytics RLS policies use subquery auth.uid().' ;
  ELSE
    RAISE WARNING 'Expected 2 search_analytics policies; found %', recreated_count;
  END IF;
END $$;
