# Search Bar Layout Shift Fixes - FINAL

## Date: 2025-10-17

## Critical Issues Fixed

### 1. ✅ Layout Shift on Dropdown Open
**Problem:** When search dropdown opened, the search bar and pills would shift down  
**Root Cause:** Padding was added to containers, causing height changes  
**Solution:**
- Removed all padding from `.main-search-wrapper`
- Changed from `min-height` to fixed `height: 44px` 
- Used margins instead of padding for spacing
- Added `contain: layout` for performance
- **Added fixed `min-height: 112px` to wrapper to prevent ANY movement**

**Files Modified:**
- `packages/ui/src/lib/compositions/navigation/MainPageSearchBar.svelte`

### 2. ✅ Blur Effect on Scroll
**Problem:** Text became blurry when scrolling with search bar  
**Root Cause:** `backdrop-filter` causing GPU repaints  
**Solution:**
- Removed `backdrop-filter` from MainPageSearchBar
- Removed `backdrop-filter` from SearchPageSearchBar  
- Changed from semi-transparent to solid backgrounds
- Added `backface-visibility: hidden` and `-webkit-font-smoothing: antialiased`
- Added `transform: translateZ(0)` to force GPU layer

**Files Modified:**
- `packages/ui/src/lib/compositions/navigation/MainPageSearchBar.svelte`
- `packages/ui/src/lib/compositions/navigation/SearchPageSearchBar.svelte`
- `packages/ui/src/lib/compositions/forms/SearchInput.svelte`

### 3. ✅ Dropdown Behind Pills
**Problem:** Search dropdown displayed behind category pills  
**Root Cause:** Z-index stacking context issue  
**Solution:**
- Increased SearchDropdown z-index from `z-50` to `z-[100]`
- SearchDropdown is wrapped in `.search-dropdown-wrapper` with `z-index: 1000`
- Pills have no z-index (default 0), so dropdown appears on top

**Files Modified:**
- `packages/ui/src/lib/compositions/navigation/SearchDropdown.svelte`

### 4. ✅ Product Titles on 2 Lines
**Problem:** Product titles wrapped to 2 lines instead of truncating to 1  
**Root Cause:** `-webkit-line-clamp: 2` allowed 2 lines  
**Solution:**
- Changed from `-webkit-line-clamp: 2` to `-webkit-line-clamp: 1`
- Added `white-space: nowrap` and `text-overflow: ellipsis`
- **Changed font-weight from variable to `600` (semibold) for better readability**
- Ensures single line with ellipsis for long titles

**Files Modified:**
- `packages/ui/src/lib/compositions/cards/ProductCard.svelte`

### 5. ✅ Dropdown Separator
**Problem:** No visual separator between search input and dropdown
**Root Cause:** Missing border-top on dropdown
**Solution:**
- Added `border-t-2` (2px top border) to dropdown container
- Creates clear visual separation from search input
- Maintains connected appearance with matching border color

**Files Modified:**
- `packages/ui/src/lib/compositions/navigation/SearchDropdown.svelte`

### 6. ✅ Search Bar Shifts on Scroll
**Problem:** Search bar moves up when scrolling down the page
**Root Cause:** Wrapper had no fixed height, browser recalculated sticky position
**Solution:**
- Added `min-height: 112px` to `.main-search-wrapper`
- Added `transform: translateZ(0)` to force dedicated GPU layer
- Prevents browser from recalculating layout during scroll

**Files Modified:**
- `packages/ui/src/lib/compositions/navigation/MainPageSearchBar.svelte`

## Technical Implementation

### MainPageSearchBar.svelte
```css
.main-search-wrapper {
  position: sticky;
  top: var(--app-header-offset);
  background-color: var(--color-surface-base);
  z-index: var(--z-header-subheader);
  
  /* CRITICAL: Fixed height prevents ANY movement on scroll */
  min-height: 112px; /* 60px (hero-search) + 52px (pills) */
  
  /* NO backdrop-filter - causes blur */
  /* backdrop-filter: REMOVED */
  
  /* Performance - force dedicated GPU layer */
  contain: layout;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.hero-search {
  /* Fixed height prevents layout shift */
  height: 44px;
  margin-top: var(--space-2);    /* 8px */
  margin-bottom: var(--space-2); /* 8px */
}

.category-pills {
  /* Fixed height prevents layout shift */
  height: 44px;
  margin-bottom: var(--space-2); /* 8px */
}
```

### SearchInput.svelte
```css
.search-form {
  /* Fixed height - CRITICAL for no layout shift */
  height: 44px;
  
  /* Performance */
  contain: layout;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.search-form.dropdown-open {
  /* Remove bottom border radius when dropdown is open */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: transparent;
  box-shadow: var(--shadow-lg);
}

.search-dropdown-wrapper {
  /* Absolutely positioned - doesn't affect parent height */
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  right: 0;
  z-index: var(--z-dropdown); /* 1000 */
}
```

### SearchDropdown.svelte
```javascript
const dropdownContainerClass = `
  search-dropdown-container bg-[color:var(--surface-emphasis)]
  border-x border-b border-t-2 border-[color:var(--border-emphasis)]
  rounded-b-[12px] shadow-[var(--shadow-lg)] overflow-hidden
  absolute top-full left-0 right-0 z-[100]
`.replace(/\s+/g, ' ').trim();
```

### ProductCard.svelte
```css
.product-card__title {
  /* Single line with ellipsis, semibold for readability */
  font-weight: 600; /* Semibold */
  display: -webkit-box;
  -webkit-line-clamp: 1; /* Single line only */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap; /* Force single line */
}
```

## Z-Index Hierarchy

```
Component                     Z-Index     Purpose
─────────────────────────────────────────────────────────────
Pills (category-pills)        0 (default) Base layer
SearchDropdown container      100         Above pills
search-dropdown-wrapper       1000        Top layer for dropdowns
```

## Performance Optimizations

1. **NO backdrop-filter** - Removes GPU repaints and blur
2. **Fixed heights** - Prevents layout shift calculations
3. **CSS containment** - `contain: layout` isolates layout calculations
4. **Hardware acceleration** - `backface-visibility: hidden`, `transform: translateZ(0)`
5. **Font smoothing** - `-webkit-font-smoothing: antialiased` for crisp text

## Testing Checklist

- [x] Search bar does NOT move when dropdown opens
- [x] Search bar does NOT move when scrolling (fixed with min-height + translateZ)
- [x] No blur effect on scroll (removed backdrop-filter)
- [x] Dropdown appears ABOVE category pills (z-index hierarchy)
- [x] Product titles truncate to 1 line with ellipsis
- [x] Product titles are semibold (font-weight: 600)
- [x] No layout shift when toggling filter dropdown
- [x] Dropdown has clear 2px separator from search input
- [x] Smooth transitions without jank
- [x] Text remains crisp and readable

## Related Documentation

- `PROMOTION_BANNERS_ENHANCEMENT.md` - Previous banner fixes
- `DESIGN_TOKENS_REFERENCE.md` - Design token usage
- `PHASE_5_COMPLETION_REPORT.md` - Overall phase 5 completion
