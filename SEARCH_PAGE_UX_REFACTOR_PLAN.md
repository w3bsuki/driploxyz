# 🛍️ /search Page UX Refactor Plan
## Complete Resale Marketplace Search Experience

**Goal**: Create an optimal clothing resale marketplace search experience that prioritizes:
- **Speed**: Quick category navigation (L1→L2→L3 hierarchy)
- **Discovery**: Brand-first shopping for fashion enthusiasts
- **Filtering**: Condition, size, price filters specific to secondhand clothing
- **Mobile-first**: Thumb-friendly interactions, bottom sheets, native feel

---

## 🎯 Core UX Principles

### 1. **Resale-First Filtering**
Unlike traditional e-commerce, resale shoppers care about:
- **Brand** (often more than category)
- **Condition** (new with tags → fair wear)
- **Price range** (bargain hunting vs. premium pieces)
- **Authenticity** (verified sellers, ratings)

### 2. **Category Hierarchy Navigation**
```
LEVEL 1: Gender/Audience → LEVEL 2: Type → LEVEL 3: Specific
  Men                       Shoes             Sneakers
  Women                     Clothing          Dresses
  Kids                      Bags              Backpacks
  Unisex                    Accessories       Watches
```

### 3. **Progressive Disclosure**
- Start simple (search bar + quick categories)
- Reveal filters as needed (drawer/dropdown)
- Persist user preferences (sticky filters)

---

## 📐 Proposed Layout Architecture

### **Desktop (≥768px)**
```
┌────────────────────────────────────────────────────────────┐
│ [🔍 Search Bar] [Browse ▾] [Filters ☰] [Sort ▾] [👤 Profile]│ ← Sticky header
├────────────────────────────────────────────────────────────┤
│ 🏷️ Men  👗 Women  👶 Kids  🌍 Unisex  │ 🏷️ Brand  📏 Size │ ← Quick pills
├────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Product  │ │ Product  │ │ Product  │ │ Product  │       │
│ │   Card   │ │   Card   │ │   Card   │ │   Card   │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│ [Load More] ← Infinite scroll + manual trigger             │
└────────────────────────────────────────────────────────────┘
```

### **Mobile (<768px)**
```
┌──────────────────────────────────┐
│ [🔍 Search...        ] [☰]       │ ← Minimal sticky bar
├──────────────────────────────────┤
│ 🏷️ Men 👗 Women 👶 Kids → (scroll)│ ← Horizontal scroll pills
├──────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐        │
│ │ Product  │ │ Product  │        │
│ │   Card   │ │   Card   │        │
│ └──────────┘ └──────────┘        │
│                                   │
│ [⬆ Load More]                    │
├──────────────────────────────────┤
│ 🏠 🔍 ➕ 💬 👤  ← Bottom nav      │
└──────────────────────────────────┘
```

---

## 🧩 Component Breakdown

### 1. **SearchBar Component** (New: `SearchBarCompact.svelte`)

**Features**:
- Clean input with smart autocomplete
- **Browse dropdown** (category L1→L2→L3 tree)
- Filter count badge
- Mobile: collapses to icon + pill

**Props**:
```typescript
interface SearchBarCompactProps {
  searchValue: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  filterCount?: number; // Active filter badge
  categoryTree: CategoryTree; // For Browse dropdown
  onCategorySelect: (path: CategoryPath) => void;
}
```

**Interactions**:
- Type → instant autocomplete suggestions
- Click "Browse" → category tree popover (desktop) / bottom sheet (mobile)
- Navigate: Men → Clothing → T-Shirts (click or arrow keys)

---

### 2. **FilterDrawer Component** (New: `FilterDrawer.svelte`)

**Mobile**: Bottom sheet (slide up from bottom)
**Desktop**: Right-side drawer (slide in from right) OR popover below filter button

