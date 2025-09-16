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

// Handle filter pills
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

// Determine current category for display
const currentCategoryDisplay = $derived(() => {
  const category = appliedFilters?.category;
  if (category) {
    const mainCat = mainCategories.find(c => c.key === category);
    if (mainCat) {
      return { label: mainCat.label, icon: mainCat.icon };
    }
    return { label: category, icon: '📂' };
  }
  return {
    label: typeof i18n?.filter_allCategories === 'function' ? i18n.filter_allCategories() : 'All Categories',
    icon: '📂'
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
          <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <!-- Tab Headers -->
            <div class="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                onclick={() => activeDropdownTab = 'categories'}
                class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Categories
              </button>
              <button
                onclick={() => activeDropdownTab = 'collections'}
                class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'collections' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
              >
                Collections
              </button>
              <button
                onclick={() => activeDropdownTab = 'condition'}
                class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'condition' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
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

    <!-- Quick Filter Pills -->
    <nav id="category-pills" class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-[var(--gutter-xxs)] pt-[var(--gutter-xxs)]" aria-label="Quick filters">
      <!-- Category Pills -->
      {#each mainCategories as category, index}
        <CategoryPill
          variant={appliedFilters?.category === category.key ? 'primary' : 'outline'}
          label={category.label}
          emoji={category.icon}
          onclick={() => handleCategoryPillClick(category.key)}
          class="shrink-0 min-h-11"
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index)}
        />
      {/each}

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
