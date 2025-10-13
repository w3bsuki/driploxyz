-- Fast search function without slow JSONB aggregation
-- Created: 2025-10-13
-- Purpose: Speed up search dropdown results

CREATE OR REPLACE FUNCTION search_products_fast(
  query_text text DEFAULT '',
  result_limit int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  title text,
  price decimal,
  brand text,
  condition text,
  size text,
  category_name text,
  seller_id uuid,
  first_image_url text,
  relevance_rank real
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Convert search text to tsquery
  IF query_text IS NOT NULL AND query_text != '' THEN
    search_query := websearch_to_tsquery('english', query_text);
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.brand,
    p.condition::text,
    p.size,
    c.name AS category_name,
    p.seller_id,
    (SELECT pi.image_url FROM product_images pi 
     WHERE pi.product_id = p.id 
     ORDER BY pi.sort_order 
     LIMIT 1) AS first_image_url,
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(p.search_vector, search_query)
      ELSE 0
    END AS relevance_rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    p.status = 'active'
    AND p.is_active = true
    AND (
      search_query IS NULL 
      OR p.search_vector @@ search_query
      OR c.name ILIKE '%' || query_text || '%'
    )
  ORDER BY 
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(p.search_vector, search_query)
      ELSE 0
    END DESC,
    p.created_at DESC
  LIMIT result_limit;
END;
$$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS products_status_active_idx 
  ON products(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_is_active_idx 
  ON products(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS products_category_id_idx 
  ON products(category_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_brand_idx 
  ON products(brand) WHERE status = 'active' AND brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS products_active_created_idx 
  ON products(status, created_at DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS product_images_product_sort_idx 
  ON product_images(product_id, sort_order);