**Filter Sections** (Order by importance for resale):
```typescript
const filterSections = [
  {
    key: 'brand',
    label: 'Brand',
    type: 'search-select', // Searchable brand list
    featured: ['Nike', 'Adidas', 'Zara', 'H&M'], // Quick picks
    showAll: true // "View all brands" expandable
  },
  {
    key: 'condition',
    label: 'Condition',
    type: 'pills',
    options: [
      { value: 'brand_new_with_tags', label: 'New with Tags', emoji: '🏷️' },
      { value: 'like_new', label: 'Like New', emoji: '💎' },
      { value: 'good', label: 'Good', emoji: '👍' },
      { value: 'fair', label: 'Fair', emoji: '👌' }
    ]
  },
  {
    key: 'price',
    label: 'Price Range',
    type: 'range-slider', // Dual-thumb slider
    min: 0,
    max: 500,
    presets: ['Under $25', '$25-$50', '$50-$100', '$100+']
  },
  {
    key: 'size',
    label: 'Size',
    type: 'pills',
    dynamic: true, // Changes based on category (XS-XL vs. shoe sizes)
  },
  {
    key: 'sort',
    label: 'Sort By',
    type: 'radio',
    options: [
      { value: 'relevance', label: 'Best Match' },
      { value: 'newest', label: 'Newest First' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' }
    ]
  }
];
```

**Footer Actions**:
```
┌────────────────────────────────────┐
│ [Clear All] [Apply (1,234 items)] │ ← Sticky footer
└────────────────────────────────────┘
```

---

### 3. **CategoryBrowseMenu Component** (New: `CategoryBrowseMenu.svelte`)

**Purpose**: Replace current mega-menu with focused 3-level drill-down

**Desktop Experience**:
```
┌─────────────────────────────────────────────┐
│ Browse Categories                      [×]  │
├─────────────┬──────────────┬────────────────┤
│ 🏷️ Men     │ 👕 Clothing │ 👔 T-Shirts    │
│ 👗 Women   │ 👟 Shoes    │ 👗 Dresses     │
│ 👶 Kids    │ 👜 Bags     │ 🧥 Outerwear   │
│ 🌍 Unisex  │ 💍 Accessories│ 👖 Jeans     │
└─────────────┴──────────────┴────────────────┘
   LEVEL 1       LEVEL 2         LEVEL 3
   (Gender)      (Type)          (Specific)
```

**Mobile Experience** (Bottom Sheet):
```
┌──────────────────────────────────┐
│ < Back        Men                │ ← Header with breadcrumb
├──────────────────────────────────┤
│ 👕 Clothing               →      │ ← Tap to drill down
│ 👟 Shoes                  →      │
│ 👜 Bags                   →      │
│ 💍 Accessories            →      │
└──────────────────────────────────┘
```

**Interaction Flow**:
1. User taps "Browse" in search bar
2. See L1 categories (Men/Women/Kids/Unisex)
3. Select "Men" → slides to L2 (Clothing/Shoes/Bags)
4. Select "Shoes" → slides to L3 (Sneakers/Boots/Loafers)
5. Select "Sneakers" → close menu, apply filter, update results

---

### 4. **AppliedFilterPills Component** (Enhanced)

**Current**: Basic pills showing active filters
**New**: Animated pills with remove icons + quick edit

```
┌────────────────────────────────────────────────────┐
│ [👔 Men ×] [👟 Sneakers ×] [💎 Like New ×] [Clear] │
│                                                     │
│ 1,234 items • Tap any pill to edit                │
└────────────────────────────────────────────────────┘
```

**Features**:
- Click pill → opens relevant filter section (e.g., "Like New" → condition drawer)
- Animated enter/exit (slide in from left, fade out on remove)
- Max 4 visible on mobile, "3 more..." expandable

---

## 🎨 Visual Design Tokens (Tailwind v4)

### Search Bar States
```css
/* Idle */
--search-bar-bg: var(--surface-base);
--search-bar-border: var(--border-subtle);

/* Focus */
--search-bar-bg-focus: var(--surface-emphasis);
--search-bar-border-focus: var(--brand-primary);
--search-bar-shadow-focus: 0 0 0 3px oklch(from var(--brand-primary) l c h / 0.1);

/* With Results */
--search-bar-dropdown-bg: var(--surface-base);
--search-bar-dropdown-shadow: var(--shadow-lg);
```

### Filter Drawer
```css
--drawer-bg: var(--surface-base);
--drawer-backdrop: oklch(0 0 0 / 0.4);
--drawer-width-mobile: 100%; /* Full width bottom sheet */
--drawer-width-desktop: 420px; /* Fixed right sidebar */
--drawer-animation: cubic-bezier(0.32, 0.72, 0, 1); /* iOS-like spring */
```

