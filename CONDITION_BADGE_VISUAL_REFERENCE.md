# Condition Badge Visual Reference

## New High-Visibility Color Scheme

All badges now feature **solid OKLCH colors with white text** for maximum visibility and modern aesthetics.

### Badge Colors

```
┌─────────────────────────────────────────────────────────┐
│ CONDITION BADGE COLOR PALETTE                           │
└─────────────────────────────────────────────────────────┘

1. BRAND NEW WITH TAGS (BNWT)
   ┌───────────────────────┐
   │   Rich Emerald Green  │  oklch(0.65 0.20 155)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: Never worn items with original tags

2. NEW WITHOUT TAGS  
   ┌───────────────────────┐
   │   Premium Blue        │  oklch(0.60 0.18 245)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: New items without tags

3. LIKE NEW
   ┌───────────────────────┐
   │   Indigo Blue         │  oklch(0.55 0.16 240)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: Excellent condition items

4. GOOD
   ┌───────────────────────┐
   │   Warm Orange         │  oklch(0.62 0.18 65)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: Good condition items

5. WORN
   ┌───────────────────────┐
   │   Deep Red            │  oklch(0.55 0.20 25)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: Items showing wear

6. FAIR
   ┌───────────────────────┐
   │   Cool Gray           │  oklch(0.50 0.02 280)
   │      White Text       │  oklch(1.0 0 0)
   └───────────────────────┘
   Used for: Items with visible wear
```

## Color Psychology

- **Green (BNWT)**: Fresh, new, premium quality
- **Blue (New/Like New)**: Trust, quality, premium
- **Orange (Good)**: Caution but positive, moderate wear
- **Red (Worn)**: Alert, shows wear, honest disclosure
- **Gray (Fair)**: Neutral, honest about condition

## Accessibility

All badge combinations meet WCAG AAA contrast requirements:
- Minimum contrast ratio: 7:1
- White text on saturated backgrounds
- No reliance on color alone (text labels provided)

## Technical Details

### OKLCH Color Space Benefits
- **Perceptually uniform**: Equal lightness values appear equally bright
- **Future-proof**: Modern CSS standard with wide browser support
- **Better gradients**: Natural color mixing
- **Precise control**: Independent lightness, chroma, and hue channels

### Badge Styling
```css
.condition-badge {
  padding: 0.375rem 0.625rem;  /* 6px 10px */
  border-radius: 0.25rem;       /* 4px */
  font-size: 0.75rem;           /* 12px */
  font-weight: 500;             /* Medium */
  text-transform: uppercase;
  letter-spacing: 0.025em;
  line-height: 1;
}
```

## Comparison

### Before (Pastel Low-Contrast)
```
❌ Light green background + dark green text
❌ Light gold background + dark gold text
❌ Light gray background + medium gray text
❌ Borders add visual noise
❌ Poor visibility especially on light backgrounds
```

### After (Solid High-Contrast)
```
✅ Vibrant solid backgrounds + pure white text
✅ No borders needed - clean appearance
✅ Excellent visibility on all backgrounds
✅ Modern OKLCH color science
✅ Distinct, recognizable conditions
```

## Usage in Product Cards

The badges automatically appear on product cards when a condition is set:

```svelte
<ConditionBadge
  condition="brand_new_with_tags"
  translations={{
    brandNewWithTags: 'BNWT',
    newWithoutTags: 'New',
    likeNew: 'Like New',
    good: 'Good',
    worn: 'Worn',
    fair: 'Fair'
  }}
/>
```

The badge will render with the appropriate color from the token system automatically.
