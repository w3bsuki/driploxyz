# FilterDrawer Z-Index Proper Fix

## Problem Summary

The **FilterDrawer** component on the `/search` page was appearing **behind the BottomNav** instead of on top of it, making the drawer invisible and unusable.

### Root Causes

1. **Inconsistent z-index values**: FilterDrawer used hardcoded `z-index: 9999` and `10000`, while BottomNav used `z-[80]`
2. **Not using design tokens**: Components weren't using the proper `--z-*` CSS variables from the design system
3. **Stacking context issues**: Excessive inline styles and `!important` declarations were interfering with proper layering
4. **Non-standard Tailwind v4 patterns**: Using old Tailwind v3 arbitrary values instead of design tokens

## Design Token Z-Index System

The project has a proper z-index layering system defined in `packages/ui/src/styles/tokens-v4/foundations.css`:

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-fixed: 1200;      /* For BottomNav */
--z-overlay: 1300;    /* For backdrop */
--z-modal: 1400;      /* For drawer/sheet */
--z-popover: 1500;
--z-toast: 1600;
--z-tooltip: 1700;
```

## Solution

### 1. FilterDrawer.svelte

**Before:**
```svelte
<div
  use:portal
  class="isolate fixed inset-0"
  style="z-index: 9999 !important; position: fixed !important; isolation: isolate !important;"
>
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
  
  <!-- Sheet -->
  <div
    class="absolute bottom-0 left-0 right-0 bg-white"
    style="z-index: 10000 !important; position: absolute !important;"
  >
```

**After:**
```svelte
<div
  use:portal
  class="fixed inset-0"
  style="z-index: var(--z-modal, 1400);"
>
  <!-- Backdrop -->
  <div 
    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
  ></div>
  
  <!-- Sheet -->
  <div
    class="absolute bottom-0 left-0 right-0 bg-white"
    style="bottom: env(safe-area-inset-bottom, 0px);"
  >
```

**Changes:**
- ✅ Removed `!important` declarations
- ✅ Removed hardcoded z-index values (9999, 10000)
- ✅ Use `var(--z-modal, 1400)` on the **container** only
- ✅ Backdrop and sheet stack naturally via DOM order (no explicit z-index needed)
- ✅ Simplified portal action (removed unnecessary style forcing)
- ✅ Removed unnecessary `isolate` class
- ✅ Proper CSS custom property fallbacks

**Key Insight:**
Within a single stacking context (the portal container), elements stack naturally in DOM order. The backdrop comes first, then the sheet, so the sheet appears on top. We only need to set z-index on the container to place the entire drawer above the BottomNav.

### 2. BottomNav.svelte

**Before:**
```svelte
<nav
  class="fixed bottom-0 left-0 right-0 z-[80] sm:hidden"
>
```

**After:**
```svelte
<nav
  class="fixed bottom-0 left-0 right-0 sm:hidden"
  style="z-index: var(--z-fixed, 1200);"
>
```

**Changes:**
- ✅ Removed arbitrary Tailwind class `z-[80]`
- ✅ Use `var(--z-fixed, 1200)` design token
- ✅ Moved z-index to inline style for CSS variable support

## Stacking Order (Bottom to Top)

```
0      - Page content (--z-base: 0)
1200   - BottomNav (--z-fixed: 1200)
1400   - FilterDrawer container (--z-modal: 1400)
         ├─ Backdrop (natural DOM order)
         └─ Sheet (natural DOM order, appears above backdrop)
```

This ensures:
- BottomNav stays above page content (z-index: 1200)
- FilterDrawer container is above BottomNav (z-index: 1400)
- Within the drawer container, backdrop and sheet stack naturally via DOM order
- No competing z-index values within the same stacking context

## Why This Works

1. **Portal to body**: The `portal` action moves the drawer to `document.body`, escaping any parent stacking contexts
2. **Single z-index on container**: Only the portal container needs `z-index: var(--z-modal, 1400)`
3. **Natural DOM stacking**: Backdrop and sheet stack naturally within the container (backdrop first, sheet second)
4. **Proper layering**: Modal container (1400) > Fixed Nav (1200) > Base (0)
5. **No z-index conflicts**: Child elements don't compete with their own z-indexes
6. **No !important**: Removed CSS specificity issues
7. **Svelte 5 compatible**: Clean reactive patterns with `$state` and `$effect`

## Testing Checklist

- [x] FilterDrawer appears above BottomNav on mobile
- [x] Backdrop dims entire screen including BottomNav
- [x] Drawer sheet is fully visible and interactive
- [x] No z-index flickering or stacking issues
- [x] Proper portal behavior (mounts to body)
- [x] No TypeScript errors
- [x] Design tokens properly applied
- [x] Works with safe area insets on iOS

## Related Files

- `packages/ui/src/lib/compositions/product/FilterDrawer.svelte` - Fixed drawer z-index
- `packages/ui/src/lib/compositions/navigation/BottomNav.svelte` - Fixed nav z-index
- `packages/ui/src/styles/tokens-v4/foundations.css` - Z-index design tokens
- `apps/web/src/routes/(app)/(shop)/search/+page.svelte` - Search page using FilterDrawer

## Best Practices Going Forward

### ✅ DO:
- Use `var(--z-modal)`, `var(--z-overlay)`, etc. from design tokens
- Keep z-index values in the token system (1000-1700 range)
- Use CSS custom properties with fallbacks: `var(--z-modal, 1400)`
- Portal drawers/modals to `document.body`

### ❌ DON'T:
- Use arbitrary z-index values like `z-[9999]` or `z-[80]`
- Use `!important` for z-index
- Hardcode z-index values directly in components
- Create new stacking contexts unnecessarily with `isolation: isolate` everywhere

## Verification

Run the type checker:
```bash
pnpm --filter web run check
```

Expected output:
```
✓ Type checking passed
```

The FilterDrawer now properly appears above the BottomNav using the design system's z-index tokens! 🎉
