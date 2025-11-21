# Category Browse Sheet Z-Index Fix

## Issue Report
User reported: "the categories dropdown shows drawer from the bottom which opens behind the bottom navsheet and fucking not visible, and its empty.. idk?"

## Problems Identified

### 1. Z-Index Layering Issue ❌
**Problem:** CategoryBrowseSheet and FilterDrawer were rendering BEHIND BottomNav
- **CategoryBrowseSheet**: `z-50`
- **FilterDrawer**: `z-50`
- **BottomNav**: `z-[80]` ⚠️ Higher than modals!

**Why this breaks:** Bottom sheets need to appear on top of ALL navigation elements, but BottomNav's z-80 was higher than the sheets' z-50.

### 2. Empty Category Data 🔍
**Investigation needed:** Added debug logging to check if `data.categoryHierarchy` is populated correctly.

## Fixes Applied

### Fix 1: Update Z-Index Hierarchy ✅

**Changed CategoryBrowseSheet:**
```svelte
<!-- BEFORE -->
<div class="fixed inset-0 z-50 {className}">

<!-- AFTER -->
<div class="fixed inset-0 z-[90] {className}">
```

**Changed FilterDrawer:**
```svelte
<!-- BEFORE -->
<div class="fixed inset-0 z-50 {className}">

<!-- AFTER -->
<div class="fixed inset-0 z-[90] {className}">
```

**Final Z-Index Stack:**
```
z-[90] - Modal overlays (CategoryBrowseSheet, FilterDrawer)
z-[80] - BottomNav (fixed mobile navigation)
z-50   - Regular overlays
z-40   - Sticky elements
z-30   - Headers
z-10   - Floating elements
z-0    - Base content
```

### Fix 2: Debug Category Data 🔧

**Added logging to search page:**
```typescript
let browseCategoryData = $derived.by(() => {
  // Debug logging
  console.log('CategoryHierarchy raw:', data.categoryHierarchy);
  console.log('CategoryHierarchy keys:', data.categoryHierarchy ? Object.keys(data.categoryHierarchy) : 'undefined');
  
  if (!data.categoryHierarchy || Object.keys(data.categoryHierarchy).length === 0) {
    console.warn('No category hierarchy data available');
    return [];
  }

  const transformed = /* transformation logic */;
  
  console.log('Transformed browseCategoryData:', transformed);
  return transformed;
});
```

**Purpose:** This will show in browser console:
1. Whether `data.categoryHierarchy` exists
2. What category keys are available
3. The final transformed data structure
4. Any warnings if data is missing

## Testing Required

### 1. Test Z-Index Fix 🧪
- [ ] Open search page on mobile
- [ ] Click "Browse" button
- [ ] Verify CategoryBrowseSheet appears ON TOP of BottomNav
- [ ] Close sheet
- [ ] Click filter button
- [ ] Verify FilterDrawer appears ON TOP of BottomNav

### 2. Debug Category Data 🔍
Open browser console and check for:

**Expected logs:**
```
CategoryHierarchy raw: { men: {...}, women: {...}, ... }
CategoryHierarchy keys: ["men", "women", "kids", ...]
Transformed browseCategoryData: [{ id: "...", name: "Men", slug: "men", ... }]
```

**If empty:**
```
CategoryHierarchy raw: {}
CategoryHierarchy keys: []
No category hierarchy data available (warning)
```

**Next steps if empty:**
- Check `+page.server.ts` load function
- Verify Supabase categories table has data
- Check if `buildCategoryHierarchy()` is working
- Verify categories have `is_active: true`

### 3. Visual Verification ✅
- [ ] Sheet slides up from bottom
- [ ] Backdrop is visible and clickable (closes sheet)
- [ ] Sheet content is readable
- [ ] Navigation breadcrumbs work (L1→L2→L3)
- [ ] Back button works
- [ ] Close button works
- [ ] Touch targets are 44px+ minimum

## Files Modified

### 1. CategoryBrowseSheet.svelte
**Path:** `packages/ui/src/lib/compositions/navigation/CategoryBrowseSheet.svelte`
**Changes:** 
- Line 112: `z-50` → `z-[90]`

### 2. FilterDrawer.svelte
**Path:** `packages/ui/src/lib/compositions/product/FilterDrawer.svelte`
**Changes:**
- Line 129: `z-50` → `z-[90]`

### 3. search/+page.svelte
**Path:** `apps/web/src/routes/(app)/(shop)/search/+page.svelte`
**Changes:**
- Lines 98-106: Added debug logging for categoryHierarchy
- Lines 108-133: Added logging for transformed data

## Expected Behavior After Fix

### CategoryBrowseSheet
1. ✅ Renders on top of BottomNav (z-90 > z-80)
2. ✅ Backdrop blocks interaction with page
3. ✅ Slide-up animation smooth
4. ✅ Categories display if data exists
5. ✅ Shows "No categories available" if empty

### Debug Logging
1. ✅ Console logs show category data structure
2. ✅ Warning appears if hierarchy is empty
3. ✅ Transformed data visible for debugging

## Next Steps

1. **Test in browser** - Open search page and click Browse button
2. **Check console** - Review debug logs
3. **Report findings:**
   - If visible but empty → Category data issue (check server)
   - If still behind BottomNav → z-index not applied (check build)
   - If working → Remove debug logs, mark as resolved

## Related Issues

- **Z-Index:** Same issue would affect FilterDrawer
- **BottomNav:** Consider if z-80 is too high for persistent nav
- **Modals:** All modal components should use z-[90] or higher

## Design System Recommendation

**Establish Z-Index Scale:**
```typescript
// packages/ui/src/lib/tokens/z-index.ts
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  navigation: 80,    // BottomNav, TopNav
  modalSheet: 90,    // Bottom sheets, drawers
  notification: 100, // Toast, alerts
  maximum: 9999      // Emergency overlay
};
```

Then use in components:
```svelte
class="fixed inset-0 z-[var(--z-modal-sheet)]"
```

This prevents z-index conflicts and makes layering intentional.
