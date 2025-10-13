-- Migration: Full-Text Search Implementation for Products
-- Created: 2025-10-13
-- Description: Adds full-text search capabilities to products table with ts_vector column,
-- GIN index, auto-update trigger, and search RPC function with advanced filters

-- Step 1: Add search_vector column (tsvector) to products table
-- This column will store the searchable text representation of product data
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create GIN index on search_vector for fast full-text search
-- GIN (Generalized Inverted Index) is optimized for tsvector columns
CREATE INDEX IF NOT EXISTS products_search_vector_idx 
ON products 
USING GIN (search_vector);

-- Step 3: Create function to generate search vector from product data
-- Combines title, description, category, brand, and condition into searchable text
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate tsvector combining weighted fields:
  -- A weight: title (highest priority)
  -- B weight: brand
  -- C weight: description
  -- D weight: condition
  -- Note: Category is referenced via category_id foreign key, included in full search via JOIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.condition::text, '')), 'D');
  
  RETURN NEW;
END;
$$;

-- Step 4: Create trigger to automatically update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE OF title, description, brand, condition
ON products
FOR EACH ROW
EXECUTE FUNCTION products_search_vector_update();

-- Step 5: Populate search_vector for existing products
UPDATE products
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(brand, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(condition::text, '')), 'D');

-- Step 6: Create RPC function for advanced product search with filters
-- This function provides:
-- - Full-text search with relevance ranking
-- - Category filter
-- - Price range filter
-- - Size filter
-- - Condition filter
-- - Brand filter
-- - Pagination support
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

-- Step 7: Create function for search suggestions/autocomplete
-- Returns popular search terms based on existing product data
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query text,
  suggestion_limit int DEFAULT 10
)
RETURNS TABLE (
  suggestion text,
  category text,
  match_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH suggestions AS (
    -- Extract distinct title words that match the partial query
    SELECT DISTINCT
      p.title as suggestion,
      c.name as category,
      COUNT(*) OVER (PARTITION BY p.title) as match_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.status = 'active'
      AND p.title ILIKE '%' || partial_query || '%'
    
    UNION
    
    -- Extract distinct brand names that match
    SELECT DISTINCT
      p.brand as suggestion,
      c.name as category,
      COUNT(*) OVER (PARTITION BY p.brand) as match_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.status = 'active'
      AND p.brand ILIKE '%' || partial_query || '%'
  )
  SELECT s.suggestion, s.category, s.match_count
  FROM suggestions s
  ORDER BY s.match_count DESC, s.suggestion ASC
  LIMIT suggestion_limit;
END;
$$;

-- Step 8: Create search analytics table to track queries
CREATE TABLE IF NOT EXISTS search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  result_count int NOT NULL DEFAULT 0,
  filters jsonb DEFAULT '{}'::jsonb,
  clicked_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS search_analytics_query_idx ON search_analytics(query);
CREATE INDEX IF NOT EXISTS search_analytics_created_at_idx ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS search_analytics_user_id_idx ON search_analytics(user_id);

-- Step 9: Create function to track search queries
CREATE OR REPLACE FUNCTION track_search_query(
  query_text text,
  result_count int,
  filters jsonb DEFAULT '{}'::jsonb,
  clicked_product_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO search_analytics (query, user_id, result_count, filters, clicked_product_id)
  VALUES (
    query_text,
    auth.uid(),
    result_count,
    filters,
    clicked_product_id
  );
END;
$$;

-- Step 10: Create function to get popular searches
CREATE OR REPLACE FUNCTION get_popular_searches(
  time_period interval DEFAULT '7 days'::interval,
  result_limit int DEFAULT 10
)
RETURNS TABLE (
  query text,
  search_count bigint,
  avg_result_count numeric,
  click_through_rate numeric
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.query,
    COUNT(*) as search_count,
    ROUND(AVG(sa.result_count), 2) as avg_result_count,
    ROUND(
      (COUNT(sa.clicked_product_id)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100,
      2
    ) as click_through_rate
  FROM search_analytics sa
  WHERE sa.created_at >= NOW() - time_period
  GROUP BY sa.query
  ORDER BY search_count DESC
  LIMIT result_limit;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT INSERT ON search_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION search_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION track_search_query TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_searches TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN products.search_vector IS 'Full-text search vector combining title, brand, category, description, and condition';
COMMENT ON FUNCTION search_products IS 'Full-text search with filters: category, price range, size, condition, brand. Returns ranked results.';
COMMENT ON FUNCTION get_search_suggestions IS 'Returns autocomplete suggestions based on partial query matching product titles and brands';
COMMENT ON FUNCTION track_search_query IS 'Tracks search queries for analytics (query, result count, filters, click-through)';
COMMENT ON FUNCTION get_popular_searches IS 'Returns popular search queries with statistics (count, avg results, CTR) for a given time period';
COMMENT ON TABLE search_analytics IS 'Stores search query analytics including user, filters, results, and click-through data';
