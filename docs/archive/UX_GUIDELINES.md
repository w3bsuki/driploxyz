# Driplo UX Guidelines 🎨

## Core UX Principles

### 1. Discovery-First Design
- Users should find items they didn't know they wanted
- Multiple pathways to the same content (pills, dropdown, search)
- Clear content labeling prevents confusion

### 2. Mobile-First Interactions
- Touch-friendly buttons (minimum 44px)
- Swipe gestures for carousels
- Thumb-reachable navigation

### 3. Visual Hierarchy
- Premium content gets glass morphism treatment
- Clear section labeling (Promoted, Latest, etc.)
- Consistent spacing and typography

## Navigation Strategy

### Main Page Structure

#### Search Interface
**Purpose**: Discovery + trending searches + hierarchical categories

```
Search Bar Dropdown:
┌─ Trending Now ──────────────┐
│ "Vintage jackets"           │
│ "Y2K jeans"                 │  
│ "Designer bags under $100"  │
├─ Browse Categories ─────────┤
│ 👗 Women → [Dresses, Tops]  │
│ 👔 Men → [Shirts, Jackets]  │
│ 👶 Kids → [Baby, Girls]     │
│ 🐕 Pets → [Dog, Cat]        │
└─────────────────────────────┘
```

#### Quick Pills
**Purpose**: Direct category access for fast browsing
- View all (first position)
- Women, Men, Kids, Pets
- Horizontal scroll on mobile

### Search Page vs Main Page

| Feature | Main Page | Search Page |
|---------|-----------|-------------|
| **Pills** | Always visible (discovery) | Hidden (clean focus) |
| **Dropdown** | Trending + subcategories | Category navigation only |
| **Search** | Broad discovery | Focused filtering |

## Content Sections

### Section Labeling Strategy
Every content section needs clear purpose indication:

#### Promoted/Highlights
```svelte
<div class="flex items-center justify-between mb-4 px-4">
  <h2 class="text-lg font-semibold text-gray-900">Promoted</h2>
  <div class="flex items-center text-sm text-gray-500">
    <span>Swipe for more</span>
    <svg class="w-4 h-4 ml-1"><!-- arrow --></svg>
  </div>
</div>
```

#### Latest Products
```svelte
<div class="flex items-center justify-between mb-4 px-4">
  <h2 class="text-lg font-semibold text-gray-900">Latest</h2>
  <span class="text-sm text-gray-500">New arrivals</span>
</div>
```

### Visual Indicators
- **Promoted items**: Glass morphism + golden border
- **New arrivals**: Timestamp badge
- **Trending**: Fire icon or trending badge
- **Price drops**: Discount percentage

## Glass Morphism Usage

### When to Apply
✅ **Premium content** (promoted products, featured sellers)  
✅ **Primary interactions** (search bars, main CTAs)  
✅ **Navigation elements** (category buttons, filters)  
✅ **Modal overlays** and important dialogs

❌ **Regular product grids** (visual noise)  
❌ **Small UI elements** (effect gets lost)  
❌ **Text-heavy areas** (readability issues)

## Button Hierarchy

### Primary Actions
- Black background (`bg-black`)
- White text
- Used for: Search, Buy Now, Apply Filters

### Secondary Actions  
- White background with border (`bg-white border`)
- Gray text
- Used for: Category pills, Cancel, Clear

### Tertiary Actions
- Ghost/transparent
- Used for: Close, Back, Navigation arrows

## Mobile Considerations

### Touch Targets
- Minimum 44x44px for tap areas
- 8px minimum spacing between tappable elements
- Thumb zones: bottom 1/3 of screen most accessible

### Gestures
- **Horizontal scroll**: Category pills, product carousels
- **Vertical scroll**: Main content, filter drawers  
- **Pull to refresh**: Product lists
- **Swipe back**: Navigation (browser default)

### Performance
- Limit `backdrop-blur` usage on mobile
- Use CSS transforms for animations
- Lazy load images below fold

## Accessibility Guidelines

### ARIA Labels
```svelte
<!-- Filter button with count -->
<button aria-label="Open filters, {activeFiltersCount()} active">
  <span aria-hidden="true">Filters</span>
  {#if count > 0}<span class="sr-only">{count} active</span>{/if}
</button>
```

### Color Contrast
- Text: minimum 4.5:1 ratio
- Interactive elements: minimum 3:1 ratio
- Focus indicators: clearly visible

### Screen Readers
- Meaningful headings hierarchy (h1, h2, h3)
- Alt text for product images
- Form labels properly associated

## Error States & Empty States

### No Results Found
```svelte
<div class="text-center py-12">
  <svg class="w-16 h-16 mx-auto text-gray-300 mb-4"><!-- icon --></svg>
  <h3 class="text-lg font-medium text-gray-900 mb-2">No items found</h3>
  <p class="text-gray-600">Try adjusting your filters or search terms</p>
  <button class="mt-4">Clear filters</button>
</div>
```

### Loading States
- Skeleton screens for product grids
- Spinner for search results
- Progress indicators for uploads

## Typography Scale

### Headings
- **h1**: 2xl, 32px, font-bold (page titles)
- **h2**: xl, 20px, font-semibold (section titles)  
- **h3**: lg, 18px, font-medium (card titles)

### Body Text
- **Large**: base, 16px (primary content)
- **Medium**: sm, 14px (secondary content)
- **Small**: xs, 12px (captions, badges)

## Spacing System

### Component Spacing
- **xs**: 4px (tight elements)
- **sm**: 8px (related elements)
- **md**: 16px (section spacing)
- **lg**: 24px (major sections)
- **xl**: 32px (page sections)

### Grid Gaps
- **Mobile**: 12px between cards
- **Desktop**: 16px between cards
- **Carousel**: 8px between items

## Animation Guidelines

### Transition Timing
- **Micro-interactions**: 150ms ease-out
- **Page transitions**: 300ms ease-in-out
- **Hover effects**: 200ms ease

### Transform Effects
```css
/* Scale on hover */
.hover-scale {
  transition: transform 200ms ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}

/* Glass morphism reveal */
.glass-reveal {
  transition: all 300ms ease;
}
```

## Decision Log

### ✅ Resolved Decisions
1. **Search dropdown purpose**: Trending + hierarchical categories (not duplicate pills)
2. **Content labeling**: All sections need clear titles (Promoted, Latest)
3. **Glass morphism**: Only for premium/interactive content
4. **Category navigation**: Pills for quick access, dropdown for discovery

### 🤔 Pending Decisions
- [ ] Trending search data source (manual vs analytics)
- [ ] Section title styling (subtle vs prominent)
- [ ] Mobile carousel indicator style
- [ ] Filter reset behavior (clear all vs individual)

## Implementation Checklist

### New Feature Checklist
- [ ] Mobile-first responsive design
- [ ] Accessibility (ARIA, keyboard navigation)
- [ ] Loading and error states
- [ ] Glass morphism applied consistently
- [ ] Proper semantic HTML structure
- [ ] Touch-friendly interactions (44px minimum)

### Code Review Checklist
- [ ] Follows Svelte 5 runes pattern
- [ ] TypeScript interfaces defined
- [ ] No accessibility violations
- [ ] Performance considerations addressed
- [ ] Matches design system tokens

---

**Last Updated**: 2025-08-14  
**Version**: 1.0  
**Contributors**: Claude Code, User

This document evolves with our UX decisions and should be referenced for all new features and improvements.