### Category Pills
```css
--pill-bg-inactive: var(--surface-subtle);
--pill-bg-active: var(--brand-primary);
--pill-text-inactive: var(--text-secondary);
--pill-text-active: var(--text-inverse);
--pill-border-radius: var(--radius-full); /* Fully rounded */
```

---

## 🚀 Implementation Phases

### **Phase 1: Fix Immediate Bugs** ✅ DONE
- [x] Fix `bind:value={undefined}` error (add `color` to FilterState)
- [x] Ensure all filter sections have valid default values
- [x] Verify router initialization guard works

### **Phase 2: Simplify SearchBar** (Current Task)
**Goal**: Clean, minimal search bar like main page but with Browse + Filter buttons

**Tasks**:
1. Create `SearchBarSimple.svelte`:
   - Clean input (no embedded tabs/scopes)
   - Left: Search icon + input
   - Right: [Browse ▾] [Filters (2)]
   - Autocomplete dropdown (products only, no category tabs inside)

2. Remove complexity from `SearchPageSearchBar.svelte`:
   - No embedded Products/Brands/Sellers tabs inside search bar
   - Move category browsing to dedicated dropdown/drawer
   - Keep only search input + action buttons

**Before (Current - Broken)**:
```
┌────────────────────────────────────────────────┐
│ [Browse ▾] [🔍 Search] [🛍️ Products|🏷️Brands] │ ← Too crowded
└────────────────────────────────────────────────┘
```

**After (Phase 2 - Clean)**:
```
┌────────────────────────────────────────────────┐
│ [🔍 Search men's sneakers...] [Browse ▾] [☰ 2]│ ← Simple & clear
└────────────────────────────────────────────────┘
```

### **Phase 3: Category Browse Menu**
**Tasks**:
1. Build `CategoryBrowseMenu.svelte` (3-column drill-down for desktop)
2. Build `CategoryBrowseSheet.svelte` (slide-in navigation for mobile)
3. Wire up category selection to filter store
4. Add breadcrumb navigation in menu header

**Key Features**:
- Arrow key navigation (up/down within column, left/right between levels)
- Visual preview on hover (show subcategories before click)
- Product count per category
- Responsive collapse to mobile sheet

### **Phase 4: Filter Drawer/Popover**
**Tasks**:
1. Create `FilterDrawer.svelte` with section system
2. Build specialized filter widgets:
   - `BrandSearchSelect.svelte` (searchable brand list)
   - `ConditionPills.svelte` (emoji + label pills)
   - `PriceRangeSlider.svelte` (dual-thumb slider with presets)
   - `SizePills.svelte` (dynamic sizing based on category)

3. Implement preview count ("Filters (1,234 items)" footer)
4. Add animation/transitions (spring for mobile sheet, fade for desktop)

### **Phase 5: Polish & Performance**
**Tasks**:
1. Add filter persistence (localStorage + URL sync)
2. Optimize rendering (virtualize category tree if >100 items)
3. Add keyboard shortcuts (/ to focus search, Esc to close)
4. Implement analytics tracking (filter usage, category clicks)
5. A/B test: Drawer vs. Popover on desktop

---

## 📊 Success Metrics

### User Experience
- **Time to First Filter**: <3 seconds (from landing to applying first filter)
- **Category Discovery**: >40% of users explore L2/L3 categories
- **Filter Adoption**: >60% of sessions use at least 1 filter
- **Mobile Usability**: >4.5/5 rating on thumb reachability

### Technical Performance
- **Search Input Responsiveness**: <50ms debounce
- **Filter Apply Speed**: <100ms (client-side filtering)
- **Layout Shift**: 0 (CLS = 0 on filter toggle)
- **Bundle Size**: <15KB for search UI components (tree-shaken)

### Business Impact
- **Conversion Rate**: +15% (filtered searches → purchases)
- **Average Session Duration**: +25% (better discovery)
- **Bounce Rate**: -20% (clearer navigation)

---

## 🎯 Quick Wins (Do First)

### 1. **Remove Broken UI Elements** (1 hour)
- Strip out non-functional "Products/Brands/Sellers" tabs from search bar
- Hide broken Browse dropdown until Phase 3
- Show simple search input + basic category pills only

### 2. **Fix Filter Modal** (2 hours)
- Remove `color` filter section (not in data model yet)
- Ensure all filter sections have valid default values
- Test open/close + apply/cancel flows

