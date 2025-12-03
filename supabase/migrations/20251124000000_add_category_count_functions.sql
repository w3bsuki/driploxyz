-- Add missing category product count functions

-- Function to get product counts for virtual/top-level categories (Men, Women, Kids, Unisex)
CREATE OR REPLACE FUNCTION get_virtual_category_counts()
RETURNS TABLE(
  virtual_type TEXT,
  product_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    c.slug as virtual_type,
    COUNT(DISTINCT p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
    AND p.is_active = true
    AND p.is_sold = false
  WHERE c.is_active = true
    AND c.level = 1
  GROUP BY c.slug
  ORDER BY c.sort_order;
$$;

-- Function to get product counts for all categories with optional country filter
CREATE OR REPLACE FUNCTION get_category_product_counts(p_country_code TEXT DEFAULT NULL)
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
    AND (p_country_code IS NULL OR p.country_code = p_country_code)
  WHERE c.is_active = true
  GROUP BY c.id, c.slug, c.name, c.level
  ORDER BY c.level, c.sort_order;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_virtual_category_counts() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_category_product_counts(TEXT) TO authenticated, anon;
