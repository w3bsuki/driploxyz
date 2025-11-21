# Border Radius & Badge System Standardization

## Summary of Changes

Fixed border radius inconsistencies and improved condition badge visibility across the design system.

## Changes Made

### 1. Search Bar Border Radius - 4px (radius-sm)

**File**: `packages/ui/src/lib/compositions/forms/SearchInput.svelte`

```typescript
// Before - Using 12px (radius-xl)
const formOpenClass = 'rounded-t-[var(--radius-xl)] ...';
const formClosedClass = 'rounded-[var(--radius-xl)] ...';

// After - Using 4px (radius-sm)
const formOpenClass = 'rounded-t-[var(--radius-sm)] ...';
const formClosedClass = 'rounded-[var(--radius-sm)] ...';
```

### 2. Condition Badges - Explicit Token-based Radius

**File**: `packages/ui/src/lib/primitives/badge/ConditionBadge.svelte`

```typescript
// Before - Generic rounded
const baseClass = 'inline-flex items-center gap-1 rounded px-1.5 py-0.5 ...';

// After - Explicit token
const baseClass = 'inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 ...';
```

### 3. ConditionBadgeNew - Updated to Use New OKLCH Tokens

**File**: `packages/ui/src/lib/primitives\badge\ConditionBadgeNew.svelte`

Removed borders and updated to use new solid OKLCH color tokens:

```css
/* Before - Pastel with borders */
.condition-badge {
  border: 1px solid;
}
.condition-badge--brand_new_with_tags {
  background-color: var(--condition-new-bg);
  border-color: var(--condition-new-border);
  color: var(--condition-new-text);
}

/* After - Solid colors, no borders */
.condition-badge {
  /* No border */
}
.condition-badge--brand_new_with_tags {
  background-color: var(--condition-new-bg);
  color: var(--condition-new-text);
}
```

All six condition states now properly use the new token system:
- `brand_new_with_tags` → `--condition-new-bg/text`
- `new_without_tags` → `--condition-newwithout-bg/text`
- `like_new` → `--condition-likenew-bg/text`
- `good` → `--condition-good-bg/text`
- `worn` → `--condition-worn-bg/text`
- `fair` → `--condition-fair-bg/text`

## Border Radius Reference

### Standard Tokens (from foundations.css)
```css
--radius-none: 0;
--radius-xs: 0.125rem;  /* 2px */
--radius-sm: 0.25rem;   /* 4px  ← STANDARD for most UI elements */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px  ← Use for banners/larger elements */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-4xl: 2rem;     /* 32px */
--radius-full: 9999px;  /* Circular badges, avatars */
```

### Usage Guide

| Component Type | Radius Token | Value | Notes |
|---------------|--------------|-------|-------|
| Search bars | `--radius-sm` | 4px | Clean, tight corners |
| Product card images | `--radius-sm` | 4px | Matches hardcoded design |
| Condition badges | `--radius-sm` | 4px | Subtle, professional |
| Boost badges | `--radius-sm` | 4px | Consistent with condition |
| Buttons | `--radius-sm` | 4px | Standard button radius |
| Input fields | `--radius-sm` | 4px | Form consistency |
| **Banners** | `--radius-lg` | 8px | **Slightly more rounded** |
| Cards | `--radius-lg` | 8px | Gentle elevation |
| Modals | `--radius-xl` | 12px | Prominent elements |
| ProBadge | `rounded-full` | 9999px | Circular checkmark |
| BrandBadge | `rounded-full` | 9999px | Circular star |
| Pills | `rounded-full` | 9999px | Fully rounded |

## Design Rationale

### Why radius-sm (4px) for most elements?
- ✅ Clean, modern appearance
- ✅ Matches original hardcoded design
- ✅ Not too sharp (0px) or too soft (8px+)
- ✅ Works well at all screen sizes
- ✅ Consistent with minimal design trends

### Why radius-lg (8px) for banners?
- ✅ Banners are larger elements that benefit from slightly softer corners
- ✅ Creates visual hierarchy (larger elements = more rounding)
- ✅ Differentiates promotional/important content
- ✅ Still maintains overall design consistency

### Why rounded-full for ProBadge/BrandBadge?
- ✅ These are circular icon badges, not rectangular
- ✅ Perfect circles communicate exclusivity/premium status
- ✅ Industry standard for verification badges

## Component Status

### ✅ Updated (Using Tokens)
- [x] SearchInput - `radius-sm` (4px)
- [x] ConditionBadge - `radius-sm` (4px)
- [x] ConditionBadgeNew - `radius-sm` (4px)
- [x] ProductCardNew boost badge - `radius-sm` (4px)
- [x] ProductCardNew image container - `radius-sm` (4px)
- [x] ProBadge - `rounded-full` (circular)
- [x] BrandBadge - `rounded-full` (circular)

### ℹ️ Already Correct (No Changes Needed)
- Cards using `--card-radius` (lg/8px)
- Modals using `--modal-radius` (xl/12px)
- Pills using `rounded-full`
- Avatars using `rounded-full`

## Visual Impact

### Before
```
Search Bar: [    12px rounded    ] ← Too rounded
Badges:     [    generic rounded  ] ← Inconsistent
Conditions: [green on green ❌   ] ← Low visibility
```

### After
```
Search Bar: [  4px rounded  ] ← Clean, tight
Badges:     [  4px rounded  ] ← Consistent, token-based
Conditions: [vibrant + white ✅] ← High visibility
Banners:    [   8px rounded   ] ← Slightly softer (hierarchy)
```

## Files Modified

1. ✅ `packages/ui/src/lib/compositions/forms/SearchInput.svelte`
2. ✅ `packages/ui/src/lib/primitives/badge/ConditionBadge.svelte`
3. ✅ `packages/ui/src/lib/primitives/badge/ConditionBadgeNew.svelte`
4. ✅ `packages/ui/src/styles/tokens-v4/components.css` (previous update)

## Testing Checklist

- [ ] Search bar has 4px border radius (tight corners)
- [ ] Condition badges have 4px border radius
- [ ] Condition badges use solid OKLCH colors with white text
- [ ] All six condition states render correctly
- [ ] Product card images have 4px border radius
- [ ] Banners still have 8px border radius (if applicable)
- [ ] ProBadge and BrandBadge remain circular
- [ ] No hardcoded border radius values in badge/search components

## Token Consistency

All components now use design tokens instead of hardcoded values:

```svelte
<!-- ❌ BAD: Hardcoded -->
<div class="rounded-[12px]">...</div>

<!-- ✅ GOOD: Token-based -->
<div class="rounded-[var(--radius-sm)]">...</div>

<!-- ✅ GOOD: Tailwind utility with semantic meaning -->
<div class="rounded-full">...</div>
```

This ensures:
- Easy theming
- Consistent visual language
- Maintainable codebase
- Single source of truth
