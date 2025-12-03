# 🔍 DRIPLO SEARCH PAGE - ULTRATHINK MOBILE-PERFECT REFACTOR PLAN

> **Created:** November 25, 2025  
> **Status:** 🚧 PLANNING COMPLETE - READY FOR IMPLEMENTATION  
> **Target:** Production-Ready, Vinted-Inspired, Mobile-Perfect Search Experience  
> **Design Inspiration:** Vinted, Depop, Poshmark, Grailed  
> **Tech Stack:** SvelteKit 2, Svelte 5, Tailwind CSS v4 (OKLCH tokens), Supabase  

---

## 📋 TABLE OF CONTENTS

1. [Critical Issues Identified](#critical-issues-identified)
2. [Vinted/Marketplace UX Patterns](#vintedmarketplace-ux-patterns)
3. [Design Token Reference](#design-token-reference)
4. [Mobile-Perfect Component Specifications](#mobile-perfect-component-specifications)
5. [Implementation Roadmap](#implementation-roadmap)
6. [File-by-File Changes](#file-by-file-changes)

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### Issue #1: NO PRODUCTS DISPLAYING

**Root Cause Analysis:**

After reviewing the code, the search page loads products via:
1. Server-side: `+page.server.ts` uses `ProductDomainAdapter.searchProductsWithFilters()`
2. The adapter queries products with `status: 'active'`
3. Products are loaded into `filterStore.setProducts()`

**Potential Problems:**
- Database query returns empty results (no active products in DB)
- The `filters.category` is set but no products match
- The `products` derived state in the page isn't updating correctly
- Initial page load happens before `filtersInitialized` is true

**Debug Steps:**
```typescript
// In +page.svelte, add after filterStore.setProducts():
console.log('[Search] Loaded products:', mappedProducts.length);
console.log('[Search] Products data:', data.products?.length);
```

**Fix Required:**
The page shows products when `filtersInitialized && products.length > 0`. If the server returns products but they're not showing, the issue is in the client-side store initialization.

### Issue #2: MOBILE UI/UX NOT OPTIMIZED

| Problem | Impact | Solution |
|---------|--------|----------|
| Desktop-first layout | Poor mobile experience | Mobile-first grid, sticky filters |
| No pull-to-refresh | Users expect native-like behavior | Implement pull-to-refresh |
| Filter drawer too complex | Overwhelming on mobile | Simplify, add visual hierarchy |
| Small touch targets | Hard to tap on mobile | 40-44px minimum |
| No swipe gestures | Missing expected interactions | Add horizontal swipe for filters |
| No haptic feedback | Feels unresponsive | Add tap feedback animations |

### Issue #3: TAILWIND V4 TOKEN INCONSISTENCY

**Current Mixed Usage:**
```svelte
<!-- Bad: Mixing styles -->
bg-[var(--surface-subtle)]  <!-- Missing color: prefix -->
text-[var(--text-secondary)] <!-- Should be text-[color:var(--text-secondary)] -->
border-gray-200             <!-- Hardcoded! -->
```

**Correct V4 Pattern:**
```svelte
bg-[color:var(--surface-subtle)]
text-[color:var(--text-secondary)]
border-[color:var(--border-subtle)]
```

---

## 🎨 VINTED/MARKETPLACE UX PATTERNS

### Vinted Mobile Search Page Structure

```
┌─────────────────────────────────────────┐
│ ← Back        driplo         🔔  👤    │ ← Header
├─────────────────────────────────────────┤
│ 🔍 Search clothes, brands, sellers...  │ ← Search Bar
├─────────────────────────────────────────┤
│ [Category▼] [Size▼] [Brand▼] [Price▼] ⊛│ ← Filter Pills (scroll)
├─────────────────────────────────────────┤
│ 500+ results                    Sort ⇅ │ ← Results Header
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐               │
│ │  Image  │  │  Image  │               │
│ │   ♡    │  │   ♡    │               │
│ ├─────────┤  ├─────────┤               │ ← Product Grid
│ │ Brand   │  │ Brand   │               │   (2 cols mobile)
│ │ M · Good│  │ S · New │               │
│ │ €25.00  │  │ €19.00  │               │
│ └─────────┘  └─────────┘               │
│ ┌─────────┐  ┌─────────┐               │
│ │ ...     │  │ ...     │               │
│ └─────────┘  └─────────┘               │
│                                         │
│         [Loading more...]               │ ← Infinite Scroll
├─────────────────────────────────────────┤
│  🏠   🔍   ➕   💬   👤                │ ← Bottom Nav
└─────────────────────────────────────────┘
```

### Key Vinted UX Elements

1. **Horizontal Filter Pills**
   - Scrollable on mobile
   - Each pill opens a bottom sheet
   - Active state with checkmark
   - "Clear" option per filter

2. **Results Header**
   - Bold count (e.g., "500+ results")
   - Search term as removable chip
   - Sort button (not dropdown)

3. **Product Cards**
   - Square (1:1) aspect ratio
   - Heart icon overlay (top-right)
   - Brand name prominent
   - Size + Condition on one line
   - Bold price
   - No seller chip on search results

4. **Infinite Scroll**
   - No pagination
   - Loading indicator at bottom
   - "Back to top" FAB appears

5. **Filter Bottom Sheet**
   - Full height on mobile
   - Sticky header with count
   - Clear/Apply buttons sticky bottom
   - Checkmark for selected options

---

## 📐 DESIGN TOKEN REFERENCE

### Required Tokens for Search Page

```css
/* Surface Colors */
--surface-base: oklch(1.0 0 0);           /* White background */
--surface-subtle: oklch(0.98 0 0);        /* Light gray background */
--surface-muted: oklch(0.96 0 0);         /* Disabled/skeleton */
--surface-elevated: oklch(1.0 0 0);       /* Cards, modals */
--surface-inverse: oklch(0.20 0 0);       /* Dark buttons */

/* Text Colors */
--text-primary: oklch(0.20 0 0);          /* Main text */
--text-secondary: oklch(0.45 0 0);        /* Secondary text */
--text-tertiary: oklch(0.60 0 0);         /* Placeholder */
--text-inverse: oklch(0.95 0 0);          /* Text on dark bg */

/* Border Colors */
--border-subtle: oklch(0.92 0 0);         /* Light borders */
--border-default: oklch(0.85 0 0);        /* Standard borders */
--border-emphasis: oklch(0.70 0 0);       /* Emphasized borders */

/* Brand Colors */
--brand-primary: oklch(0.52 0.15 240);    /* Primary actions */

/* State Colors */
--state-focus: oklch(0.52 0.15 240);      /* Focus rings */
--state-error: oklch(0.55 0.22 25);       /* Error states */

/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;

/* Touch Targets */
--touch-primary: 44px;    /* Primary buttons */
--touch-standard: 40px;   /* Standard interactive */
--touch-compact: 36px;    /* Compact contexts */

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;    /* Pills */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Product Card Specific */
--product-card-aspect: 1 / 1;             /* Square images */
--product-card-radius: var(--radius-md);
--product-card-shadow-hover: var(--shadow-lg);
```

---

## 📱 MOBILE-PERFECT COMPONENT SPECIFICATIONS

### Component 1: SearchHeader (New)

**Purpose:** Sticky search bar with filter access

```svelte
<!-- SearchHeader.svelte -->
<header class="
  sticky top-0 z-40 
  bg-[color:var(--surface-base)] 
  border-b border-[color:var(--border-subtle)]
  safe-area-top
">
  <!-- Search Input Row -->
  <div class="flex items-center gap-2 px-3 py-2">
    <!-- Back button (mobile only) -->
    <button 
      class="sm:hidden h-[var(--touch-standard)] w-[var(--touch-standard)] 
             flex items-center justify-center rounded-full
             hover:bg-[color:var(--surface-subtle)]
             active:bg-[color:var(--surface-muted)]"
      onclick={() => history.back()}
      aria-label="Go back"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    
    <!-- Search Input -->
    <div class="flex-1 relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-tertiary)]" />
      <input
        type="search"
        placeholder="Search clothes, brands, sellers..."
        value={searchQuery}
        oninput={(e) => handleSearch(e.currentTarget.value)}
        class="
          w-full h-[var(--touch-standard)] pl-10 pr-4
          bg-[color:var(--surface-subtle)] 
          border border-[color:var(--border-subtle)]
          rounded-[var(--radius-full)]
          text-sm text-[color:var(--text-primary)]
          placeholder:text-[color:var(--text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-primary)]
          focus:border-transparent
        "
      />
      {#if searchQuery}
        <button
          onclick={() => { searchQuery = ''; handleSearch(''); }}
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1
                 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]"
          aria-label="Clear search"
        >
          <X class="w-4 h-4" />
        </button>
      {/if}
    </div>
    
    <!-- Filter Button (mobile only) -->
    <button 
      onclick={() => showFilterDrawer = true}
      class="sm:hidden h-[var(--touch-standard)] w-[var(--touch-standard)]
             flex items-center justify-center rounded-full
             bg-[color:var(--surface-subtle)]
             border border-[color:var(--border-default)]
             {activeFiltersCount > 0 ? 'border-[color:var(--brand-primary)]' : ''}"
      aria-label="Filters"
    >
      <SlidersHorizontal class="w-4 h-4" />
      {#if activeFiltersCount > 0}
        <span class="
          absolute -top-1 -right-1 
          min-w-[18px] h-[18px] 
          bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)]
          text-xs font-medium rounded-full
          flex items-center justify-center
        ">
          {activeFiltersCount}
        </span>
      {/if}
    </button>
  </div>
</header>
```

### Component 2: FilterPillBar (Refactored)

**Purpose:** Horizontal scrolling filter pills

```svelte
<!-- FilterPillBar.svelte -->
<nav 
  class="
    flex gap-2 overflow-x-auto 
    px-3 py-2 
    bg-[color:var(--surface-base)]
    border-b border-[color:var(--border-subtle)]
    no-scrollbar
  "
  aria-label="Filter options"
>
  <!-- Category Pill -->
  <FilterPill 
    label="Category"
    value={filters.category}
    hasValue={!!filters.category && filters.category !== 'all'}
    onclick={() => openFilter('category')}
  />
  
  <!-- Size Pill -->
  <FilterPill 
    label="Size"
    value={filters.size}
    hasValue={!!filters.size && filters.size !== 'all'}
    onclick={() => openFilter('size')}
  />
  
  <!-- Brand Pill -->
  <FilterPill 
    label="Brand"
    value={filters.brand}
    hasValue={!!filters.brand && filters.brand !== 'all'}
    onclick={() => openFilter('brand')}
  />
  
  <!-- Condition Pill -->
  <FilterPill 
    label="Condition"
    value={translateCondition(filters.condition)}
    hasValue={!!filters.condition && filters.condition !== 'all'}
    onclick={() => openFilter('condition')}
  />
  
  <!-- Price Pill -->
  <FilterPill 
    label="Price"
    value={formatPriceRange(filters.price_min, filters.price_max)}
    hasValue={!!(filters.price_min || filters.price_max)}
    onclick={() => openFilter('price')}
  />
  
  <!-- Sort Pill -->
  <FilterPill 
    label="Sort"
    value={translateSort(filters.sort)}
    hasValue={filters.sort && filters.sort !== 'relevance'}
    onclick={() => openFilter('sort')}
    variant="sort"
  />
</nav>

<style>
  .no-scrollbar {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
```

### Component 3: FilterPill (New)

**Purpose:** Individual filter pill button

```svelte
<!-- FilterPill.svelte -->
<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  
  interface Props {
    label: string;
    value?: string | null;
    hasValue?: boolean;
    onclick: () => void;
    variant?: 'default' | 'sort';
  }
  
  let { label, value, hasValue = false, onclick, variant = 'default' }: Props = $props();
</script>

<button
  type="button"
  {onclick}
  class="
    flex items-center gap-1.5
    h-[var(--touch-compact)] px-3
    bg-[color:var(--surface-base)]
    border rounded-[var(--radius-full)]
    text-sm font-medium whitespace-nowrap
    transition-colors duration-150
    active:scale-[0.98]
    {hasValue 
      ? 'border-[color:var(--surface-inverse)] text-[color:var(--text-primary)]' 
      : 'border-[color:var(--border-default)] text-[color:var(--text-secondary)]'
    }
  "
  aria-expanded="false"
  aria-haspopup="dialog"
>
  {#if hasValue}
    <Check class="w-3.5 h-3.5 text-[color:var(--brand-primary)]" />
    <span class="max-w-[80px] truncate">{value || label}</span>
  {:else}
    <span>{label}</span>
  {/if}
  <ChevronDown class="w-3.5 h-3.5 flex-shrink-0 text-[color:var(--text-tertiary)]" />
</button>
```

### Component 4: ResultsHeader (Refactored)

**Purpose:** Show result count and active search term

```svelte
<!-- ResultsHeader.svelte -->
<div class="
  flex items-center justify-between
  px-3 py-2
  bg-[color:var(--surface-base)]
">
  <!-- Left: Count + Search Chip -->
  <div class="flex items-center gap-2 min-w-0">
    <span class="text-lg font-bold text-[color:var(--text-primary)]">
      {#if totalResults >= 500}
        500+
      {:else}
        {totalResults}
      {/if}
      <span class="font-normal text-[color:var(--text-secondary)]">results</span>
    </span>
    
    {#if searchQuery}
      <button
        onclick={() => { searchQuery = ''; handleSearch(''); }}
        class="
          flex items-center gap-1
          px-2.5 py-1
          bg-[color:var(--surface-muted)]
          rounded-[var(--radius-full)]
          text-sm text-[color:var(--text-primary)]
          hover:bg-[color:var(--surface-subtle)]
        "
      >
        <span class="max-w-[100px] truncate">{searchQuery}</span>
        <X class="w-3.5 h-3.5" />
      </button>
    {/if}
  </div>
  
  <!-- Right: Sort (Desktop) -->
  <div class="hidden sm:flex items-center gap-2">
    <select
      value={filters.sort || 'relevance'}
      onchange={(e) => updateSort(e.currentTarget.value)}
      class="
        h-[var(--touch-compact)] px-3 pr-8
        bg-[color:var(--surface-base)]
        border border-[color:var(--border-default)]
        rounded-[var(--radius-md)]
        text-sm text-[color:var(--text-primary)]
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-primary)]
      "
    >
      <option value="relevance">Best match</option>
      <option value="newest">Newest first</option>
      <option value="price-low">Price: Low to high</option>
      <option value="price-high">Price: High to low</option>
    </select>
  </div>
</div>
```

### Component 5: ProductGrid (Refactored)

**Purpose:** Mobile-optimized responsive product grid

```svelte
<!-- In +page.svelte -->
<section 
  class="
    px-2 sm:px-4 
    pb-[calc(var(--space-20)+env(safe-area-inset-bottom))] 
    sm:pb-8
  "
  aria-label="Search results"
>
  {#if products.length > 0}
    <ul 
      role="list"
      class="
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        gap-2 sm:gap-3 lg:gap-4
      "
    >
      {#each products as product (product.id)}
        <li>
          <ProductCard 
            {product}
            onclick={() => goto(getProductUrl(product))}
            onFavorite={handleFavorite}
            favorited={favoritesStore.isFavorite(product.id)}
            variant="compact"
            translations={productTranslations}
          />
        </li>
      {/each}
    </ul>
    
    <!-- Infinite Scroll Trigger -->
    {#if hasMore}
      <div 
        bind:this={loadMoreTrigger}
        class="flex justify-center py-8"
        aria-hidden="true"
      >
        {#if loadingMore}
          <div class="
            w-8 h-8 
            border-2 border-[color:var(--brand-primary)] 
            border-t-transparent 
            rounded-full animate-spin
          " />
        {:else}
          <span class="text-sm text-[color:var(--text-tertiary)]">
            Scroll for more
          </span>
        {/if}
      </div>
    {/if}
  {:else if filtersInitialized}
    <!-- Empty State -->
    <EmptySearchState 
      {searchQuery}
      {activeFiltersCount}
      onClearFilters={() => filterStore.resetFilters()}
      onSuggestionClick={(query) => handleSearch(query)}
    />
  {:else}
    <!-- Loading Skeleton -->
    <ul role="list" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {#each Array(12) as _, i (i)}
        <li>
          <ProductCardSkeleton />
        </li>
      {/each}
    </ul>
  {/if}
</section>
```

### Component 6: EmptySearchState (New)

**Purpose:** Engaging empty state with suggestions

```svelte
<!-- EmptySearchState.svelte -->
<script lang="ts">
  import { Search, Sparkles } from 'lucide-svelte';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    searchQuery?: string;
    activeFiltersCount?: number;
    onClearFilters: () => void;
    onSuggestionClick: (query: string) => void;
  }
  
  let { searchQuery, activeFiltersCount = 0, onClearFilters, onSuggestionClick }: Props = $props();
  
  const suggestions = [
    { query: 'sneakers', label: '👟 Sneakers' },
    { query: 'vintage jacket', label: '🧥 Vintage Jackets' },
    { query: 'designer bags', label: '👜 Designer Bags' },
    { query: 'summer dress', label: '👗 Summer Dresses' },
  ];
</script>

<div class="
  flex flex-col items-center justify-center 
  py-16 px-4 
  text-center
  animate-in fade-in duration-500
">
  <!-- Icon -->
  <div class="
    w-20 h-20 mb-6
    bg-[color:var(--surface-muted)]
    rounded-full
    flex items-center justify-center
  ">
    <Search class="w-10 h-10 text-[color:var(--text-tertiary)]" />
  </div>
  
  <!-- Message -->
  <h2 class="text-xl font-bold text-[color:var(--text-primary)] mb-2">
    {#if searchQuery}
      No results for "{searchQuery}"
    {:else}
      No items found
    {/if}
  </h2>
  
  <p class="text-base text-[color:var(--text-secondary)] mb-6 max-w-sm">
    {#if activeFiltersCount > 0}
      Try adjusting your filters to see more results
    {:else}
      Try a different search term
    {/if}
  </p>
  
  <!-- Clear Filters Button -->
  {#if activeFiltersCount > 0}
    <button
      onclick={onClearFilters}
      class="
        mb-8 px-6 py-2.5
        border border-[color:var(--border-default)]
        rounded-[var(--radius-md)]
        text-sm font-medium text-[color:var(--text-primary)]
        hover:bg-[color:var(--surface-subtle)]
        active:scale-[0.98]
        transition-all
      "
    >
      Clear all filters
    </button>
  {/if}
  
  <!-- Suggestions -->
  <div class="w-full max-w-md">
    <p class="text-sm font-medium text-[color:var(--text-secondary)] mb-3 flex items-center justify-center gap-2">
      <Sparkles class="w-4 h-4" />
      Popular searches
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      {#each suggestions as suggestion}
        <button
          onclick={() => onSuggestionClick(suggestion.query)}
          class="
            px-4 py-2
            bg-[color:var(--surface-base)]
            border border-[color:var(--border-default)]
            rounded-[var(--radius-full)]
            text-sm font-medium text-[color:var(--text-primary)]
            hover:bg-[color:var(--surface-subtle)]
            hover:border-[color:var(--brand-primary)]
            active:scale-[0.98]
            transition-all
          "
        >
          {suggestion.label}
        </button>
      {/each}
    </div>
  </div>
</div>
```

### Component 7: FilterBottomSheet (Refactored)

**Purpose:** Mobile-optimized full-screen filter experience

```svelte
<!-- FilterBottomSheet.svelte - Mobile-first filter UI -->
<script lang="ts">
  import * as Sheet from '../../primitives/sheet';
  import { X, Check, ChevronRight } from 'lucide-svelte';
  
  // ... props and state
</script>

<Sheet.Root bind:open={isOpen}>
  <Sheet.Content 
    side="bottom"
    class="
      h-[90vh] sm:h-full sm:max-w-[400px]
      flex flex-col
      bg-[color:var(--surface-base)]
      rounded-t-[var(--radius-xl)] sm:rounded-none
    "
  >
    <!-- Mobile Handle -->
    <div class="sm:hidden flex justify-center pt-2 pb-1">
      <div class="w-10 h-1 rounded-full bg-[color:var(--text-tertiary)]/30" />
    </div>
    
    <!-- Header -->
    <div class="
      flex items-center justify-between 
      px-4 py-3 
      border-b border-[color:var(--border-subtle)]
    ">
      <div class="flex items-center gap-2">
        <Sheet.Title class="text-base font-semibold text-[color:var(--text-primary)]">
          Filters
        </Sheet.Title>
        {#if activeFilterCount > 0}
          <span class="
            px-2 py-0.5
            bg-[color:var(--surface-inverse)]
            text-[color:var(--text-inverse)]
            text-xs font-medium
            rounded-[var(--radius-sm)]
          ">
            {activeFilterCount}
          </span>
        {/if}
      </div>
      
      <div class="flex items-center gap-2">
        {#if activeFilterCount > 0}
          <button
            onclick={handleClear}
            class="text-sm font-medium text-[color:var(--text-secondary)] px-2 py-1"
          >
            Clear all
          </button>
        {/if}
        <button
          onclick={() => isOpen = false}
          class="
            h-[var(--touch-standard)] w-[var(--touch-standard)]
            flex items-center justify-center
            rounded-full
            hover:bg-[color:var(--surface-subtle)]
          "
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <!-- Category Section -->
      <FilterSection title="Category">
        <CategorySelector 
          categories={categoryTree}
          selectedCategory={pendingFilters.category}
          onSelect={(slug) => updateFilter('category', slug)}
        />
      </FilterSection>
      
      <!-- Size Section -->
      <FilterSection title="Size">
        <div class="flex flex-wrap gap-2">
          {#each sizes as size}
            <FilterChip 
              label={size}
              selected={pendingFilters.size === size}
              onclick={() => toggleFilter('size', size)}
            />
          {/each}
        </div>
      </FilterSection>
      
      <!-- Brand Section -->
      <FilterSection title="Brand">
        <BrandSearchableList 
          brands={availableBrands}
          selectedBrand={pendingFilters.brand}
          onSelect={(brand) => updateFilter('brand', brand)}
        />
      </FilterSection>
      
      <!-- Condition Section -->
      <FilterSection title="Condition">
        <div class="flex flex-wrap gap-2">
          {#each conditions as condition}
            <FilterChip 
              label="{condition.emoji} {condition.label}"
              selected={pendingFilters.condition === condition.value}
              onclick={() => toggleFilter('condition', condition.value)}
            />
          {/each}
        </div>
      </FilterSection>
      
      <!-- Price Section -->
      <FilterSection title="Price">
        <PriceRangeInputs 
          minPrice={pendingFilters.minPrice}
          maxPrice={pendingFilters.maxPrice}
          onMinChange={(v) => updateFilter('minPrice', v)}
          onMaxChange={(v) => updateFilter('maxPrice', v)}
        />
        <div class="flex flex-wrap gap-2 mt-3">
          {#each pricePresets as preset}
            <FilterChip 
              label={preset.label}
              selected={isPresetSelected(preset)}
              onclick={() => selectPreset(preset)}
            />
          {/each}
        </div>
      </FilterSection>
      
      <!-- Sort Section (Mobile) -->
      <FilterSection title="Sort by" class="sm:hidden">
        <div class="space-y-1">
          {#each sortOptions as option}
            <button
              onclick={() => updateFilter('sort', option.value)}
              class="
                w-full flex items-center justify-between
                h-[var(--touch-standard)] px-3
                rounded-[var(--radius-md)]
                text-left text-sm
                {pendingFilters.sort === option.value 
                  ? 'bg-[color:var(--surface-subtle)] text-[color:var(--text-primary)] font-medium' 
                  : 'text-[color:var(--text-secondary)]'}
              "
            >
              <span>{option.label}</span>
              {#if pendingFilters.sort === option.value}
                <Check class="w-4 h-4 text-[color:var(--brand-primary)]" />
              {/if}
            </button>
          {/each}
        </div>
      </FilterSection>
    </div>
    
    <!-- Footer -->
    <div class="
      flex-shrink-0
      px-4 py-3
      border-t border-[color:var(--border-subtle)]
      bg-[color:var(--surface-base)]
      pb-[calc(var(--space-3)+env(safe-area-inset-bottom))]
    ">
      <button
        onclick={handleApply}
        class="
          w-full h-[var(--touch-primary)]
          bg-[color:var(--surface-inverse)]
          text-[color:var(--text-inverse)]
          rounded-[var(--radius-md)]
          text-sm font-semibold
          active:opacity-90
          transition-opacity
        "
      >
        {#if previewCount > 0}
          Show {previewCount.toLocaleString()} results
        {:else}
          Apply filters
        {/if}
      </button>
    </div>
  </Sheet.Content>
</Sheet.Root>
```

---

## 🗺️ IMPLEMENTATION ROADMAP

### Phase 1: Fix Product Display (CRITICAL - Day 1)

1. **Debug why products aren't showing**
   - Add console logging to trace data flow
   - Verify server returns products
   - Check client-side store initialization

2. **Verify database has active products**
   - Check `products` table for `status = 'active'`
   - Ensure `is_active = true`

3. **Fix any data transformation issues**
   - Ensure `mapProductForStore` correctly maps all fields
   - Verify images array is populated

### Phase 2: Mobile UI Foundation (Days 2-3)

1. **Update search page layout**
   - Remove desktop-first layout
   - Implement mobile-first grid
   - Add proper spacing with tokens

2. **Implement sticky search header**
   - Back button on mobile
   - Search input with clear button
   - Filter button with count badge

3. **Add filter pill bar**
   - Horizontal scroll
   - Active state styling
   - Touch-optimized sizing

### Phase 3: Filter System Refactor (Days 4-5)

1. **Refactor FilterDrawer**
   - Full-height on mobile
   - Sticky header/footer
   - Proper safe area handling

2. **Add filter sections**
   - Category tree navigation
   - Searchable brand list
   - Price presets + custom inputs
   - Condition chips

3. **Connect filter state**
   - URL sync
   - Preview count
   - Apply/Clear actions

### Phase 4: Product Grid & Cards (Days 6-7)

1. **Optimize product grid**
   - 2 columns on mobile
   - Proper gap tokens
   - Safe area bottom padding

2. **Enhance ProductCard**
   - Square aspect ratio
   - Favorite button overlay
   - Compact info display
   - Touch feedback

3. **Add infinite scroll**
   - Intersection observer
   - Loading indicator
   - "Back to top" FAB

### Phase 5: Empty & Loading States (Day 8)

1. **Create empty state component**
   - Search icon/illustration
   - Context-aware messaging
   - Clear filters button
   - Popular suggestions

2. **Enhance loading skeletons**
   - Match product card size
   - Proper shimmer animation
   - Responsive count

### Phase 6: Polish & A11y (Days 9-10)

1. **Accessibility audit**
   - Screen reader testing
   - Keyboard navigation
   - Focus management
   - ARIA labels

2. **Performance optimization**
   - Lazy load images
   - Virtualize long lists
   - Debounce search input

3. **Token consistency audit**
   - Remove all hardcoded colors
   - Verify v4 syntax
   - Test dark mode

---

## 📁 FILE-BY-FILE CHANGES

### `apps/web/src/routes/(app)/(shop)/search/+page.svelte`

**Changes Required:**
1. Replace MainPageSearchBar with SearchHeader
2. Add FilterPillBar below header
3. Replace product grid markup with mobile-first layout
4. Add ResultsHeader component
5. Update empty state with EmptySearchState
6. Fix token usage throughout
7. Add pull-to-refresh support
8. Improve infinite scroll UX

### `apps/web/src/routes/(app)/(shop)/search/+page.server.ts`

**Changes Required:**
1. Add debug logging for product fetch
2. Return more detailed error messages
3. Ensure proper product data transformation
4. Add server-side filter validation

### `packages/ui/src/lib/compositions/product/FilterDrawer.svelte`

**Changes Required:**
1. Full refactor for mobile-first design
2. Implement category tree navigation
3. Add searchable brand list
4. Improve touch targets to 40px+
5. Add price presets
6. Fix all hardcoded colors

### `packages/ui/src/lib/compositions/cards/ProductCard.svelte`

**Changes Required:**
1. Add `variant="compact"` prop for search results
2. Square (1:1) image aspect ratio
3. Move favorite button to image overlay
4. Simplify info display (brand, size·condition, price)
5. Add tap feedback animation
6. Fix token usage

### `packages/ui/src/lib/compositions/search/` (Multiple files)

**Files to update:**
- `FilterBar.svelte` → Refactor to `FilterPillBar.svelte`
- `SearchResultsHeader.svelte` → Simplify to `ResultsHeader.svelte`
- `BrowseByType.svelte` → Update tokens
- `CategorySidebar.svelte` → Update tokens, improve a11y

### New Components to Create:

```
packages/ui/src/lib/compositions/search/
├── SearchHeader.svelte         (NEW)
├── FilterPillBar.svelte        (REFACTORED)
├── FilterPill.svelte           (NEW)
├── ResultsHeader.svelte        (REFACTORED)
├── EmptySearchState.svelte     (NEW)
├── FilterBottomSheet.svelte    (REFACTORED)
└── FilterSection.svelte        (NEW)
```

---

## ✅ SUCCESS METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Products displaying | 0 | All active products |
| Mobile touch targets | Mixed | 40px+ minimum |
| Hardcoded colors | 50+ | 0 |
| Mobile LCP | Unknown | <2.5s |
| Lighthouse Accessibility | Unknown | >90 |
| Filter drawer usability | Poor | Excellent |
| Infinite scroll | Working | Smooth |

---

## 🧹 CLEANUP CHECKLIST

After implementation:
- [ ] Remove deprecated FilterBar.svelte
- [ ] Remove unused SearchResultsHeader.svelte props
- [ ] Remove virtualCategories if still present
- [ ] Remove all console.log statements
- [ ] Run `pnpm --filter web check`
- [ ] Run `pnpm --filter web build`
- [ ] Test on actual mobile device
- [ ] Test in dark mode
- [ ] Delete this planning document

---

*Document created for the Driplo development team. Ready for implementation.*
