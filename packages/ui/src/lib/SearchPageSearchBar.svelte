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

// Handle category dropdown
function handleCategoryDropdownToggle() {
  showCategoryDropdown = !showCategoryDropdown;
}

function handleCategoryDropdownClose() {
  showCategoryDropdown = false;
}

function handleMegaMenuCategorySelect(categorySlug: string) {
  onCategorySelect(categorySlug);
  handleCategoryDropdownClose();
}

// Handle filter pills
function handleCategoryPillClick(categoryKey: string) {
  onFilterChange('category', categoryKey);
}

function handleConditionPillClick(conditionKey: string) {
  const currentCondition = appliedFilters.condition;
  if (currentCondition === conditionKey) {
    onFilterRemove('condition');
  } else {
    onFilterChange('condition', conditionKey);
  }
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
  const category = appliedFilters.category;
  if (category) {
    const mainCat = mainCategories.find(c => c.key === category);
    if (mainCat) {
      return { label: mainCat.label, icon: mainCat.icon };
    }
    return { label: category, icon: '📂' };
  }
  return { label: i18n.filter_allCategories(), icon: '📂' };
});
</script>

<!-- Sticky Search Bar -->
<div class="bg-white/90 backdrop-blur-sm sticky z-50 border-b border-gray-100 shadow-sm" style="top: var(--app-header-offset, 56px) !important;">
  <div class="px-2 sm:px-4 lg:px-6 relative">
    <!-- Search Container -->
    <div class="py-2 relative search-dropdown-container">
      <SearchInput
        bind:searchValue={searchValue}
        placeholder={i18n.search_placeholder()}
        onSearch={onSearch}
        searchId="search-page-input"
        showDropdown={false}
      >
        {#snippet leftSection()}
          <button
            onclick={handleCategoryDropdownToggle}
            class="h-12 px-4 bg-transparent hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:bg-gray-50 border-r border-gray-200 rounded-l-lg"
            aria-expanded={showCategoryDropdown}
            aria-haspopup="listbox"
            aria-label="Select category"
          >
            <span class="text-lg" role="img" aria-hidden="true">{currentCategoryDisplay.icon}</span>
            <span class="text-sm font-medium text-gray-600 hidden sm:inline max-w-20 truncate">
              {currentCategoryDisplay.label}
            </span>
            <svg class="w-4 h-4 text-gray-600 transition-transform duration-200 {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        {/snippet}
      </SearchInput>

      <!-- MegaMenuCategories Dropdown -->
      {#if showCategoryDropdown}
        <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[70vh]">
          <MegaMenuCategories
            onCategoryClick={handleMegaMenuCategorySelect}
            onClose={handleCategoryDropdownClose}
            categories={megaMenuData}
            translations={{
              allCategories: i18n.filter_allCategories(),
              browseAll: i18n.search_all()
            }}
          />
        </div>
      {/if}
    </div>

    <!-- Quick Filter Pills -->
    <nav class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 pt-1" aria-label="Quick filters">
      <!-- Category Pills -->
      {#each mainCategories as category}
        <CategoryPill
          variant={appliedFilters.category === category.key ? 'primary' : 'outline'}
          label={category.label}
          emoji={category.icon}
          onclick={() => handleCategoryPillClick(category.key)}
          class="shrink-0"
        />
      {/each}

      <!-- Condition Pills -->
      {#each conditionFilters as condition}
        <button
          onclick={() => handleConditionPillClick(condition.key)}
          class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-9
            {appliedFilters.condition === condition.key
              ? 'bg-[color:var(--brand-primary)] text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
          aria-label={`Filter by ${condition.label}`}
        >
          {condition.shortLabel}
        </button>
      {/each}
    </nav>

    <!-- Applied Filters -->
    {#if Object.keys(appliedFilters).length > 0}
      <div class="pb-2">
        <AppliedFilterPills
          {appliedFilters}
          onRemoveFilter={onFilterRemove}
          onClearAll={onClearAllFilters}
          translations={{
            clearAll: i18n.filter_clearAll(),
            priceRange: i18n.filter_priceRange(),
            size: i18n.product_size(),
            condition: i18n.product_condition(),
            brand: i18n.product_brand(),
            category: i18n.product_category()
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