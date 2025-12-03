# Vinted-Inspired UX Improvements for Search Page

**Date**: January 2025  
**Inspiration**: [Vinted.co.uk Search Page](https://www.vinted.co.uk/catalog?search_text=nike+trainers)  
**Status**: Proposed Enhancements  

---

## Executive Summary

After analyzing Vinted's search experience through direct observation, this document proposes specific UI/UX improvements to elevate Driplo's search page to match the polish and intuitiveness of leading C2C marketplaces.

**Key Vinted Strengths to Adopt**:
- Horizontal filter pill bar with dropdowns
- Prominent results count ("500+ results")
- Search term displayed as removable chip
- Category quick links above product grid
- Clean product cards with heart icons and buyer protection display

---

## 1. Horizontal Filter Pill Bar ⭐ PRIORITY #1

### What Vinted Does
```
[Category ▼] [Size ▼] [Brand ▼] [Condition ▼] [Colour ▼] [Price ▼] [Material ▼] [Sort by ▼]
```

**Features**:
- Horizontally scrollable on mobile (no wrapping)
- Each pill opens a modal/dropdown
- Visual ▼ indicator shows interactivity
- Active pills change color when filter applied
- Smooth scroll with no visible scrollbar

### Implementation Plan

**Component**: `SearchFilterPillBar.svelte`

```svelte
<script lang="ts">
  export let onCategoryClick: () => void;
  export let onSizeClick: () => void;
  export let onBrandClick: () => void;
  export let onConditionClick: () => void;
  export let onColorClick: () => void;
  export let onPriceClick: () => void;
  export let onSortClick: () => void;
  
  export let activeFilters = {
    category: false,
    size: false,
    brand: false,
    condition: false,
    color: false,
    price: false,
    sort: false
  };
</script>

<div class="filter-pill-bar">
  <button class="filter-pill" class:active={activeFilters.category} on:click={onCategoryClick}>
    Category ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.size} on:click={onSizeClick}>
    Size ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.brand} on:click={onBrandClick}>
    Brand ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.condition} on:click={onConditionClick}>
    Condition ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.color} on:click={onColorClick}>
    Colour ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.price} on:click={onPriceClick}>
    Price ▼
  </button>
  <button class="filter-pill" class:active={activeFilters.sort} on:click={onSortClick}>
    Sort by ▼
  </button>
</div>

<style>
  .filter-pill-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .filter-pill-bar::-webkit-scrollbar {
    display: none;
  }
  
  .filter-pill {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    min-height: 44px;
  }
  
  .filter-pill:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .filter-pill.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1e40af;
  }
</style>
```

**Size Filter Modal** (when pill is clicked):

Shows categorized options:
- Women
- Men  
- Kids
- Home

Then shows specific sizes based on category selection.

---

## 2. Results Header with Count and Search Chip ⭐ PRIORITY #2

### What Vinted Does

```
500+ results
[nike trainers ✕]
Men | Women | Kids | Sports | Outdoor | ...
```

**Features**:
- Large, bold result count
- Search query shown as removable chip
- Category quick links for fast filtering

### Implementation

**Component**: `SearchResultsHeader.svelte`

```svelte
<script lang="ts">
  export let count: number;
  export let searchQuery: string = '';
  export let onClearSearch: () => void;
  export let categories: Array<{ label: string; path: string }> = [];
  
  function formatCount(n: number): string {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    if (n >= 500) return '500+';
    return n.toString();
  }
</script>

<div class="results-header">
  <h1 class="count">{formatCount(count)} results</h1>
  
  {#if searchQuery}
    <button class="search-chip" on:click={onClearSearch}>
      {searchQuery}
      <span class="remove">✕</span>
    </button>
  {/if}
  
  <nav class="category-links">
    {#each categories as cat}
      <a href={cat.path}>{cat.label}</a>
    {/each}
  </nav>
</div>

<style>
  .results-header {
    padding: 1rem;
    background: white;
  }
  
  .count {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
  }
  
  .search-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    font-size: 0.875rem;
    cursor: pointer;
    margin-bottom: 0.75rem;
  }
  
  .search-chip:hover {
    background: #e5e7eb;
  }
  
  .remove {
    font-weight: 600;
  }
  
  .category-links {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .category-links::-webkit-scrollbar {
    display: none;
  }
  
  .category-links a {
    color: #6b7280;
    text-decoration: none;
    white-space: nowrap;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
  }
  
  .category-links a:hover {
    background: #f3f4f6;
    color: #111827;
  }
</style>
```

---

## 3. Enhanced Product Cards ⭐ PRIORITY #3

### What Vinted Does

```
┌─────────────┐
│   Image   ♡ │  ← Heart icon (top-right)
├─────────────┤
│ Nike        │  ← Brand (bold)
│ 7.5 · Good  │  ← Size · Condition
│ £69.99      │  ← Price (large)
│ £74.19 Pro  │  ← With protection
└─────────────┘
```

**Key Features**:
- Square (1:1) image aspect ratio
- Heart icon for favorites (top-right overlay)
- Clean typography hierarchy
- Buyer protection fee shown
- Subtle hover effect (lift + shadow)

### Implementation

Update `packages/ui/src/lib/compositions/cards/ProductCard.svelte`:

```svelte
<script lang="ts">
  import { Heart } from 'lucide-svelte';
  
  export let product: {
    id: string;
    brand: string;
    size: string;
    condition: string;
    price: number;
    protectionFee: number;
    image: string;
    favorited: boolean;
  };
  
  export let onFavorite: (id: string) => void;
  export let onClick: (id: string) => void;
  
  $: total = product.price + product.protectionFee;
</script>

<article class="card">
  <div class="image-container">
    <button class="image-link" on:click={() => onClick(product.id)}>
      <img src={product.image} alt={product.brand} />
    </button>
    
    <button 
      class="favorite" 
      class:active={product.favorited}
      on:click|stopPropagation={() => onFavorite(product.id)}
    >
      <Heart size={20} fill={product.favorited ? 'currentColor' : 'none'} />
    </button>
  </div>
  
  <div class="details">
    <p class="brand">{product.brand}</p>
    <p class="meta">{product.size} · {product.condition}</p>
    <p class="price">£{product.price.toFixed(2)}</p>
    <p class="protection">£{total.toFixed(2)} incl. Buyer Protection</p>
  </div>
</article>

<style>
  .card {
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  
  .image-container {
    position: relative;
    aspect-ratio: 1;
    background: #f3f4f6;
  }
  
  .image-link {
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
  }
  
  .image-link img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .favorite {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 44px;
    height: 44px;
    background: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  }
  
  .favorite:hover {
    transform: scale(1.1);
  }
  
  .favorite.active {
    color: #ef4444;
  }
  
  .details {
    padding: 0.75rem;
  }
  
  .brand {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
  }
  
  .meta {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
  }
  
  .price {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
  }
  
  .protection {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }
</style>
```

---

## 4. Grid Optimization

### Vinted's Approach

- **Mobile**: 2 columns (maximize screen usage)
- **Tablet**: 3-4 columns
- **Desktop**: 5-6 columns
- **Spacing**: Tighter on mobile, more generous on desktop

### Implementation

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
}

