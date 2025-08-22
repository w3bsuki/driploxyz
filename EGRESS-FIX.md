# 🚨 CRITICAL EGRESS FIX - Stop Overfetching!

## The Problem
You're hitting Supabase egress limits in 1 day because of massive overfetching with `select(*)`.

## Immediate Fixes Required

### 1. Homepage Query (`+page.server.ts`)
**BEFORE (Bad - fetches 30+ columns):**
```typescript
.select(`
  *,
  product_images (*),
  categories!inner (name, parent_id),
  profiles!products_seller_id_fkey (username, rating, avatar_url)
`)
```

**AFTER (Good - only needed columns):**
```typescript
.select(`
  id,
  title,
  price,
  condition,
  size,
  brand,
  is_boosted,
  created_at,
  product_images (
    id,
    image_url,
    sort_order
  ),
  categories!inner (
    name,
    parent_id
  ),
  profiles!products_seller_id_fkey (
    username,
    rating,
    avatar_url
  )
`)
```

### 2. Admin Dashboard (`admin/+page.server.ts`)
**BEFORE (Bad - fetches entire tables for counting):**
```typescript
supabase.from('profiles').select('*', { count: 'exact', head: true })
```

**AFTER (Good - count only):**
```typescript
supabase.from('profiles').select('id', { count: 'exact', head: true })
```

### 3. Search Page (`search/+page.server.ts`)
**BEFORE:**
```typescript
.select(`
  *,
  product_images (*),
  ...
`)
```

**AFTER:**
```typescript
.select(`
  id,
  title,
  price,
  condition,
  size,
  location,
  created_at,
  product_images!inner (
    id,
    image_url
  )
`)
.limit(1) // Only first image for search results
```

### 4. Create a Column Selection Helper
```typescript
// lib/supabase/columns.ts
export const PRODUCT_LIST_COLUMNS = `
  id,
  title,
  price,
  condition,
  size,
  brand,
  created_at
`;

export const PRODUCT_DETAIL_COLUMNS = `
  id,
  title,
  description,
  price,
  condition,
  size,
  brand,
  material,
  color,
  location,
  shipping_cost,
  is_sold,
  created_at,
  seller_id
`;

export const PROFILE_PUBLIC_COLUMNS = `
  id,
  username,
  avatar_url,
  rating,
  sales_count,
  created_at
`;
```

## Egress Calculation

### Current (BAD):
- Product row: ~2-3KB (with description, all columns)
- With images: +1KB
- Homepage load: 12 products × 3KB = **36KB per request**
- 1000 users/day × 10 page views = **360MB/day**

### After Fix (GOOD):
- Product row: ~200 bytes (only needed columns)
- With first image: +100 bytes
- Homepage load: 12 products × 0.3KB = **3.6KB per request**
- 1000 users/day × 10 page views = **36MB/day**

## **90% REDUCTION IN EGRESS!**

## Additional Optimizations

### 1. Implement Pagination
```typescript
// Instead of loading 100 products
.range(0, 19) // Load 20 at a time
```

### 2. Use RPC for Complex Queries
Create stored procedures that return only needed data:
```sql
CREATE OR REPLACE FUNCTION get_product_cards(limit_count INT DEFAULT 12)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  price NUMERIC,
  image_url TEXT,
  seller_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    pi.image_url,
    pr.username as seller_name
  FROM products p
  LEFT JOIN LATERAL (
    SELECT image_url 
    FROM product_images 
    WHERE product_id = p.id 
    ORDER BY sort_order 
    LIMIT 1
  ) pi ON true
  LEFT JOIN profiles pr ON p.seller_id = pr.id
  WHERE p.is_active = true AND p.is_sold = false
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### 3. Enable Response Compression
Already handled by Supabase, but ensure your client supports it.

### 4. Cache Static Data
Categories, top sellers - cache these for 5-10 minutes:
```typescript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let categoriesCache = { data: null, timestamp: 0 };

function getCachedCategories() {
  if (Date.now() - categoriesCache.timestamp < CACHE_TTL) {
    return categoriesCache.data;
  }
  // Fetch and update cache
}
```

## Implementation Priority

1. **TODAY**: Fix homepage query (biggest impact)
2. **TODAY**: Fix admin dashboard counts
3. **TOMORROW**: Fix search page
4. **THIS WEEK**: Implement column helpers
5. **NEXT WEEK**: Add RPC functions for complex queries

## Expected Results
- **90% reduction** in egress
- **5-10x faster** page loads
- **Stay within free tier** limits
- **Better user experience**

---

**STOP USING `select(*)` EVERYWHERE!**