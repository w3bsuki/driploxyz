<script lang="ts">
import SearchInput from '../../compositions/forms/SearchInput.svelte';
import MegaMenuCategories from './MegaMenuCategories.svelte';
import CategoryPill from '../../primitives/pill/CategoryPill.svelte';
import AppliedFilterPills from '../../compositions/product/AppliedFilterPills.svelte';
import {
  buildCategoryBreadcrumbs,
  flattenCategoryHierarchy,
  type CategoryBreadcrumbItem,
  type FlatCategoryItem
} from '../../search/utils.js';
import type {
  CategoryWithChildren,
  SearchMainCategory,
  SearchPageSearchBarProps,
  SearchAppliedFilters,
  Collection
} from '../../search/types.js';
import type { FilterOption, FilterValue, SearchBarMode } from '@repo/ui/types';

let {
  mode = 'full' as SearchBarMode,
  searchValue = $bindable(''),
  megaMenuData = [] as CategoryWithChildren[],
  mainCategories = [] as SearchMainCategory[],
  conditionFilters = [] as FilterOption[],
  appliedFilters = {} as SearchAppliedFilters,
  availableSizes = [] as string[],
  availableColors = [] as string[],
  availableBrands = [] as string[],
  currentResultCount = 0,
  totalResultCount = 0,
  i18n,
  onSearch,
  onCategorySelect,
  onFilterChange,
  onFilterRemove,
  onClearAllFilters,
  onQuickSearch,
  enableQuickResults = true
}: SearchPageSearchBarProps = $props();

// Analytics functionality removed for build optimization
// TODO: Implement analytics tracking when needed

// Component state
let showCategoryDropdown = $state(false);
let activeDropdownTab = $state('categories');
let dropdownSearchQuery = $state('');
let selectedPillIndex = $state(-1);

function i18nText(value: unknown, fallback: string): string {
  return typeof value === 'function' ? (value as () => string)() : fallback;
}

function setFilter(key: string, value: FilterValue) {
  onFilterChange(key, value);
}

interface SmartPill {
  key: string;
  label: string;
  icon: string;
  active: boolean;
}

interface SmartPillState {
  level: 1 | 2 | 3;
  pills: SmartPill[];
  showMainCategories: boolean;
}

// Collections data
const collections = $derived.by<Collection[]>(() => [
  { key: 'newest', label: 'Newest', emoji: '🆕' },
  { key: 'under25', label: i18nText(i18n.collections_under25, 'Under 25'), emoji: '💰' },
  { key: 'price-low', label: 'Cheapest', emoji: '📉' },
  { key: 'premium', label: i18nText(i18n.collections_designerPremium, 'Designer 100$+'), emoji: '💎' },
  { key: 'condition=brand_new_with_tags', label: i18nText(i18n.collections_newWithTags, 'New with Tags'), emoji: '🏷️' },
  { key: 'condition=like_new', label: i18nText(i18n.collections_likeNew, 'Like New'), emoji: '✨' },
  { key: 'condition=good', label: 'Good', emoji: '👍' },
  { key: 'category=clothing', label: 'All Clothing', emoji: '👕' },
  { key: 'category=shoes', label: 'All Shoes', emoji: '👟' },
  { key: 'category=bags', label: 'All Bags', emoji: '👜' },
  { key: 'category=accessories', label: 'All Accessories', emoji: '💍' }
]);

// Filtered data for dropdown search
const filteredCollections = $derived.by<Collection[]>(() => {
  const query = dropdownSearchQuery.trim().toLowerCase();
  if (!query) return collections;
  return collections.filter(collection => collection.label.toLowerCase().includes(query));
});

const filteredConditions = $derived.by<FilterOption[]>(() => {
  const query = dropdownSearchQuery.trim().toLowerCase();
  if (!query) return conditionFilters;

  return conditionFilters.filter(condition => {
    const labelMatch = condition.label.toLowerCase().includes(query);
    const shortLabel = condition.shortLabel?.toLowerCase() ?? '';
    return labelMatch || shortLabel.includes(query);
  });
});

// Filtered data for new filter types
const filteredSizes = $derived.by<string[]>(() => {
  const query = dropdownSearchQuery.trim().toLowerCase();
  if (!query) return availableSizes;
  return availableSizes.filter(size => size.toLowerCase().includes(query));
});

const filteredColors = $derived.by<string[]>(() => {
  const query = dropdownSearchQuery.trim().toLowerCase();
  if (!query) return availableColors;
  return availableColors.filter(color => color.toLowerCase().includes(query));
});

