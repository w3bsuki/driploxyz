<script lang="ts">
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import SearchInput from './SearchInput.svelte';
import MegaMenuCategories from './MegaMenuCategories.svelte';
import CategoryPill from './CategoryPill.svelte';
import AppliedFilterPills from './AppliedFilterPills.svelte';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

interface FilterPillData {
  key: string;
  label: string;
  shortLabel: string;
}

interface MainCategory {
  key: string;
  label: string;
  icon: string;
}

interface Collection {
  key: string;
  label: string;
  emoji: string;
  product_count?: number;
}

interface Props {
  supabase: SupabaseClient<Database>;
  searchValue?: string;
  megaMenuData?: CategoryWithChildren[];
  mainCategories?: MainCategory[];
  conditionFilters?: FilterPillData[];
  appliedFilters?: Record<string, any>;
  availableSizes?: string[];
  availableColors?: string[];
  availableBrands?: string[];
  currentResultCount?: number;
  totalResultCount?: number;
  i18n: any;
  onSearch: (query: string) => void;
  onCategorySelect: (categorySlug: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onFilterRemove: (key: string) => void;
  onClearAllFilters: () => void;
}

let {
  supabase,
  searchValue = $bindable(''),
  megaMenuData = [],
  mainCategories = [],
  conditionFilters = [],
  appliedFilters = {},
  availableSizes = [],
  availableColors = [],
  availableBrands = [],
  currentResultCount = 0,
  totalResultCount = 0,
  i18n,
  onSearch,
  onCategorySelect,
  onFilterChange,
  onFilterRemove,
  onClearAllFilters
}: Props = $props();

// Component state
let showCategoryDropdown = $state(false);
let activeDropdownTab = $state('categories');
let dropdownSearchQuery = $state('');
let selectedPillIndex = $state(-1);

// Collections data
const collections = $derived<Collection[]>([
  // Quick Shopping Collections
  { key: 'newest', label: 'Newest', emoji: '🆕' },
  { key: 'under25', label: i18n.collections_under25 || 'Under 25', emoji: '💰' },
  { key: 'price-low', label: 'Cheapest', emoji: '📉' },
  { key: 'premium', label: i18n.collections_designerPremium || 'Designer 100$+', emoji: '💎' },
  // Condition Collections
  { key: 'condition=brand_new_with_tags', label: i18n.collections_newWithTags || 'New with Tags', emoji: '🏷️' },
  { key: 'condition=like_new', label: i18n.collections_likeNew || 'Like New', emoji: '✨' },
  { key: 'condition=good', label: 'Good', emoji: '👍' },
  // Style Collections
  { key: 'category=clothing', label: 'All Clothing', emoji: '👕' },
  { key: 'category=shoes', label: 'All Shoes', emoji: '👟' },
  { key: 'category=bags', label: 'All Bags', emoji: '👜' },
  { key: 'category=accessories', label: 'All Accessories', emoji: '💍' }
]);

// Filtered data for dropdown search
const filteredCollections = $derived(
  dropdownSearchQuery.trim()
    ? collections.filter(collection =>
        collection.label.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : collections
);

const filteredConditions = $derived(
  dropdownSearchQuery.trim()
    ? conditionFilters.filter(condition =>
        condition.label.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) ||
        condition.shortLabel.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : conditionFilters
);

// Filtered data for new filter types
const filteredSizes = $derived(
  dropdownSearchQuery.trim()
    ? availableSizes.filter(size =>
        size.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : availableSizes
);

const filteredColors = $derived(
  dropdownSearchQuery.trim()
    ? availableColors.filter(color =>
        color.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : availableColors
);

const filteredBrands = $derived(
  dropdownSearchQuery.trim()
    ? availableBrands.filter(brand =>
        brand.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : availableBrands
);

// Handle category dropdown
function handleCategoryDropdownToggle(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  showCategoryDropdown = !showCategoryDropdown;
}

function handleCategoryDropdownClose() {
  showCategoryDropdown = false;
}

function handleMegaMenuCategorySelect(categorySlug: string, level: number, path: string[]) {
  onCategorySelect(categorySlug);
  handleCategoryDropdownClose();
}

// Handle smart pill clicks
function handleSmartPillClick(pillKey: string, level: number) {
  if (level === 1) {
    // Main category selection
    onFilterChange('category', pillKey);
    onFilterChange('subcategory', null);
    onFilterChange('specific', null);
  } else if (level === 2) {
    // Subcategory selection
    onFilterChange('subcategory', pillKey);
    onFilterChange('specific', null);
  } else if (level === 3) {
    // Specific category selection
    onFilterChange('specific', pillKey);
  }
}

// Handle filter pills (legacy - keeping for compatibility)
function handleCategoryPillClick(categoryKey: string) {
  onFilterChange('category', categoryKey);
}

function handleConditionPillClick(conditionKey: string) {
  const currentCondition = appliedFilters?.condition;
  if (currentCondition === conditionKey) {
    onFilterRemove('condition');
  } else {
    onFilterChange('condition', conditionKey);
  }
}

// Roving tabindex for horizontal pill nav
function handlePillKeyNav(e: KeyboardEvent, index: number) {
  const pills = document.querySelectorAll('#category-pills button');
  const totalPills = (mainCategories?.length || 0) + (conditionFilters?.length || 0);
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      selectedPillIndex = Math.min(index + 1, totalPills - 1);
      (pills[selectedPillIndex] as HTMLElement)?.focus();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      selectedPillIndex = Math.max(index - 1, 0);
      (pills[selectedPillIndex] as HTMLElement)?.focus();
      break;
    case 'Home':
      e.preventDefault();
      selectedPillIndex = 0;
      (pills[0] as HTMLElement)?.focus();
      break;
    case 'End':
      e.preventDefault();
      selectedPillIndex = totalPills - 1;
      (pills[totalPills - 1] as HTMLElement)?.focus();
      break;
  }
}

// Handle collection selection from dropdown
function handleCollectionSelect(collection: Collection) {
  if (collection.key.startsWith('category=')) {
    const categorySlug = collection.key.replace('category=', '');
    onCategorySelect(categorySlug);
  } else if (collection.key.startsWith('condition=')) {
    const condition = collection.key.replace('condition=', '');
    onFilterChange('condition', condition);
  } else {
    // Handle other collection types (newest, under25, etc.)
    switch (collection.key) {
      case 'newest':
        onFilterChange('sortBy', 'newest');
        break;
      case 'price-low':
        onFilterChange('sortBy', 'price-low');
        break;
      case 'under25':
        onFilterChange('maxPrice', '25');
        break;
      case 'premium':
        onFilterChange('minPrice', '100');
        break;
      default:
        // Generic collection - could navigate to a collection page
        break;
    }
  }
  handleCategoryDropdownClose();
}

// Handle condition selection from dropdown
function handleConditionSelect(condition: FilterPillData) {
  onFilterChange('condition', condition.key);
  handleCategoryDropdownClose();
}

// Handle size selection from dropdown
function handleSizeSelect(size: string) {
  onFilterChange('size', size);
  handleCategoryDropdownClose();
}

// Handle color selection from dropdown
function handleColorSelect(color: string) {
  onFilterChange('color', color);
  handleCategoryDropdownClose();
}

// Handle brand selection from dropdown
function handleBrandSelect(brand: string) {
  onFilterChange('brand', brand);
  handleCategoryDropdownClose();
}

// Handle breadcrumb navigation
function handleBreadcrumbClick(level: number) {
  const { category, subcategory, specific } = appliedFilters || {};

  if (level === 1) {
    // Go back to level 1 - clear subcategory and specific
    onFilterChange('subcategory', null);
    onFilterChange('specific', null);
  } else if (level === 2 && subcategory) {
    // Go back to level 2 - clear specific only
    onFilterChange('specific', null);
  }
  // Level 3 doesn't need to clear anything as it's the most specific
}

// Handle click outside for category dropdown
$effect(() => {
  if (typeof window !== 'undefined') {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-dropdown-container')) {
        showCategoryDropdown = false;
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }
});

// Build breadcrumb path for selected categories
const categoryBreadcrumbs = $derived(() => {
  const breadcrumbs: Array<{ key: string; label: string; level: number }> = [];

  const { category, subcategory, specific } = appliedFilters || {};

  // Level 1: Main category
  if (category) {
    const mainCat = mainCategories.find(c => c.key === category);
    breadcrumbs.push({
      key: category,
      label: mainCat?.label || category,
      level: 1
    });
  }

  // Level 2: Subcategory
  if (subcategory && category) {
    // Find the subcategory name in the megaMenuData
    const l1Cat = megaMenuData.find(cat => cat.slug === category);
    const l2Cat = l1Cat?.children?.find(subcat => subcat.slug === subcategory);
    breadcrumbs.push({
      key: subcategory,
      label: l2Cat?.name || subcategory,
      level: 2
    });
  }

  // Level 3: Specific category
  if (specific && category && subcategory) {
    // Find the specific category name in the megaMenuData
    const l1Cat = megaMenuData.find(cat => cat.slug === category);
    const l2Cat = l1Cat?.children?.find(subcat => subcat.slug === subcategory);
    const l3Cat = l2Cat?.children?.find(spec => spec.slug === specific);
    breadcrumbs.push({
      key: specific,
      label: l3Cat?.name || specific,
      level: 3
    });
  }

  return breadcrumbs;
});

// Determine current category for display
const currentCategoryDisplay = $derived(() => {
  if (categoryBreadcrumbs.length > 0) {
    const lastCrumb = categoryBreadcrumbs[categoryBreadcrumbs.length - 1];
    const mainCat = mainCategories.find(c => c.key === appliedFilters?.category);
    return {
      label: lastCrumb.label,
      icon: mainCat?.icon || '📂',
      breadcrumbs: categoryBreadcrumbs
    };
  }
  return {
    label: typeof i18n?.filter_allCategories === 'function' ? i18n.filter_allCategories() : 'All Categories',
    icon: '📂',
    breadcrumbs: []
  };
});

// Flatten categories (level 1/2/3) for typeahead matching in the search input
const flatCategories = $derived(() => {
  const result: Array<{ level: number; name: string; slug: string; path: string[] }> = [];
  for (const l1 of megaMenuData || []) {
    result.push({ level: 1, name: l1.name, slug: l1.slug, path: [l1.slug] });
    for (const l2 of l1.children || []) {
      result.push({ level: 2, name: l2.name, slug: l2.slug, path: [l1.slug, l2.slug] });
      for (const l3 of l2.children || []) {
        result.push({ level: 3, name: l3.name, slug: l3.slug, path: [l1.slug, l2.slug, l3.slug] });
      }
    }
  }
  return result;
});

const categoryMatches = $derived(() => {
  const q = (searchValue || '').trim().toLowerCase();
  if (!q) return [] as Array<{ level: number; name: string; slug: string; path: string[] }>;
  return flatCategories
    .filter(c => c.name.toLowerCase().includes(q))
    .slice(0, 10);
});

// Smart pill system - determine what pills to show based on current selection
const smartPillData = $derived(() => {
  const { category, subcategory } = appliedFilters || {};

  if (category && subcategory && megaMenuData && megaMenuData.length > 0) {
    // Level 3: Show specific items (dresses, t-shirts, etc.)
    const l1Cat = megaMenuData.find(cat => cat.slug === category);
    const l2Cat = l1Cat?.children?.find(subcat => subcat.slug === subcategory);
    const specificItems = l2Cat?.children || [];

    return {
      level: 3,
      pills: specificItems.map(item => ({
        key: item.slug || item.name,
        label: item.name,
        icon: '🔸',
        active: appliedFilters?.specific === item.slug
      })) || [],
      showMainCategories: false
    };
  } else if (category && megaMenuData && megaMenuData.length > 0) {
    // Level 2: Show subcategories (clothing, shoes, etc.)
    const l1Cat = megaMenuData.find(cat => cat.slug === category);
    const subcategories = l1Cat?.children || [];

    return {
      level: 2,
      pills: subcategories.map(subcat => ({
        key: subcat.slug || subcat.name,
        label: subcat.name,
        icon: getSubcategoryIcon(subcat.name),
        active: appliedFilters?.subcategory === subcat.slug
      })) || [],
      showMainCategories: false
    };
  } else {
    // Level 1: Show main categories
    return {
      level: 1,
      pills: (mainCategories || []).map(cat => ({
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        active: appliedFilters?.category === cat.key
      })),
      showMainCategories: true
    };
  }
});

// Helper function to get appropriate icons for subcategories
function getSubcategoryIcon(name: string): string {
  const iconMap: Record<string, string> = {
    'Clothing': '👕',
    'Shoes': '👟',
    'Bags': '👜',
    'Accessories': '💍',
    'Dresses': '👗',
    'Tops': '👔',
    'Jeans': '👖',
    'Sweaters': '🧥',
    'Sneakers': '👟',
    'Boots': '🥾',
    'Heels': '👠'
  };
  return iconMap[name] || '🔸';
}
</script>

<!-- Sticky Search Bar (compact) -->
<div class="bg-[color:var(--surface-base)]/90 supports-[backdrop-filter]:backdrop-blur-sm sticky z-40 border-b border-[color:var(--border-subtle)]" style="top: var(--app-header-offset, 56px) !important;">
  <div class="px-2 sm:px-4 lg:px-6 relative py-[var(--gutter-xxs)] sm:py-[var(--gutter-xs)]">
    <!-- Search Container -->
    <div class="py-0 relative search-dropdown-container">
      <SearchInput
        bind:searchValue={searchValue}
        placeholder={typeof i18n?.search_placeholder === 'function' ? i18n.search_placeholder() : 'Search...'}
        onSearch={onSearch}
        searchId="search-page-input"
        showDropdown={false}
      >
        {#snippet leftSection()}
          <button
            onclick={handleCategoryDropdownToggle}
            type="button"
            class="h-11 px-4 bg-transparent hover:bg-[color:var(--surface-subtle)] transition-all duration-200 flex items-center gap-2 focus:outline-none focus:bg-[color:var(--surface-subtle)] border-r border-[color:var(--border-subtle)] rounded-l-lg"
            aria-expanded={showCategoryDropdown}
            aria-haspopup="listbox"
            aria-label="Select category"
          >
            <span class="text-sm font-medium text-[color:var(--text-secondary)]">Browse</span>
            {#if currentResultCount !== undefined}
              <span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                {currentResultCount.toLocaleString()}
              </span>
            {/if}
            <svg class="w-4 h-4 text-[color:var(--text-secondary)] transition-transform duration-200 {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        {/snippet}
      </SearchInput>

      <!-- Typeahead: Category matches as user types -->
      {#if (searchValue || '').trim().length > 0 && categoryMatches.length > 0}
        <div class="absolute top-full left-0 right-0 mt-1 z-50">
          <div class="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div class="max-h-[50vh] overflow-y-auto">
              <div class="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</div>
              {#each categoryMatches as c}
                <button
                  onclick={() => handleMegaMenuCategorySelect(c.slug, c.level, c.path)}
                  class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                >
                  <span class="text-gray-400 text-xs w-8">{c.level === 1 ? 'L1' : c.level === 2 ? 'L2' : 'L3'}</span>
                  <span class="flex-1 text-sm text-gray-900">{c.name}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Tabbed Dropdown -->
      {#if showCategoryDropdown}
        <div class="absolute top-full left-0 right-0 mt-1 z-50">
          <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-h-[350px] max-h-[80vh] overflow-hidden">
            <!-- Tab Headers - Scrollable on mobile -->
            <div class="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              <button
                onclick={() => activeDropdownTab = 'categories'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Categories
              </button>
              <button
                onclick={() => activeDropdownTab = 'collections'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'collections' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Collections
              </button>
              <button
                onclick={() => activeDropdownTab = 'size'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'size' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Size
              </button>
              <button
                onclick={() => activeDropdownTab = 'color'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'color' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Color
              </button>
              <button
                onclick={() => activeDropdownTab = 'brand'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'brand' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Brand
              </button>
              <button
                onclick={() => activeDropdownTab = 'condition'}
                class="shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'condition' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Condition
              </button>
            </div>

            <!-- Search Input -->
            <div class="mb-4">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  bind:value={dropdownSearchQuery}
                  placeholder={activeDropdownTab === 'categories' ? 'Search categories...' :
                              activeDropdownTab === 'collections' ? 'Search collections...' :
                              activeDropdownTab === 'size' ? 'Search sizes...' :
                              activeDropdownTab === 'color' ? 'Search colors...' :
                              activeDropdownTab === 'brand' ? 'Search brands...' :
                              'Search conditions...'}
                  class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
                {#if dropdownSearchQuery.trim()}
                  <button
                    onclick={() => dropdownSearchQuery = ''}
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                {/if}
              </div>
            </div>

            <!-- Tab Content -->
            <div class="min-h-[200px] max-h-[300px] overflow-y-auto">
              {#if activeDropdownTab === 'categories'}
                <MegaMenuCategories
                  categories={megaMenuData}
                  onCategoryClick={handleMegaMenuCategorySelect}
                  onClose={handleCategoryDropdownClose}
                />
              {:else if activeDropdownTab === 'collections'}
                <div class="grid grid-cols-2 gap-2">
                  {#each filteredCollections as collection}
                    <button
                      onclick={() => handleCollectionSelect(collection)}
                      class="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                    >
                      <span class="text-lg">{collection.emoji}</span>
                      <span class="font-medium text-gray-900 group-hover:text-blue-600 text-sm">{collection.label}</span>
                    </button>
                  {/each}
                  {#if filteredCollections.length === 0 && dropdownSearchQuery.trim()}
                    <div class="col-span-2 text-center py-4 text-gray-500">
                      <p class="text-sm">No collections found</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'size'}
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {#each filteredSizes as size}
                    <button
                      onclick={() => handleSizeSelect(size)}
                      class="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.size === size ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                    >
                      <span class="font-medium text-sm">{size}</span>
                    </button>
                  {/each}
                  {#if filteredSizes.length === 0}
                    <div class="col-span-full text-center py-4 text-gray-500">
                      <p class="text-sm">{dropdownSearchQuery.trim() ? 'No sizes found' : 'No sizes available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'color'}
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {#each filteredColors as color}
                    <button
                      onclick={() => handleColorSelect(color)}
                      class="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.color === color ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                    >
                      <div class="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style="background-color: {color.toLowerCase()}"></div>
                      <span class="font-medium text-sm">{color}</span>
                    </button>
                  {/each}
                  {#if filteredColors.length === 0}
                    <div class="col-span-full text-center py-4 text-gray-500">
                      <p class="text-sm">{dropdownSearchQuery.trim() ? 'No colors found' : 'No colors available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'brand'}
                <div class="grid grid-cols-1 gap-2">
                  {#each filteredBrands as brand}
                    <button
                      onclick={() => handleBrandSelect(brand)}
                      class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.brand === brand ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                    >
                      <span class="font-medium text-gray-900 group-hover:text-blue-600 text-sm">{brand}</span>
                      {#if appliedFilters?.brand === brand}
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </button>
                  {/each}
                  {#if filteredBrands.length === 0}
                    <div class="text-center py-4 text-gray-500">
                      <p class="text-sm">{dropdownSearchQuery.trim() ? 'No brands found' : 'No brands available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'condition'}
                <div class="grid grid-cols-1 gap-2">
                  {#each filteredConditions as condition}
                    <button
                      onclick={() => handleConditionSelect(condition)}
                      class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                    >
                      <div>
                        <div class="font-medium text-gray-900 group-hover:text-blue-600 text-sm">{condition.label}</div>
                        {#if condition.shortLabel !== condition.label}
                          <div class="text-xs text-gray-500">{condition.shortLabel}</div>
                        {/if}
                      </div>
                    </button>
                  {/each}
                  {#if filteredConditions.length === 0 && dropdownSearchQuery.trim()}
                    <div class="text-center py-4 text-gray-500">
                      <p class="text-sm">No conditions found</p>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Category Breadcrumbs -->
    {#if categoryBreadcrumbs.length > 0}
      <div class="flex items-center justify-between px-1 py-2 text-sm">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0l-4 4m4-4l-4-4" />
          </svg>
        {#each categoryBreadcrumbs as crumb, index}
          <button
            onclick={() => handleBreadcrumbClick(crumb.level)}
            class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium
              {index === categoryBreadcrumbs.length - 1 ? 'text-blue-600' : 'hover:underline'}"
            aria-label={`Navigate to ${crumb.label} level`}
          >
            {crumb.label}
          </button>
          {#if index < categoryBreadcrumbs.length - 1}
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}
        {/each}
        <button
          onclick={() => {
            onFilterChange('category', null);
            onFilterChange('subcategory', null);
            onFilterChange('specific', null);
          }}
          class="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Clear category filter"
          title="Clear category selection"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        </div>

        <!-- Result count for current selection -->
        {#if currentResultCount !== undefined}
          <div class="text-xs text-gray-500 font-medium">
            {currentResultCount.toLocaleString()} items
          </div>
        {/if}
      </div>
    {/if}

    <!-- Smart Filter Pills -->
    <nav id="category-pills" class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-[var(--gutter-xxs)] pt-[var(--gutter-xxs)]" aria-label="Smart category filters">
      <!-- Dynamic Category Pills -->
      {#each smartPillData.pills as pill, index}
        <CategoryPill
          variant={pill.active ? 'primary' : 'outline'}
          label={pill.label}
          emoji={pill.icon}
          onclick={() => handleSmartPillClick(pill.key, smartPillData.level)}
          class="shrink-0 min-h-11"
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index)}
        />
      {/each}

      <!-- Separator between category and condition pills -->
      {#if smartPillData.pills.length > 0 && conditionFilters.length > 0}
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
      {/if}

      <!-- Condition Pills -->
      {#each conditionFilters as condition, cIdx}
        <button
          type="button"
          onclick={() => handleConditionPillClick(condition.key)}
          class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-11
            {appliedFilters?.condition === condition.key
              ? 'bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] border border-[color:var(--brand-primary)]'
              : 'bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-base)]'}"
          aria-label={`Filter by ${condition.label}`}
          aria-pressed={appliedFilters?.condition === condition.key}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, (mainCategories?.length || 0) + cIdx)}
        >
          {condition.shortLabel}
        </button>
      {/each}
    </nav>

    <!-- Applied Filters -->
    {#if appliedFilters && Object.keys(appliedFilters).length > 0}
      <div class="pb-2">
        <AppliedFilterPills
          {appliedFilters}
          onRemoveFilter={onFilterRemove}
          onClearAll={onClearAllFilters}
          translations={{
            clearAll: typeof i18n?.filter_clearAll === 'function' ? i18n.filter_clearAll() : 'Clear All',
            priceRange: typeof i18n?.filter_priceRange === 'function' ? i18n.filter_priceRange() : 'Price Range',
            size: typeof i18n?.product_size === 'function' ? i18n.product_size() : 'Size',
            condition: typeof i18n?.product_condition === 'function' ? i18n.product_condition() : 'Condition',
            brand: typeof i18n?.product_brand === 'function' ? i18n.product_brand() : 'Brand',
            category: typeof i18n?.product_category === 'function' ? i18n.product_category() : 'Category'
          }}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