@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1536px) {
  .product-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

---

## Implementation Priority

### Week 1: Filter Pill Bar (CRITICAL)
- [ ] Create `SearchFilterPillBar` component
- [ ] Create `FilterPill` base component
- [ ] Implement filter modal system
- [ ] Connect size filter as test case
- [ ] Implement remaining filter modals

### Week 2: Results Header (HIGH)
- [ ] Create `SearchResultsHeader` component
- [ ] Add results count display
- [ ] Add search term chip with remove
- [ ] Implement category quick links
- [ ] Test mobile responsiveness

### Week 3: Product Cards (MEDIUM)
- [ ] Add heart icon to ProductCard
- [ ] Update image aspect ratio to 1:1
- [ ] Add buyer protection fee display
- [ ] Implement hover effects
- [ ] Optimize for mobile touch

### Week 4: Polish & Testing
- [ ] Grid layout optimization
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Bug fixes

---

## Success Metrics

- **Filter Engagement**: >60% of users use filter pills
- **Page Load**: <2s LCP
- **Conversion**: Measure before/after
- **Bounce Rate**: <35%
- **Session Duration**: >3 minutes

---

## Quick Wins (Start Today)

These can be implemented in 1-2 days:

1. **Add results count** (2 hours)
2. **Show search term chip** (2 hours)
3. **Add heart icon to cards** (2 hours)
4. **Show buyer protection fee** (2 hours)
5. **Add hover effects to cards** (1 hour)
6. **Improve grid spacing** (1 hour)

**Total**: ~10 hours

---

## References

- Vinted Search: https://www.vinted.co.uk/catalog?search_text=nike+trainers
- Current Search Page: `apps/web/src/routes/(app)/(shop)/search/+page.svelte`
- ProductCard: `packages/ui/src/lib/compositions/cards/ProductCard.svelte`
- Filter Store: `apps/web/src/lib/stores/product-filter.svelte.ts`

---

**Status**: ✅ Ready for Implementation  
**Estimated Effort**: 3-4 weeks  
**Impact**: High - Significantly improved UX
