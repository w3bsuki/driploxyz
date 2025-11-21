-- Migration: Update search_products to support country filtering
-- Created: 2025-11-21
-- Description: Adds filter_country_code parameter to search_products RPC function

CREATE OR REPLACE FUNCTION search_products(
  query_text text DEFAULT '',
  filter_category text DEFAULT NULL,
  min_price decimal DEFAULT NULL,
  max_price decimal DEFAULT NULL,
  filter_size text DEFAULT NULL,
  filter_condition text DEFAULT NULL,
  filter_brand text DEFAULT NULL,
  result_limit int DEFAULT 20,
  result_offset int DEFAULT 0,
  filter_country_code text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price decimal,
  category text,
  brand text,
  condition text,
  size text,
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
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank_cd(p.search_vector, search_query)
      ELSE 0
    END AS relevance_rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    p.status = 'active'
    AND (
      search_query IS NULL 
      OR p.search_vector @@ search_query
      OR c.name ILIKE '%' || query_text || '%'
    )
    AND (filter_category IS NULL OR c.name = filter_category OR c.slug = filter_category)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (filter_size IS NULL OR p.size = filter_size)
    AND (filter_condition IS NULL OR p.condition::text = filter_condition)
    AND (filter_brand IS NULL OR p.brand = filter_brand)
    AND (filter_country_code IS NULL OR p.country_code = filter_country_code)
  ORDER BY 
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank_cd(p.search_vector, search_query)
      ELSE 0
    END DESC,
    p.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;
