-- Remove over-engineered database functions and materialized views
-- This migration simplifies the category system while keeping all categories
BEGIN;

-- ============================================================================
-- 1. Remove materialized view and related functions
-- ============================================================================

-- Drop trigger first to prevent issues during cleanup
DROP TRIGGER IF EXISTS category_change_trigger ON categories;

-- Drop functions that depend on materialized view
DROP FUNCTION IF EXISTS handle_category_change();
DROP FUNCTION IF EXISTS refresh_category_hierarchy_cache();

-- Drop the over-engineered materialized view
DROP MATERIALIZED VIEW IF EXISTS category_hierarchy_cache;

-- ============================================================================
-- 2. Remove complex RPC functions
-- ============================================================================

-- Remove the complex category resolution function
DROP FUNCTION IF EXISTS resolve_category_path(TEXT, TEXT, TEXT);

-- Remove the complex descendants function
DROP FUNCTION IF EXISTS get_category_descendants(UUID);

-- Remove cross-gender lookup function
DROP FUNCTION IF EXISTS get_cross_gender_categories(TEXT, INTEGER);

-- ============================================================================
-- 3. Add proper simple indexes for performance
-- ============================================================================

-- Index for fast product-category lookups
CREATE INDEX IF NOT EXISTS idx_products_category_active
ON products(category_id, is_active, created_at DESC);

-- Index for category hierarchy navigation
CREATE INDEX IF NOT EXISTS idx_categories_parent_sort
ON categories(parent_id, sort_order, is_active);

-- Index for category slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug_active
ON categories(slug, is_active);

-- Index for level-based category queries
CREATE INDEX IF NOT EXISTS idx_categories_level_active
ON categories(level, is_active, sort_order);

-- ============================================================================
-- 4. Create simple category product count function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_product_counts(p_country_code TEXT DEFAULT 'BG')
RETURNS TABLE(
  category_id UUID,
  category_slug TEXT,
  category_name TEXT,
  category_level INTEGER,
  product_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    c.id as category_id,
    c.slug as category_slug,
    c.name as category_name,
    c.level as category_level,
    COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
    AND p.is_active = true
    AND p.is_sold = false
    AND p.country_code = p_country_code
  WHERE c.is_active = true
  GROUP BY c.id, c.slug, c.name, c.level
  ORDER BY c.level, c.sort_order;
$$;

-- ============================================================================
-- 5. Create simple category hierarchy function (if needed)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_with_parents(category_slug TEXT)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  level INTEGER,
  parent_name TEXT,
  parent_slug TEXT,
  root_name TEXT,
  root_slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH category_info AS (
    SELECT
      c.id,
      c.name,
      c.slug,
      c.level,
      c.parent_id,
      p.name as parent_name,
      p.slug as parent_slug,
      p.parent_id as grandparent_id
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    WHERE c.slug = category_slug AND c.is_active = true
  )
  SELECT
    ci.id as category_id,
    ci.name as category_name,
    ci.slug as category_slug,
    ci.level,
    ci.parent_name,
    ci.parent_slug,
    CASE
      WHEN ci.level = 3 THEN gp.name
      WHEN ci.level = 2 THEN ci.parent_name
      ELSE ci.name
    END as root_name,
    CASE
      WHEN ci.level = 3 THEN gp.slug
      WHEN ci.level = 2 THEN ci.parent_slug
      ELSE ci.slug
    END as root_slug
  FROM category_info ci
  LEFT JOIN categories gp ON ci.grandparent_id = gp.id;
$$;

-- ============================================================================
-- 6. Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_category_product_counts(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_category_with_parents(TEXT) TO authenticated, anon;

-- ============================================================================
-- 7. Cleanup any remaining complex functions
-- ============================================================================

-- Remove any other complex category functions if they exist
DROP FUNCTION IF EXISTS get_category_breadcrumbs(UUID);
DROP FUNCTION IF EXISTS resolve_category_hierarchy(TEXT, TEXT, TEXT);

COMMIT;