const filteredBrands = $derived.by<string[]>(() => {
  const query = dropdownSearchQuery.trim().toLowerCase();
  if (!query) return availableBrands;
  return availableBrands.filter(brand => brand.toLowerCase().includes(query));
});

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
  // Analytics tracking would go here when implemented
  // trackMegaMenuNavigation(level, categorySlug, path.join('/'));

  onCategorySelect(categorySlug, level, path);
  handleCategoryDropdownClose();
}

// Handle smart pill clicks
function handleSmartPillClick(pillKey: string, level: number) {
  // Analytics tracking would go here when implemented
  // trackFilterUsage(level === 1 ? 'category' : level === 2 ? 'subcategory' : 'specific', pillKey, searchValue || '');

  if (level === 1) {
    // Main category selection
    setFilter('category', pillKey);
    setFilter('subcategory', null);
    setFilter('specific', null);
  } else if (level === 2) {
    // Subcategory selection
    setFilter('subcategory', pillKey);
    setFilter('specific', null);
  } else if (level === 3) {
    // Specific category selection
    setFilter('specific', pillKey);
  }
}

// Handle filter pills (legacy - keeping for compatibility)
function handleCategoryPillClick(categoryKey: string) {
  setFilter('category', categoryKey);
}

function handleConditionPillClick(conditionKey: string) {
  const currentCondition = appliedFilters?.condition;

  // Analytics tracking would go here when implemented
  // trackFilterUsage('condition', conditionKey, searchValue || '');

  if (currentCondition === conditionKey) {
    onFilterRemove('condition');
  } else {
    setFilter('condition', conditionKey);
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
  // Analytics tracking would go here when implemented
  // trackFilterUsage('collection', collection.key, searchValue || '');

  if (collection.key.startsWith('category=')) {
    const categorySlug = collection.key.replace('category=', '');
    onCategorySelect(categorySlug, 1, [categorySlug]);
  } else if (collection.key.startsWith('condition=')) {
    const condition = collection.key.replace('condition=', '');
    setFilter('condition', condition);
  } else {
    // Handle other collection types (newest, under25, etc.)
    switch (collection.key) {
      case 'newest':
        setFilter('sortBy', 'newest');
        break;
      case 'price-low':
        setFilter('sortBy', 'price-low');
        break;
      case 'under25':
        setFilter('maxPrice', '25');
        break;
      case 'premium':
        setFilter('minPrice', '100');
        break;
      default:
        // Generic collection - could navigate to a collection page
        break;
    }
  }
  handleCategoryDropdownClose();
}

// Handle condition selection from dropdown
function handleConditionSelect(condition: FilterOption) {
  const key: FilterValue = condition.key ?? condition.value;
  // Analytics tracking would go here when implemented
  // trackFilterUsage('condition', key, searchValue || '');
  setFilter('condition', key);
  handleCategoryDropdownClose();
}

// Handle size selection from dropdown
function handleSizeSelect(size: string) {
  // Analytics tracking would go here when implemented
  // trackFilterUsage('size', size, searchValue || '');
  setFilter('size', size);
  handleCategoryDropdownClose();
}

// Handle color selection from dropdown
function handleColorSelect(color: string) {
  // Analytics tracking would go here when implemented
  // trackFilterUsage('color', color, searchValue || '');
  setFilter('color', color);
  handleCategoryDropdownClose();
}

// Handle brand selection from dropdown
function handleBrandSelect(brand: string) {
  // Analytics tracking would go here when implemented
  // trackFilterUsage('brand', brand, searchValue || '');
  setFilter('brand', brand);
  handleCategoryDropdownClose();
}

// Handle breadcrumb navigation
function handleBreadcrumbClick(level: number) {
  const { category, subcategory, specific } = appliedFilters || {};

  if (level === 1) {
    // Go back to level 1 - clear subcategory and specific
    setFilter('subcategory', null);
    setFilter('specific', null);
  } else if (level === 2 && subcategory) {
    // Go back to level 2 - clear specific only
    setFilter('specific', null);
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
const categoryBreadcrumbs = $derived.by<CategoryBreadcrumbItem[]>(() =>
  buildCategoryBreadcrumbs(appliedFilters, megaMenuData, mainCategories)
);

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
    label: i18nText(i18n.filter_allCategories, 'All Categories'),
    icon: '📂',
    breadcrumbs: [] as CategoryBreadcrumbItem[]
  };
});

// Flatten categories (level 1/2/3) for typeahead matching in the search input
const flatCategories = $derived.by<FlatCategoryItem[]>(() => flattenCategoryHierarchy(megaMenuData));

