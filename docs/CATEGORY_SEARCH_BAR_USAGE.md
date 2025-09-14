# CategorySearchBar Usage Guide

The `CategorySearchBar` component provides enhanced category-specific search functionality with multi-level category navigation. It's designed to be the third search bar in the Driplo system alongside `MainPageSearchBar` and `SearchPageSearchBar`.

## Features

- **Multi-level Category Navigation**: Navigate from Men → Clothing → T-shirts
- **Enhanced MegaMenuCategories Integration**: Leverages existing 3-level navigation
- **Svelte 5 Runes**: Built with modern `$state`, `$derived`, `$effect` patterns
- **Defensive Programming**: Handles undefined filter states gracefully
- **Responsive Design**: Mobile-first with touch-friendly interactions
- **Smart Category Display**: Shows breadcrumb path for deep navigation
- **Consistent Styling**: Matches main page dropdown aesthetics

## Basic Usage

```svelte
<script lang="ts">
import { CategorySearchBar } from '@repo/ui';
import type { Database } from '@repo/database';

// Your component props and state
let searchQuery = $state('');
let appliedFilters = $state({});

// Category data from your server
let megaMenuData = $derived(/* your category hierarchy */);
let mainCategories = $derived([
  { key: 'women', label: 'Women', icon: '👗' },
  { key: 'men', label: 'Men', icon: '👔' },
  { key: 'kids', label: 'Kids', icon: '👶' },
  { key: 'unisex', label: 'Unisex', icon: '🌍' }
]);

// Event handlers
function handleSearch(query: string) {
  // Update your search state
  searchQuery = query;
}

function handleCategorySelect(categorySlug: string, level: number, path: string[]) {
  // Handle category selection with full path context
  if (level === 1) {
    appliedFilters = {
      ...appliedFilters,
      category: categorySlug,
      subcategory: null,
      specific: null
    };
  } else if (level === 2) {
    appliedFilters = {
      ...appliedFilters,
      category: path[0],
      subcategory: categorySlug,
      specific: null
    };
  } else if (level === 3) {
    appliedFilters = {
      ...appliedFilters,
      category: path[0],
      subcategory: path[1],
      specific: categorySlug
    };
  }
}

function handleFilterChange(key: string, value: any) {
  appliedFilters = { ...appliedFilters, [key]: value };
}

function handleFilterRemove(key: string) {
  const { [key]: removed, ...rest } = appliedFilters;
  appliedFilters = rest;
}

function handleClearAllFilters() {
  appliedFilters = {};
  searchQuery = '';
}
</script>

<CategorySearchBar
  {supabase}
  bind:searchValue={searchQuery}
  {megaMenuData}
  {mainCategories}
  {conditionFilters}
  {appliedFilters}
  {i18n}
  onSearch={handleSearch}
  onCategorySelect={handleCategorySelect}
  onFilterChange={handleFilterChange}
  onFilterRemove={handleFilterRemove}
  onClearAllFilters={handleClearAllFilters}
/>
```

## Props Interface

```typescript
interface Props {
  supabase: SupabaseClient<Database>;
  searchValue?: string;
  megaMenuData?: CategoryWithChildren[];
  mainCategories?: MainCategory[];
  conditionFilters?: FilterPillData[];
  appliedFilters?: Record<string, any>;
  currentCategory?: string | null;
  i18n: any;
  onSearch: (query: string) => void;
  onCategorySelect: (categorySlug: string, level: number, path: string[]) => void;
  onFilterChange: (key: string, value: any) => void;
  onFilterRemove: (key: string) => void;
  onClearAllFilters: () => void;
}
```

## Category Navigation Flow

### Level 1: Main Categories
- Women, Men, Kids, Unisex
- Clicking navigates to category overview or opens level 2

### Level 2: Subcategories
- Clothing, Shoes, Accessories, Bags
- Path: `['men', 'clothing']`

### Level 3: Specific Items
- T-shirts, Dresses, Sneakers, etc.
- Path: `['men', 'clothing', 't-shirts']`

## Example Category Selection Handler

```typescript
function handleCategorySelect(categorySlug: string, level: number, path: string[]) {
  // Example: User clicks Men → Clothing → T-shirts
  if (level === 3 && path.length === 3) {
    // path = ['men', 'clothing', 't-shirts']
    appliedFilters = {
      ...appliedFilters,
      category: 'men',           // Level 1
      subcategory: 'clothing',   // Level 2
      specific: 't-shirts'       // Level 3
    };

    // Navigate to filtered results
    goto(`/search?category=men&subcategory=clothing&specific=t-shirts`);
  }
}
```

## Breadcrumb Display

The CategorySearchBar intelligently displays the current category path:

- **Single level**: "Men"
- **Two levels**: "Men → Clothing"
- **Three levels**: "Men → Clothing → T-shirts"

## Error Handling

The component includes defensive programming to handle:
- Undefined filter objects
- Missing category labels
- Null/undefined i18n functions
- Empty megaMenuData arrays

## Integration with Existing Search System

1. **MainPageSearchBar**: Used on homepage for discovery
2. **SearchPageSearchBar**: Used on `/search` for general filtering
3. **CategorySearchBar**: Used on category pages for deep navigation

Each maintains separate context and dropdown functionality while sharing core components like `MegaMenuCategories` and `AppliedFilterPills`.

## i18n Integration

The component supports internationalization through the `i18n` prop:

```typescript
const i18nKeys = [
  'search_placeholder',
  'filter_allCategories',
  'search_all',
  'common_back',
  'search_items',
  'category_women',
  'category_men',
  'category_kids',
  'category_unisex',
  'category_clothing',
  'category_shoesType',
  'category_accessoriesType',
  'category_bagsType',
  'filter_clearAll'
];
```

## Styling and Theming

The component uses Tailwind v4 with design tokens:
- Uses `var(--brand-primary)` for primary colors
- Responsive classes with `sm:` breakpoints
- Touch-friendly 44px/36px tap targets
- Consistent with other search bars

## Performance Considerations

- Uses Svelte 5 `$derived` for computed values
- Debounced search input (inherited from SearchInput)
- Lazy-loaded dropdown content
- Optimized re-renders with fine-grained reactivity