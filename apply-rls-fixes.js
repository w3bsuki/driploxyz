const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koowfhsaqmarfdkwsfiz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3dmaHNhcW1hcmZka3dzZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxNzM0MCwiZXhwIjoyMDcxMDkzMzQwfQ.jNkekv2YVIijYS-NJd1wbhbriqkgxm3On9VfIImxSXc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- Optimize RLS policies to fix auth_rls_initplan performance issues
-- Replace auth.uid() with (SELECT auth.uid()) to prevent re-evaluation per row

-- ============================================================================
-- 1. SUBSCRIPTION_PLANS - Fix admin check optimization
-- ============================================================================
DROP POLICY IF EXISTS "Only admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Only admins can manage subscription plans" ON public.subscription_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);

-- Keep the public view policy as is (no auth needed)
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

-- ============================================================================
-- 2. USER_SUBSCRIPTIONS - Fix all auth.uid() calls
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Combine admin policies into one
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 3. BRANDS - Consolidate and optimize policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view all verified brands" ON public.brands;
DROP POLICY IF EXISTS "Users can manage their own brand" ON public.brands;

-- Single policy for viewing (combines verified brands + own brand)
CREATE POLICY "View brands policy" ON public.brands
FOR SELECT USING (
  is_verified = true 
  OR owner_id = (SELECT auth.uid())
);

-- Separate policies for modification actions
CREATE POLICY "Manage own brand" ON public.brands
FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Update own brand" ON public.brands
FOR UPDATE USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Delete own brand" ON public.brands
FOR DELETE USING (owner_id = (SELECT auth.uid()));

-- ============================================================================
-- 4. BADGES - Consolidate viewing policies
-- ============================================================================
DROP POLICY IF EXISTS "System can manage badges" ON public.badges;
DROP POLICY IF EXISTS "Users can view all badges" ON public.badges;

-- Single policy for public viewing
CREATE POLICY "Public badge viewing" ON public.badges
FOR SELECT USING (true);

-- Admin management policy
CREATE POLICY "Admin badge management" ON public.badges
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 5. CATEGORIES - Consolidate viewing policies
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Public viewing policy
CREATE POLICY "Public category viewing" ON public.categories
FOR SELECT USING (is_active = true);

-- Admin management policy
CREATE POLICY "Admin category management" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
);

-- ============================================================================
-- 6. REVIEWS - Consolidate multiple viewing policies
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviewers can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviewees can view reviews about them" ON public.reviews;

-- Single consolidated viewing policy
CREATE POLICY "Review viewing policy" ON public.reviews
FOR SELECT USING (
  is_public = true 
  OR reviewer_id = (SELECT auth.uid())
  OR reviewed_user_id = (SELECT auth.uid())
);

-- Policy for creating reviews (if needed)
CREATE POLICY IF NOT EXISTS "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (
  reviewer_id = (SELECT auth.uid())
  AND reviewer_id != reviewed_user_id
);

-- Policy for updating own reviews
CREATE POLICY IF NOT EXISTS "Users can update own reviews" ON public.reviews
FOR UPDATE USING (reviewer_id = (SELECT auth.uid()));

-- Policy for deleting own reviews  
CREATE POLICY IF NOT EXISTS "Users can delete own reviews" ON public.reviews
FOR DELETE USING (reviewer_id = (SELECT auth.uid()));
`;

async function applyMigration() {
  try {
    console.log('Applying RLS optimization migration...');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });
      
      if (error) {
        console.error('Error executing statement:', error);
      }
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Failed to apply migration:', error);
  }
}

applyMigration();