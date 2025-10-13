-- Migration: Fix search_products RPC return type mismatch
-- Created: 2025-10-13
-- Description: Fixes type mismatch between function return types and actual column types
-- The function was declaring 'text' but columns are varchar with length limits

-- Drop and recreate the search_products function with correct return types
CREATE OR REPLACE FUNCTION search_products(
  query_text text DEFAULT '',
  filter_category text DEFAULT NULL,
  min_price decimal DEFAULT NULL,
  max_price decimal DEFAULT NULL,
  filter_size text DEFAULT NULL,
  filter_condition text DEFAULT NULL,
  filter_brand text DEFAULT NULL,
  result_limit int DEFAULT 20,
  result_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title varchar(255),           -- Changed from text to match products.title
  description text,
  price decimal,
  category text,
  brand varchar(100),           -- Changed from text to match products.brand
  condition text,
  size varchar(50),             -- Changed from text to match products.size
  images jsonb,
  created_at timestamptz,
  seller_id uuid,
  relevance_rank real
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Convert search text to tsquery using websearch_to_tsquery for user-friendly search
  -- Supports: quoted phrases, AND/OR operators, negation with -
  IF query_text IS NOT NULL AND query_text != '' THEN
    search_query := websearch_to_tsquery('english', query_text);
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    c.name AS category,
    p.brand,
    p.condition::text,
    p.size,
    COALESCE(
      (SELECT jsonb_agg(pi.image_url ORDER BY pi.display_order) 
       FROM product_images pi 
       WHERE pi.product_id = p.id),
      '[]'::jsonb
    ) AS images,
    p.created_at,
    p.seller_id,
    -- Calculate relevance using ts_rank_cd (Cover Density ranking)
    -- Returns higher scores for documents where search terms appear closer together
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank_cd(p.search_vector, search_query)
      ELSE 0
    END AS relevance_rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    -- Only active products
    p.status = 'active'
    -- Full-text search filter (if query provided)
    AND (
      search_query IS NULL 
      OR p.search_vector @@ search_query
      OR c.name ILIKE '%' || query_text || '%'
    )
    -- Category filter (if provided)
    AND (filter_category IS NULL OR c.name = filter_category OR c.slug = filter_category)
    -- Price range filter (if provided)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    -- Size filter (if provided)
    AND (filter_size IS NULL OR p.size = filter_size)
    -- Condition filter (if provided)
    AND (filter_condition IS NULL OR p.condition::text = filter_condition)
    -- Brand filter (if provided)
    AND (filter_brand IS NULL OR p.brand = filter_brand)
  ORDER BY 
    -- Sort by relevance if search query exists, otherwise by created_at
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank_cd(p.search_vector, search_query)
      ELSE 0
    END DESC,
    p.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- Update the comment to reflect the fix
COMMENT ON FUNCTION search_products IS 'Full-text search with filters: category, price range, size, condition, brand. Returns ranked results. Fixed type mismatch in v2.';
