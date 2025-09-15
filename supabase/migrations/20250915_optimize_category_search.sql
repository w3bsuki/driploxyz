-- Optimize search page category queries by creating efficient database functions and views
-- This migration will reduce search page queries from 15+ to 2-3 maximum

BEGIN;

-- ============================================================================
-- 1. Create materialized view for category hierarchy with all descendants
-- ============================================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS category_hierarchy_cache;

-- Create materialized view with pre-computed hierarchy paths and descendants
CREATE MATERIALIZED VIEW category_hierarchy_cache AS
WITH RECURSIVE category_tree AS (
  -- Base case: Level 1 categories
  SELECT
    id,
    name,
    slug,
    parent_id,
    level,
    sort_order,
    is_active,
    created_at,
    updated_at,
    ARRAY[id] as descendant_ids,
    ARRAY[slug]::TEXT[] as hierarchy_slugs,
    ARRAY[name]::TEXT[] as hierarchy_names,
    id as root_id,
    slug as root_slug
  FROM categories
  WHERE level = 1 AND is_active = true

  UNION ALL

  -- Recursive case: child categories
  SELECT
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    c.level,
    c.sort_order,
    c.is_active,
    c.created_at,
    c.updated_at,
    ct.descendant_ids || c.id,
    ct.hierarchy_slugs || c.slug,
    ct.hierarchy_names || c.name,
    ct.root_id,
    ct.root_slug
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
  WHERE c.is_active = true
)
SELECT
  id,
  name,
  slug,
  parent_id,
  level,
  sort_order,
  is_active,
  created_at,
  updated_at,
  descendant_ids,
  hierarchy_slugs,
  hierarchy_names,
  root_id,
  root_slug
FROM category_tree;

-- Create indexes for fast lookups
CREATE UNIQUE INDEX idx_category_hierarchy_cache_id ON category_hierarchy_cache(id);
CREATE INDEX idx_category_hierarchy_cache_slug ON category_hierarchy_cache(slug);
CREATE INDEX idx_category_hierarchy_cache_level ON category_hierarchy_cache(level);
CREATE INDEX idx_category_hierarchy_cache_parent_id ON category_hierarchy_cache(parent_id);
CREATE INDEX idx_category_hierarchy_cache_root_slug ON category_hierarchy_cache(root_slug);

-- ============================================================================
-- 2. Create optimized RPC function for category descendants
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_category_descendants(UUID);

