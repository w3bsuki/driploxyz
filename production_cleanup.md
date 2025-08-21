# Production Cleanup - Removing Mock Data

## Overview
This document tracks the removal of all mock/demo data from the Driplo codebase to ensure production uses only real Supabase data.

## Issues Identified

### 1. Mock Data Locations
- **ProfileService** (`apps/web/src/lib/services/profiles.ts`):
  - Line 327: Mock ratings using `Math.random()` for top sellers
  
- **SellerCard Component** (`packages/ui/src/lib/SellerCard.svelte`):
  - Line 279: Hardcoded "Sold 3 items this week"
  - Line 280: Hardcoded "100% of orders shipped on time"
  - Line 281: Hardcoded "Responds to messages in 2 hours"
  - Line 270: Hardcoded "24h Avg shipping"

- **Dashboard** (`apps/web/src/routes/(protected)/dashboard/+page.svelte`):
  - Line 34: Mock monthly views using `Math.random()`
  - Line 462: Mock product views using `Math.random()`

- **Category Page** (`apps/web/src/routes/category/[slug]/+page.svelte`):
  - Lines 69-70: Mock item counts and ratings
  - Lines 78, 86: Mock prices and ratings

- **Sold Dashboard** (`apps/web/src/routes/(protected)/dashboard/sold/+page.svelte`):
  - Line 389: Mock sales count display

## Database Schema Updates

### New Columns Added to `profiles` Table
```sql
-- Statistics for seller performance
response_time_hours INTEGER DEFAULT NULL,
avg_shipping_hours INTEGER DEFAULT NULL,
weekly_sales_count INTEGER DEFAULT 0,
on_time_shipping_rate DECIMAL(5,2) DEFAULT NULL,
monthly_views INTEGER DEFAULT 0,
last_stats_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### New Statistics Tables
```sql
-- Product views tracking
CREATE TABLE product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- Profile views tracking
CREATE TABLE profile_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);
```

## Database Functions Created

### 1. Calculate Seller Stats
```sql
CREATE OR REPLACE FUNCTION calculate_seller_stats(seller_id UUID)
RETURNS TABLE (
    weekly_sales INTEGER,
    response_time_hours INTEGER,
    shipping_time_hours INTEGER,
    on_time_rate DECIMAL
) AS $$
BEGIN
    -- Function implementation in migration file
END;
$$ LANGUAGE plpgsql;
```

### 2. Update Monthly Views
```sql
CREATE OR REPLACE FUNCTION update_monthly_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Function implementation in migration file
END;
$$ LANGUAGE plpgsql;
```

## Files Modified

### 1. ProfileService (`apps/web/src/lib/services/profiles.ts`)
- ✅ Removed mock rating generation (line 327)
- ✅ Now uses actual `rating` field from database
- ✅ Added methods for fetching real statistics

### 2. SellerCard Component (`packages/ui/src/lib/SellerCard.svelte`)
- ✅ Removed hardcoded activity messages
- ✅ Now displays real statistics from props
- ✅ Added conditional rendering for missing data

### 3. Dashboard (`apps/web/src/routes/(protected)/dashboard/+page.svelte`)
- ✅ Removed Math.random() for views
- ✅ Fetches real view counts from database
- ✅ Uses actual order statistics

### 4. Category Page (`apps/web/src/routes/category/[slug]/+page.svelte`)
- ✅ Removed mock item counts and ratings
- ✅ Fetches real seller statistics
- ✅ Uses actual product data

## Implementation Checklist

- [x] Create production_cleanup.md documentation
- [x] Create SQL migration for new columns
- [x] Add product_views and profile_views tables
- [x] Create database functions for stats calculation
- [x] Update ProfileService to remove mock data
- [x] Update SellerCard component
- [x] Update Dashboard page
- [x] Update Category page
- [x] Update Sold dashboard
- [x] Update Offer page
- [x] Add real-time triggers for view counting
- [x] Implement followers/following functionality
- [x] Add followers table and UI
- [x] Test with production data

## Additional Features Implemented

### Followers/Following System
- Created `followers` table with proper relationships
- Added follower/following counts to profiles
- Implemented follow/unfollow functionality
- Added clickable follower/following lists with modals
- Real-time follower count updates via triggers

### Real Statistics Implementation
- `weekly_sales_count` - Calculated from last 7 days of orders
- `monthly_views` - Tracked via product_views table
- `avg_shipping_hours` - Calculated from order shipping times
- `on_time_shipping_rate` - Percentage of orders shipped within 48 hours
- `response_time_hours` - Ready for messaging implementation

## Testing Verification

### Pre-Deployment Tests
1. ✅ Verify all Math.random() calls removed
2. ✅ Check that sales_count displays correctly from database
3. ✅ Confirm rating shows actual value or 0 if null
4. ✅ Test seller statistics calculation
5. ✅ Verify view counting works

### Post-Deployment Monitoring
1. Monitor for any null/undefined display issues
2. Check that statistics update correctly
3. Verify performance with real data queries
4. Monitor error logs for database issues

## Rollback Plan
If issues occur:
1. Revert code changes via git
2. Keep database schema (won't break existing)
3. Hotfix any critical display issues

## Notes
- All mock data has been replaced with real Supabase queries
- Missing data shows sensible defaults (0, "No data", etc.)
- Statistics update via database triggers for performance
- View counting is session-aware to prevent spam