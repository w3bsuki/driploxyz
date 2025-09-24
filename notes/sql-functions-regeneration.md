# SQL Functions That Need Regeneration

## Overview
After aligning the codebase with the restored Supabase schema, several SQL functions were identified as missing or needing updates to match the current database structure.

## Functions That Need to be Created/Updated

### 1. `get_category_product_counts`
**Status**: Missing from current schema
**Used in**: `apps/web/src/routes/+page.server.ts` (replaced with `get_virtual_category_counts`)
**Purpose**: Count products by category for search filters
**Current Workaround**: Using `get_virtual_category_counts` and manual category queries

### 2. Enhanced Message Functions
**Status**: Existing but could be optimized
**Current Functions**:
- `get_conversation_messages_secure`
- `get_user_conversations_secure`
- `mark_conversation_read_secure`

**Potential Improvements**:
- Add pagination support to `get_conversation_messages_secure`
- Include receiver profile data in message responses
- Add message thread/context support

### 3. Search and Product Functions
**Status**: Working but suboptimal
**Current Issues**:
- Category resolution requires multiple sequential queries
- Product search lacks full-text search capabilities
- No aggregated product statistics by seller

**Suggested New Functions**:
```sql
-- Enhanced product search with full-text search
CREATE OR REPLACE FUNCTION search_products_enhanced(
  p_query TEXT DEFAULT NULL,
  p_category_ids UUID[] DEFAULT NULL,
  p_country_code TEXT DEFAULT 'BG',
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_condition TEXT DEFAULT NULL,
  p_brand TEXT DEFAULT NULL,
  p_size TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE(...);

-- Get category hierarchy with product counts
CREATE OR REPLACE FUNCTION get_category_hierarchy_with_counts(
  p_country_code TEXT DEFAULT 'BG'
) RETURNS JSON;

-- Get seller statistics
CREATE OR REPLACE FUNCTION get_seller_stats(
  p_seller_id UUID
) RETURNS TABLE(
  total_products INTEGER,
  active_products INTEGER,
  total_sales INTEGER,
  avg_rating DECIMAL,
  response_time_hours DECIMAL
);
```

### 4. Performance Optimization Functions
**Status**: Missing
**Need**: Database functions to replace expensive client-side operations

**Suggested Functions**:
```sql
-- Batch favorite operations
CREATE OR REPLACE FUNCTION toggle_favorites_batch(
  p_user_id UUID,
  p_product_ids UUID[],
  p_action TEXT -- 'add' or 'remove'
) RETURNS TABLE(product_id UUID, is_favorited BOOLEAN);

-- Get homepage data with proper caching
CREATE OR REPLACE FUNCTION get_homepage_data_optimized(
  p_country_code TEXT DEFAULT 'BG',
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
) RETURNS JSON;
```

## Implementation Priority

### High Priority
1. **Category product counts function** - Critical for search performance
2. **Enhanced search function** - Currently doing expensive operations client-side
3. **Optimized homepage data function** - Currently over-fetching data

### Medium Priority
1. **Seller statistics function** - Would improve seller pages performance
2. **Batch favorites function** - Would reduce API calls
3. **Enhanced message functions** - Would improve messaging UX

### Low Priority
1. **Full-text search integration** - Can be added later for better search
2. **Analytics functions** - For dashboard improvements
3. **Notification aggregation functions** - For better notification handling

## Current Workarounds

### 1. Category Product Counts
```typescript
// Current workaround in +page.server.ts
const { data: categoryCountsData } = await supabase.rpc('get_virtual_category_counts');
// Manual category queries for hierarchy
```

### 2. Search Performance
```typescript
// Current workaround in search/+page.server.ts
// Multiple sequential database calls instead of single optimized function
const categoryIds = await resolveCategoryIds(supabase, category, subcategory, specific);
```

### 3. Homepage Data
```typescript
// Current workaround in +page.server.ts
// Fetching 50 products with full profiles then filtering client-side
// Should be done server-side with proper pagination
```

## Next Steps

1. **Immediate**: Review existing RPC functions in Supabase dashboard
2. **Short-term**: Implement `get_category_product_counts` function
3. **Medium-term**: Create optimized search and homepage functions
4. **Long-term**: Implement full-text search and analytics functions

## Notes

- All new functions should follow the existing security pattern with RLS policies
- Functions should return structured JSON for complex data to avoid type issues
- Consider using materialized views for frequently computed data
- Test all functions with realistic data volumes before deployment