### 3. **Add Condition Pills Above Results** (1 hour)
- Quick filters: [🏷️ New] [💎 Like New] [👍 Good] [👌 Fair]
- Tap to toggle, no modal needed
- Visible + clickable area ≥44px (touch target)

---

## 🔧 Technical Implementation Notes

### State Management
```typescript
// Centralized filter state
const filterStore = createProductFilter();

// Derived states
$: appliedFilters = filterStore.filters; // Active filters
$: pendingFilters = filterStore.pendingFilters; // Being edited in modal
$: resultCount = filterStore.filteredProducts.length;

// Actions
filterStore.updateFilter('condition', 'like_new');
filterStore.applyPendingFilters(); // Commit modal changes
filterStore.resetFilters(); // Clear all
```

### URL Sync Strategy
```typescript
// On filter change → update URL (no navigation)
$effect(() => {
  if (browser && filtersInitialized) {
    syncFiltersToUrl(filters); // Safe router call with fallback
  }
});

// On page load → read URL params
onMount(() => {
  const urlFilters = getFiltersFromUrl();
  filterStore.updateMultipleFilters(urlFilters);
});
```

### Category Tree Data Structure
```typescript
interface CategoryTree {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  product_count: number;
  children?: CategoryTree[]; // Recursive for L2/L3
}

// Example:
const tree: CategoryTree[] = [
  {
    id: '1',
    slug: 'men',
    name: 'Men',
    icon: '🏷️',
    product_count: 12453,
    children: [
      {
        id: '2',
        slug: 'shoes',
        name: 'Shoes',
        icon: '👟',
        product_count: 3421,
        children: [
          { id: '3', slug: 'sneakers', name: 'Sneakers', product_count: 1823 },
          { id: '4', slug: 'boots', name: 'Boots', product_count: 982 }
        ]
      }
    ]
  }
];
```

---

## 🎨 Design Inspiration

### Desktop Reference
- **Vinted**: Clean category sidebar, inline filters
- **Depop**: Brand-first search, visual discovery
- **Grailed**: Advanced filtering, saved searches

### Mobile Reference
- **Instagram Shop**: Bottom sheet filters
- **Pinterest**: Visual search + quick filters
- **Poshmark**: Thumb-friendly category navigation

---

## 📝 Next Steps (Priority Order)

1. **Immediate** (Today):
   - ✅ Fix `bind:value` error (add `color` to FilterState)
   - 🔄 Remove broken Products/Brands/Sellers tabs from search bar
   - 🔄 Hide non-functional Browse dropdown temporarily

2. **This Week**:
   - Build `SearchBarSimple.svelte` (clean input + buttons)
   - Fix `StickyFilterModal` sections (remove color, test all filters)
   - Add condition pills above results (quick filter access)

3. **Next Week**:
   - Design + implement `CategoryBrowseMenu` (desktop 3-column)
   - Design + implement `CategoryBrowseSheet` (mobile slide-in)
   - Wire up category selection to filter store

4. **Following Week**:
   - Build `FilterDrawer` with section system
   - Create specialized filter widgets (brand search, price slider)
   - Polish animations + transitions

---

## 🤝 Collaboration Notes

**Design**: Need mockups for:
- Mobile bottom sheet (category browse + filters)
- Desktop filter drawer vs. popover (A/B test candidates)
- Condition pill styles (emoji + label layout)

**Backend**: API requirements:
- Category tree endpoint with product counts
- Brand search/autocomplete endpoint (paginated, searchable)
- Filter preview counts (e.g., "Like New (234)" before applying)

**QA**: Test scenarios:
- Mobile: One-handed operation (thumb zone reachability)
- Desktop: Keyboard-only navigation (tab order, arrow keys)
- Accessibility: Screen reader announcements on filter changes

---

## 📚 Related Documentation

- [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) - Tailwind v4 tokens
- [MOBILE_IMPLEMENTATION_GUIDE.md](./MOBILE_IMPLEMENTATION_GUIDE.md) - Touch interactions
- [PHASE_ROADMAP.md](./PHASE_ROADMAP.md) - Overall project timeline

---

**Last Updated**: October 18, 2025  
**Status**: 🚧 In Progress (Phase 1 Complete, Phase 2 Active)  
**Owner**: GitHub Copilot + @w3bsuki
