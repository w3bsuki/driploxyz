-- Fix GROUP BY error in get_homepage_data function
-- The error occurs because we're selecting p.created_at without including it in GROUP BY

DROP FUNCTION IF EXISTS get_homepage_data(integer, integer, integer);

CREATE OR REPLACE FUNCTION get_homepage_data(
  promoted_limit integer DEFAULT 8,
  featured_limit integer DEFAULT 12,
  top_sellers_limit integer DEFAULT 8
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'promoted_products', (
      SELECT COALESCE(json_agg(row_to_json(p.*)), '[]'::json)
      FROM (
        SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'display_order', pi.display_order
            )) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as images,
          c.name as category_name,
          pr.username as seller_name,
          pr.rating as seller_rating,
          pr.avatar_url as seller_avatar
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN profiles pr ON p.seller_id = pr.id
        WHERE p.is_promoted = true
          AND p.is_active = true
          AND p.is_sold = false
        GROUP BY p.id, c.name, pr.username, pr.rating, pr.avatar_url
        ORDER BY p.promotion_end_date DESC NULLS LAST, p.created_at DESC
        LIMIT promoted_limit
      ) p
    ),
    'featured_products', (
      SELECT COALESCE(json_agg(row_to_json(p.*)), '[]'::json)
      FROM (
        SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'display_order', pi.display_order
            )) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as images,
          c.name as category_name,
          pr.username as seller_name,
          pr.rating as seller_rating,
          pr.avatar_url as seller_avatar
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN profiles pr ON p.seller_id = pr.id
        WHERE p.is_active = true
          AND p.is_sold = false
        GROUP BY p.id, c.name, pr.username, pr.rating, pr.avatar_url
        ORDER BY p.created_at DESC
        LIMIT featured_limit
      ) p
    ),
    'categories', (
      SELECT COALESCE(json_agg(row_to_json(c.*)), '[]'::json)
      FROM (
        SELECT *
        FROM categories
        WHERE parent_id IS NULL
        ORDER BY display_order, name
      ) c
    ),
    'top_sellers', (
      SELECT COALESCE(json_agg(row_to_json(s.*)), '[]'::json)
      FROM (
        SELECT 
          p.id,
          p.username,
          p.bio,
          p.avatar_url,
          p.rating,
          p.total_sales,
          p.joined_date,
          COUNT(DISTINCT pr.id) as product_count,
          AVG(pr.price) as avg_price
        FROM profiles p
        LEFT JOIN products pr ON p.id = pr.seller_id AND pr.is_active = true AND pr.is_sold = false
        WHERE p.is_seller = true
        GROUP BY p.id, p.username, p.bio, p.avatar_url, p.rating, p.total_sales, p.joined_date
        ORDER BY p.total_sales DESC NULLS LAST, p.rating DESC NULLS LAST
        LIMIT top_sellers_limit
      ) s
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_homepage_data(integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_homepage_data(integer, integer, integer) TO anon;