const categoryMatches = $derived.by<FlatCategoryItem[]>(() => {
  const query = (searchValue || '').trim().toLowerCase();
  if (!query) return [];
  return flatCategories.filter(category => category.name.toLowerCase().includes(query)).slice(0, 10);
});

// Smart pill system - determine what pills to show based on current selection
const smartPillData = $derived.by<SmartPillState>(() => {
  const selectedCategory = appliedFilters?.category;
  const selectedSubcategory = appliedFilters?.subcategory;
  const selectedSpecific = appliedFilters?.specific;

  if (selectedCategory && selectedSubcategory) {
    const level1 = megaMenuData?.find(cat => cat.slug === selectedCategory || cat.key === selectedCategory);
    const level2 = level1?.children?.find(sub => sub.slug === selectedSubcategory || sub.key === selectedSubcategory);
    const specificItems = level2?.children ?? [];

    if (specificItems.length > 0) {
      return {
        level: 3,
        pills: specificItems.map(item => {
          const slug = item.slug ?? item.key ?? item.name;
          return {
            key: slug,
            label: item.name,
            icon: '🔸',
            active: selectedSpecific === slug
          } satisfies SmartPill;
        }),
        showMainCategories: false
      } satisfies SmartPillState;
    }
  }

  if (selectedCategory) {
    const level1 = megaMenuData?.find(cat => cat.slug === selectedCategory || cat.key === selectedCategory);
    const subcategories = level1?.children ?? [];

    if (subcategories.length > 0) {
      return {
        level: 2,
        pills: subcategories.map(subcat => {
          const slug = subcat.slug ?? subcat.key ?? subcat.name;
          return {
            key: slug,
            label: subcat.name,
            icon: getSubcategoryIcon(subcat.name),
            active: selectedSubcategory === slug
          } satisfies SmartPill;
        }),
        showMainCategories: false
      } satisfies SmartPillState;
    }
  }

  return {
    level: 1,
    pills: (mainCategories || []).map(category => ({
      key: category.key,
      label: category.label,
      icon: category.icon,
      active: selectedCategory === category.key
    } satisfies SmartPill)),
    showMainCategories: true
  } satisfies SmartPillState;
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
        showDropdown={enableQuickResults}
        searchFunction={onQuickSearch}
        maxResults={6}
        {mode}
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
            <span class="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">Browse</span>
            {#if currentResultCount !== undefined}
              <span class="px-2 py-1 text-[length:var(--text-xs)] font-semibold bg-[color:var(--surface-subtle)] text-[color:var(--text-primary)] rounded-full">
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
              <div class="p-2 text-[length:var(--text-xs)] font-semibold text-[color:var(--text-secondary)] uppercase tracking-wide">Categories</div>
              {#each categoryMatches as c}
                <button
                  onclick={() => handleMegaMenuCategorySelect(c.slug, c.level, c.path)}
                  class="w-full flex items-center gap-2 px-3 h-9 min-h-9 hover:bg-gray-50 text-left transition-colors"
                  role="option"
                  aria-selected="false"
                  aria-label="Select category: {c.name} (Level {c.level})"
                >
                  <span class="text-[color:var(--text-tertiary)] text-[length:var(--text-xs)] w-8">{c.level === 1 ? 'L1' : c.level === 2 ? 'L2' : 'L3'}</span>
                  <span class="flex-1 text-[length:var(--text-sm)] text-gray-900">{c.name}</span>
                  <svg class="w-4 h-4 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <!-- Tab Headers - Scrollable on mobile (40px preferred for secondary actions) -->
            <div class="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbarhide" role="tablist" aria-label="Filter categories">
              <button
                onclick={() => activeDropdownTab = 'categories'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'categories' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'categories'}
                aria-controls="categories-panel"
                id="categories-tab"
              >
                Categories
              </button>
              <button
                onclick={() => activeDropdownTab = 'collections'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'collections' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'collections'}
                aria-controls="collections-panel"
                id="collections-tab"
              >
                Collections
              </button>
              <button
                onclick={() => activeDropdownTab = 'size'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'size' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'size'}
                aria-controls="size-panel"
                id="size-tab"
              >
                Size
              </button>
              <button
                onclick={() => activeDropdownTab = 'color'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'color' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'color'}
                aria-controls="color-panel"
                id="color-tab"
              >
                Color
              </button>
              <button
                onclick={() => activeDropdownTab = 'brand'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'brand' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'brand'}
                aria-controls="brand-panel"
                id="brand-tab"
              >
                Brand
              </button>
              <button
                onclick={() => activeDropdownTab = 'condition'}
                class="shrink-0 px-3 h-10 min-h-10 text-[length:var(--text-sm)] font-medium rounded-md transition-all duration-200 flex items-center justify-center {activeDropdownTab === 'condition' ? 'bg-white text-[color:var(--brand-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                role="tab"
                aria-selected={activeDropdownTab === 'condition'}
                aria-controls="condition-panel"
                id="condition-tab"
              >
                Condition
              </button>
            </div>

            <!-- Search Input -->
            <div class="mb-4">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  class="w-full pl-10 pr-4 h-10 min-h-10 text-[length:var(--text-sm)] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
                {#if dropdownSearchQuery.trim()}
                  <button
                    onclick={() => dropdownSearchQuery = ''}
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 min-w-9 min-h-9 flex items-center justify-center text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-subtle)] rounded-full transition-colors"
                    aria-label="Clear search query"
                    type="button"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                {/if}
              </div>
            </div>

            <!-- Tab Content -->
            <div class="min-h-[200px] max-h-[300px] overflow-y-auto" role="tabpanel" aria-labelledby="{activeDropdownTab}-tab" id="{activeDropdownTab}-panel">
              {#if activeDropdownTab === 'categories'}
                <MegaMenuCategories
                  categories={megaMenuData}
                  onCategoryClick={handleMegaMenuCategorySelect}
                  onClose={handleCategoryDropdownClose}
                />
              {:else if activeDropdownTab === 'collections'}
                <div class="grid grid-cols-2 gap-2" role="grid" aria-label="Collection filters">
                  {#each filteredCollections as collection}
                    <button
                      onclick={() => handleCollectionSelect(collection)}
                      class="flex items-center gap-2 p-3 h-10 min-h-10 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      aria-label="Filter by collection: {collection.label}"
                    >
                      <span class="text-[length:var(--text-lg)]">{collection.emoji}</span>
                      <span class="font-medium text-[color:var(--text-primary)] group-hover:text-[color:var(--brand-primary)] text-[length:var(--text-sm)]">{collection.label}</span>
                    </button>
                  {/each}
                  {#if filteredCollections.length === 0 && dropdownSearchQuery.trim()}
                    <div class="col-span-2 text-center py-4 text-[color:var(--text-secondary)]">
                      <p class="text-[length:var(--text-sm)]">No collections found</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'size'}
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Size filters">
                  {#each filteredSizes as size}
                    <button
                      onclick={() => handleSizeSelect(size)}
                      class="flex items-center justify-center p-3 h-10 min-h-10 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.size === size ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                      aria-label="Filter by size: {size}"
                      aria-pressed={appliedFilters?.size === size}
                    >
                      <span class="font-medium text-[length:var(--text-sm)]">{size}</span>
                    </button>
                  {/each}
                  {#if filteredSizes.length === 0}
                    <div class="col-span-full text-center py-4 text-[color:var(--text-secondary)]">
                      <p class="text-[length:var(--text-sm)]">{dropdownSearchQuery.trim() ? 'No sizes found' : 'No sizes available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'color'}
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Color filters">
                  {#each filteredColors as color}
                    <button
                      onclick={() => handleColorSelect(color)}
                      class="flex items-center gap-2 p-3 h-10 min-h-10 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.color === color ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                      aria-label="Filter by color: {color}"
                      aria-pressed={appliedFilters?.color === color}
                    >
                      <div class="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style="background-color: {color.toLowerCase()}"></div>
                      <span class="font-medium text-[length:var(--text-sm)]">{color}</span>
                    </button>
                  {/each}
                  {#if filteredColors.length === 0}
                    <div class="col-span-full text-center py-4 text-[color:var(--text-secondary)]">
                      <p class="text-[length:var(--text-sm)]">{dropdownSearchQuery.trim() ? 'No colors found' : 'No colors available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'brand'}
                <div class="grid grid-cols-1 gap-2" role="group" aria-label="Brand filters">
                  {#each filteredBrands as brand}
                    <button
                      onclick={() => handleBrandSelect(brand)}
                      class="flex items-center justify-between p-3 h-10 min-h-10 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group
                        {appliedFilters?.brand === brand ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}"
                      aria-label="Filter by brand: {brand}"
                      aria-pressed={appliedFilters?.brand === brand}
                    >
                      <span class="font-medium text-[color:var(--text-primary)] group-hover:text-[color:var(--brand-primary)] text-[length:var(--text-sm)]">{brand}</span>
                      {#if appliedFilters?.brand === brand}
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </button>
                  {/each}
                  {#if filteredBrands.length === 0}
                    <div class="text-center py-4 text-[color:var(--text-secondary)]">
                      <p class="text-[length:var(--text-sm)]">{dropdownSearchQuery.trim() ? 'No brands found' : 'No brands available'}</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'condition'}
                <div class="grid grid-cols-1 gap-2" role="group" aria-label="Condition filters">
                  {#each filteredConditions as condition}
                    <button
                      onclick={() => handleConditionSelect(condition)}
                      class="flex items-center justify-between p-3 h-10 min-h-10 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      aria-label="Filter by condition: {condition.label}"
                    >
                      <div>
                        <div class="font-medium text-[color:var(--text-primary)] group-hover:text-[color:var(--brand-primary)] text-[length:var(--text-sm)]">{condition.label}</div>
                        {#if condition.shortLabel && condition.shortLabel !== condition.label}
                          <div class="text-[length:var(--text-xs)] text-[color:var(--text-secondary)]">{condition.shortLabel ?? condition.label}</div>
                        {/if}
                      </div>
                    </button>
                  {/each}
                  {#if filteredConditions.length === 0 && dropdownSearchQuery.trim()}
                    <div class="text-center py-4 text-[color:var(--text-secondary)]">
                      <p class="text-[length:var(--text-sm)]">No conditions found</p>
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
      <div class="flex items-center justify-between px-1 py-2 text-[length:var(--text-sm)]">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0l-4 4m4-4l-4-4" />
          </svg>
        {#each categoryBreadcrumbs as crumb, index}
          <button
            onclick={() => handleBreadcrumbClick(crumb.level)}
            class="px-2 py-1 h-9 min-h-9 flex items-center text-[color:var(--text-secondary)] hover:text-[color:var(--brand-primary)] hover:bg-[color:var(--surface-subtle)] rounded-md transition-colors duration-200 font-medium
              {index === categoryBreadcrumbs.length - 1 ? 'text-blue-600' : 'hover:underline'}"
            aria-label={`Navigate to ${crumb.label} level`}
          >
            {crumb.label}
          </button>
          {#if index < categoryBreadcrumbs.length - 1}
            <svg class="w-3 h-3 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}
        {/each}
        <button
          onclick={() => {
            setFilter('category', null);
            setFilter('subcategory', null);
            setFilter('specific', null);
          }}
          class="ml-2 w-9 h-9 min-w-9 min-h-9 flex items-center justify-center text-[color:var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
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
          <div class="text-[length:var(--text-xs)] text-[color:var(--text-secondary)] font-medium" id="search-results-count" aria-live="polite">
            {currentResultCount.toLocaleString()} items
          </div>
        {/if}
      </div>
    {/if}

    <!-- Smart Filter Pills -->
    <nav id="category-pills" class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbarhide pb-[var(--gutter-xxs)] pt-[var(--gutter-xxs)]" aria-label="Smart category filters">
      <!-- Dynamic Category Pills -->
      {#each smartPillData?.pills || [] as pill, index}
        <CategoryPill
          variant={pill.active ? 'primary' : 'outline'}
          label={pill.label}
          emoji={pill.icon}
          onclick={() => handleSmartPillClick(pill.key, smartPillData?.level || 1)}
          class="shrink-0 min-h-11"
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index)}
        />
      {/each}

      <!-- Separator between category and condition pills -->
      {#if smartPillData?.pills?.length > 0 && conditionFilters?.length > 0}
        <div class="w-px h-6 bg-[color:var(--border-default)] mx-1"></div>
      {/if}

      <!-- Condition Pills -->
      {#each conditionFilters as condition, cIdx}
        <button
          type="button"
          onclick={() => handleConditionPillClick((condition.key ?? condition.value))}
          class="shrink-0 px-3 py-2 rounded-full text-[length:var(--text-xs)] font-semibold transition-all duration-200 min-h-11
            {appliedFilters?.condition === (condition.key ?? condition.value)
              ? 'bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] border border-[color:var(--brand-primary)]'
              : 'bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-base)]'}"
          aria-label={`Filter by ${condition.label}`}
          aria-pressed={appliedFilters?.condition === (condition.key ?? condition.value)}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, (mainCategories?.length || 0) + cIdx)}
        >
          {condition.shortLabel ?? condition.label}
        </button>
      {/each}
    </nav>

    <!-- Applied Filters -->
    {#if appliedFilters && Object.keys(appliedFilters).length > 0}
      <div class="pb-2">
        <AppliedFilterPills
          filters={appliedFilters}
          onRemoveFilter={onFilterRemove}
          onClearAll={onClearAllFilters}
        />
      </div>
    {/if}
  </div>
</div>