-- Create optimized function using the materialized view
CREATE OR REPLACE FUNCTION get_category_descendants(category_uuid UUID)
RETURNS TABLE(id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Get all descendants of a category using the pre-computed hierarchy
  WITH target_category AS (
    SELECT descendant_ids
    FROM category_hierarchy_cache
    WHERE category_hierarchy_cache.id = category_uuid
    AND is_active = true
    LIMIT 1
  ),
  child_categories AS (
    -- Get direct children
    SELECT ARRAY_AGG(c.id) as child_ids
    FROM categories c
    WHERE c.parent_id = category_uuid
    AND c.is_active = true
  ),
  grandchild_categories AS (
    -- Get grandchildren
    SELECT ARRAY_AGG(gc.id) as grandchild_ids
    FROM categories gc
    JOIN categories c ON gc.parent_id = c.id
    WHERE c.parent_id = category_uuid
    AND gc.is_active = true
    AND c.is_active = true
  )
  SELECT UNNEST(
    ARRAY[category_uuid] ||
    COALESCE((SELECT child_ids FROM child_categories), ARRAY[]::UUID[]) ||
    COALESCE((SELECT grandchild_ids FROM grandchild_categories), ARRAY[]::UUID[])
  ) as id;
$$;

-- ============================================================================
-- 3. Create optimized category resolution function
-- ============================================================================

-- Create function that resolves category paths in a single query
CREATE OR REPLACE FUNCTION resolve_category_path(
  level1_slug TEXT DEFAULT NULL,
  level2_slug TEXT DEFAULT NULL,
  level3_slug TEXT DEFAULT NULL
)
RETURNS TABLE(
  resolved_category_ids UUID[],
  l1_category_id UUID,
  l1_category_name TEXT,
  l1_category_slug TEXT,
  l2_category_id UUID,
  l2_category_name TEXT,
  l2_category_slug TEXT,
  l3_category_id UUID,
  l3_category_name TEXT,
  l3_category_slug TEXT,
  canonical_path TEXT,
  is_valid BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  l1_cat RECORD;
  l2_cat RECORD;
  l3_cat RECORD;
  category_ids UUID[];
BEGIN
  -- Initialize return values
  resolved_category_ids := ARRAY[]::UUID[];
  l1_category_id := NULL;
  l1_category_name := NULL;
  l1_category_slug := NULL;
  l2_category_id := NULL;
  l2_category_name := NULL;
  l2_category_slug := NULL;
  l3_category_id := NULL;
  l3_category_name := NULL;
  l3_category_slug := NULL;
  canonical_path := '';
  is_valid := FALSE;
  error_message := NULL;

  -- Return early if no slugs provided
  IF level1_slug IS NULL OR level1_slug = '' THEN
    error_message := 'No category provided';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Find Level 1 category
  SELECT id, name, slug INTO l1_cat
  FROM categories
  WHERE slug = level1_slug
    AND level = 1
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    error_message := 'Level 1 category not found: ' || level1_slug;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Set L1 values
  l1_category_id := l1_cat.id;
  l1_category_name := l1_cat.name;
  l1_category_slug := l1_cat.slug;
  canonical_path := '/category/' || l1_cat.slug;
  is_valid := TRUE;

  -- If only L1 provided, get all descendants
  IF level2_slug IS NULL OR level2_slug = '' THEN
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM get_category_descendants(l1_cat.id);
    resolved_category_ids := category_ids;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Find Level 2 category under L1
  SELECT id, name, slug INTO l2_cat
  FROM categories
  WHERE (slug = level1_slug || '-' || level2_slug OR slug = level2_slug OR name ILIKE level2_slug)
    AND level = 2
    AND parent_id = l1_cat.id
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    -- L2 not found, return L1 descendants with error
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM get_category_descendants(l1_cat.id);
    resolved_category_ids := category_ids;
    error_message := 'Level 2 category not found: ' || level2_slug;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Set L2 values
  l2_category_id := l2_cat.id;
  l2_category_name := l2_cat.name;
  l2_category_slug := l2_cat.slug;
  canonical_path := canonical_path || '/' || level2_slug;

  -- If only L1 and L2 provided, get L2 descendants
  IF level3_slug IS NULL OR level3_slug = '' THEN
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM get_category_descendants(l2_cat.id);
    resolved_category_ids := category_ids;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Find Level 3 category under L2
  SELECT id, name, slug INTO l3_cat
  FROM categories
  WHERE (slug ILIKE '%' || level3_slug || '%' OR name ILIKE '%' || replace(level3_slug, '-', ' ') || '%')
    AND level = 3
    AND parent_id = l2_cat.id
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    -- L3 not found, return L2 descendants with error
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM get_category_descendants(l2_cat.id);
    resolved_category_ids := category_ids;
    error_message := 'Level 3 category not found: ' || level3_slug;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Set L3 values and return L3 only (leaf node)
  l3_category_id := l3_cat.id;
  l3_category_name := l3_cat.name;
  l3_category_slug := l3_cat.slug;
  canonical_path := canonical_path || '/' || level3_slug;
  resolved_category_ids := ARRAY[l3_cat.id];

  RETURN NEXT;
  RETURN;
END;
$$;

-- ============================================================================
-- 4. Create function to refresh the materialized view
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_category_hierarchy_cache()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY category_hierarchy_cache;
$$;

-- ============================================================================
-- 5. Create trigger to auto-refresh cache when categories change
-- ============================================================================

-- Create function to handle category changes
CREATE OR REPLACE FUNCTION handle_category_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh the materialized view when categories are modified
  PERFORM refresh_category_hierarchy_cache();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS category_change_trigger ON categories;
CREATE TRIGGER category_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH STATEMENT
  EXECUTE FUNCTION handle_category_change();

-- ============================================================================
-- 6. Create optimized cross-gender category lookup function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cross_gender_categories(
  category_name TEXT,
  category_level INTEGER DEFAULT 2
)
RETURNS TABLE(category_id UUID, category_slug TEXT, parent_slug TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    c.id as category_id,
    c.slug as category_slug,
    p.slug as parent_slug
  FROM categories c
  LEFT JOIN categories p ON c.parent_id = p.id
  WHERE c.name = category_name
    AND c.level = category_level
    AND c.is_active = true
    AND (p.is_active = true OR p.id IS NULL);
$$;

-- Grant necessary permissions
GRANT SELECT ON category_hierarchy_cache TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_category_descendants(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION resolve_category_path(TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_cross_gender_categories(TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION refresh_category_hierarchy_cache() TO service_role;

-- Initial refresh of the materialized view
SELECT refresh_category_hierarchy_cache();

COMMIT;