# Condition Badges & Border Radius Fix

## Summary
Fixed condition badges visibility and standardized border radius tokens across the design system.

## Changes Made

### 1. Condition Badge Colors - High Visibility OKLCH
**File**: `packages/ui/src/styles/tokens-v4/components.css`

Replaced pastel same-color-on-same-color badges with vibrant solid OKLCH colors with white text:

```css
/* Before: Ugly low-contrast pastel */
--condition-new-bg: var(--color-emerald-50);      /* Very light green */
--condition-new-text: var(--color-emerald-700);   /* Green text on green bg */

/* After: High visibility solid colors */
--condition-new-bg: oklch(0.65 0.20 155);         /* Rich emerald green */
--condition-new-text: oklch(1.0 0 0);             /* Pure white */
```

#### Complete Badge Color Scheme:
- **New with Tags**: Rich emerald green background + white text (`oklch(0.65 0.20 155)`)
- **New without Tags**: Premium blue background + white text (`oklch(0.60 0.18 245)`)
- **Like New**: Indigo blue background + white text (`oklch(0.55 0.16 240)`)
- **Good**: Warm orange background + white text (`oklch(0.62 0.18 65)`)
- **Worn**: Deep red background + white text (`oklch(0.55 0.20 25)`)
- **Fair**: Cool gray background + white text (`oklch(0.50 0.02 280)`)

### 2. ConditionBadge Component Update
**File**: `packages/ui/src/lib/primitives/badge/ConditionBadge.svelte`

Updated to use new token system (removed borders and gradient classes):

```typescript
const conditionClasses: Record<ConditionType, string> = {
  brand_new_with_tags: 'bg-[var(--condition-new-bg)] text-[var(--condition-new-text)]',
  new_without_tags: 'bg-[var(--condition-newwithout-bg)] text-[var(--condition-newwithout-text)]',
  like_new: 'bg-[var(--condition-likenew-bg)] text-[var(--condition-likenew-text)]',
  good: 'bg-[var(--condition-good-bg)] text-[var(--condition-good-text)]',
  worn: 'bg-[var(--condition-worn-bg)] text-[var(--condition-worn-text)]',
  fair: 'bg-[var(--condition-fair-bg)] text-[var(--condition-fair-text)]'
};
```

### 3. Product Card Border Radius - 4px Standard
**File**: `packages/ui/src/styles/tokens-v4/components.css`

Changed product card image radius from 8px to 4px to match hardcoded design:

```css
/* Before */
--product-card-radius: var(--radius-lg);   /* 8px radius */

/* After */
--product-card-radius: var(--radius-sm);   /* 4px radius - matches hardcoded values */
```

### 4. Search Bar Border Radius - Token-based
**File**: `packages/ui/src/lib/compositions/forms/SearchInput.svelte`

Replaced hardcoded 12px with `--radius-xl` token:

```typescript
// Before
const formClosedClass = 'rounded-[12px] shadow-[var(--shadow-sm)]';

// After
const formClosedClass = 'rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]';
```

## Border Radius Token Reference

All components now use these standardized tokens:

```css
--radius-none: 0;
--radius-xs: 0.125rem;  /* 2px */
--radius-sm: 0.25rem;   /* 4px  ← Product cards, buttons, badges */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px ← Search bar */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-4xl: 2rem;     /* 32px */
--radius-full: 9999px;  /* Pills, avatars */
```

## Visual Impact

### Before:
- ❌ Green text on light green background (unreadable)
- ❌ Low contrast badges
- ❌ Inconsistent border radius (hardcoded vs tokens)
- ❌ Product cards too rounded (8px)

### After:
- ✅ High-visibility solid colors with white text
- ✅ Excellent contrast ratios
- ✅ Consistent token-based border radius
- ✅ Product cards match original design (4px)
- ✅ Search bar uses proper token (12px)

## Files Modified

1. `packages/ui/src/styles/tokens-v4/components.css`
2. `packages/ui/src/lib/primitives/badge/ConditionBadge.svelte`
3. `packages/ui/src/lib/compositions/forms/SearchInput.svelte`

## Testing Checklist

- [ ] Condition badges are clearly visible with white text
- [ ] Product card images have 4px border radius
- [ ] Search bar has 12px border radius
- [ ] All badges use OKLCH colors (no gradients)
- [ ] Badge colors are distinct and recognizable
- [ ] No hardcoded border radius values remaining
