<script lang="ts">
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
    searchValue?: string;
    megaMenuData?: CategoryWithChildren[];
    mainCategories?: MainCategory[];
    conditionFilters?: FilterPillData[];
    appliedFilters?: Record<string, any>;
    currentCategory?: string | null;
    i18n: any;
    onSearch: (query: string) => void;
    onQuickSearch?: (query: string) => Promise<{ data: any[]; error: string | null }>;
    onCategorySelect: (categorySlug: string, level: number, path: string[]) => void;
    onFilterChange: (key: string, value: any) => void;
    onFilterRemove: (key: string) => void;
    onClearAllFilters: () => void;
    enableQuickResults?: boolean;
  }

  let {
    searchValue = $bindable(''),
    megaMenuData = [],
    mainCategories = [],
    conditionFilters = [],
    appliedFilters = {},
    currentCategory = null,
    i18n,
    onSearch,
    onQuickSearch,
    onCategorySelect,
    onFilterChange,
    onFilterRemove,
    onClearAllFilters,
    enableQuickResults = true
  }: Props = $props();

// Component state using Svelte 5 runes
let showCategoryDropdown = $state(false);
  let isNavigating = $state(false);
  let selectedPillIndex = $state(-1);

// Enhanced category display logic
const currentCategoryDisplay = $derived(() => {
  // If we have a specific category path, show it
  if (appliedFilters?.specific) {
    // Find the specific item in the hierarchy to get proper display name
    for (const l1Cat of megaMenuData) {
      for (const l2Cat of l1Cat.children || []) {
        for (const l3Cat of l2Cat.children || []) {
          if (l3Cat.slug === appliedFilters.specific) {
            return {
              label: `${l1Cat.name} → ${l2Cat.name} → ${l3Cat.name}`,
              icon: getCategoryIcon(l1Cat.name),
              breadcrumb: [l1Cat.name, l2Cat.name, l3Cat.name]
            };
          }
        }
      }
    }
  }

  // If we have a subcategory, show the path
  if (appliedFilters?.subcategory) {
    for (const l1Cat of megaMenuData) {
      for (const l2Cat of l1Cat.children || []) {
        if (l2Cat.slug === appliedFilters.subcategory) {
          return {
            label: `${l1Cat.name} → ${l2Cat.name}`,
            icon: getCategoryIcon(l1Cat.name),
            breadcrumb: [l1Cat.name, l2Cat.name]
          };
        }
      }
    }
  }

  // If we have a main category, show it
  if (appliedFilters?.category) {
    const mainCat = mainCategories.find(c => c.key === appliedFilters.category);
    if (mainCat) {
      return {
        label: mainCat.label,
        icon: mainCat.icon,
        breadcrumb: [mainCat.label]
      };
    }
    // Fallback to megaMenuData
    const megaCat = megaMenuData.find(c => c.slug === appliedFilters.category);
    if (megaCat) {
      return {
        label: megaCat.name,
        icon: getCategoryIcon(megaCat.name),
        breadcrumb: [megaCat.name]
      };
    }
  }

  return {
    label: i18n.filter_allCategories ? i18n.filter_allCategories() : 'All Categories',
    icon: '📂',
    breadcrumb: []
  };
});

// Get category icon helper
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Women': '👗',
    'Men': '👔',
    'Kids': '👶',
    'Unisex': '🌍',
    'Clothing': '👕',
    'Shoes': '👟',
    'Accessories': '💍',
    'Bags': '👜'
  };
  return iconMap[categoryName] || '📂';
}

// Category dropdown handlers
function handleCategoryDropdownToggle(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  showCategoryDropdown = !showCategoryDropdown;
}

function handleCategoryDropdownClose() {
  showCategoryDropdown = false;
}

// Enhanced category selection handler
function handleMegaMenuCategorySelect(categorySlug: string, level: number, path: string[]) {
  isNavigating = true;

  // Call the parent handler with full context
  onCategorySelect(categorySlug, level, path);

  // Close dropdown
  handleCategoryDropdownClose();

  // Reset navigation state
  setTimeout(() => {
    isNavigating = false;
  }, 300);
}

// Handle filter pills
function handleCategoryPillClick(categoryKey: string) {
  const currentCategory = appliedFilters?.category;
  if (currentCategory === categoryKey) {
    // Deselect if same category
    onClearAllFilters();
  } else {
    // Select new category - this will be a level 1 selection
    onCategorySelect(categoryKey, 1, [categoryKey]);
  }
}

  function handleConditionPillClick(conditionKey: string) {
  const currentCondition = appliedFilters?.condition;
  if (currentCondition === conditionKey) {
    onFilterRemove('condition');
  } else {
    onFilterChange('condition', conditionKey);
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
}

// Handle click outside for category dropdown
$effect(() => {
  if (typeof window !== 'undefined') {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-search-dropdown-container')) {
        showCategoryDropdown = false;
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }
});

// Active filter count for display
const activeFilterCount = $derived(() => {
  if (!appliedFilters) return 0;

  return [
    appliedFilters.category ? 1 : 0,
    appliedFilters.subcategory ? 1 : 0,
    appliedFilters.specific ? 1 : 0,
    (appliedFilters.size && appliedFilters.size !== 'all') ? 1 : 0,
    (appliedFilters.brand && appliedFilters.brand !== 'all') ? 1 : 0,
    (appliedFilters.condition && appliedFilters.condition !== 'all') ? 1 : 0,
    (appliedFilters.minPrice || appliedFilters.maxPrice) ? 1 : 0,
    (appliedFilters.sortBy && appliedFilters.sortBy !== 'relevance') ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);
});
</script>

<!-- Category-Specific Sticky Search Bar (compact) -->
<div class="bg-[color:var(--surface-base)]/90 supports-[backdrop-filter]:backdrop-blur-sm sticky z-40 border-b border-[color:var(--border-subtle)]" style="top: var(--app-header-offset, 56px) !important;">
  <div class="px-2 sm:px-4 lg:px-6 relative py-[var(--gutter-xxs)] sm:py-[var(--gutter-xs)]">
    <!-- Search Container with Advanced Category Navigation -->
    <div class="py-0 relative category-search-dropdown-container">
      <SearchInput
        bind:searchValue={searchValue}
        placeholder={i18n.search_placeholder ? i18n.search_placeholder() : 'Search in category...'}
        onSearch={onSearch}
        searchId="category-search-input"
        showDropdown={enableQuickResults}
        searchFunction={onQuickSearch}
        maxResults={6}
      >
        {#snippet leftSection()}
          <button
            onclick={handleCategoryDropdownToggle}
            type="button"
            class="h-11 px-4 bg-transparent hover:bg-[color:var(--surface-subtle)] transition-all duration-200 flex items-center gap-2 focus:outline-none focus:bg-[color:var(--surface-subtle)] border-r border-[color:var(--border-subtle)] rounded-l-lg min-w-0 flex-shrink-0"
            class:animate-pulse={isNavigating}
            aria-expanded={showCategoryDropdown}
            aria-haspopup="listbox"
            aria-label="Select category"
            disabled={isNavigating}
          >
            <span class="text-lg flex-shrink-0" role="img" aria-hidden="true">{currentCategoryDisplay.icon}</span>
            <div class="flex flex-col items-start min-w-0 hidden sm:flex">
              {#if currentCategoryDisplay.breadcrumb && currentCategoryDisplay.breadcrumb.length > 1}
                <span class="text-xs text-[color:var(--text-tertiary)] truncate max-w-32">
                  {currentCategoryDisplay.breadcrumb.slice(0, -1).join(' → ')}
                </span>
                <span class="text-sm font-medium text-[color:var(--text-primary)] truncate max-w-32">
                  {currentCategoryDisplay.breadcrumb[currentCategoryDisplay.breadcrumb.length - 1]}
                </span>
              {:else}
                <span class="text-sm font-medium text-[color:var(--text-secondary)] truncate max-w-32">
                  {currentCategoryDisplay.label}
                </span>
              {/if}
            </div>
            <svg class="w-4 h-4 text-[color:var(--text-secondary)] transition-transform duration-200 flex-shrink-0 {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        {/snippet}
      </SearchInput>

      <!-- Enhanced MegaMenuCategories Dropdown -->
      {#if showCategoryDropdown}
        <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[70vh]">
          <MegaMenuCategories
            onCategoryClick={handleMegaMenuCategorySelect}
            onClose={handleCategoryDropdownClose}
            categories={megaMenuData}
            translations={{
              allCategories: i18n.filter_allCategories ? i18n.filter_allCategories() : 'All Categories',
              browseAll: i18n.search_all ? i18n.search_all() : 'Browse All',
              back: i18n.common_back ? i18n.common_back() : 'Back',
              items: i18n.search_items ? i18n.search_items() : 'items',
              women: i18n.category_women ? i18n.category_women() : 'Women',
              men: i18n.category_men ? i18n.category_men() : 'Men',
              kids: i18n.category_kids ? i18n.category_kids() : 'Kids',
              unisex: i18n.category_unisex ? i18n.category_unisex() : 'Unisex',
              clothing: i18n.category_clothing ? i18n.category_clothing() : 'Clothing',
              shoes: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes',
              accessories: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories',
              bags: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags'
            }}
          />
        </div>
      {/if}
    </div>

    <!-- Enhanced Quick Filter Pills -->
    <nav id="category-pills" class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-[var(--gutter-xxs)] pt-[var(--gutter-xxs)]" aria-label="Quick filters">
      <!-- Main Category Pills -->
      {#each mainCategories as category}
        <CategoryPill
          variant={appliedFilters?.category === category.key ? 'primary' : 'outline'}
          label={category.label}
          emoji={category.icon}
          onclick={() => handleCategoryPillClick(category.key)}
          class="shrink-0 min-h-11"
          disabled={isNavigating}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index)}
        />
      {/each}

      <!-- Condition Pills -->
      {#each conditionFilters as condition, cIdx}
        <button
          type="button"
          onclick={() => handleConditionPillClick(condition.key)}
          disabled={isNavigating}
            class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-11 disabled:opacity-50 disabled:cursor-not-allowed
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

    <!-- Applied Filters with Enhanced Category Display -->
    {#if activeFilterCount > 0}
      <div class="pb-2">
        <AppliedFilterPills
          filters={appliedFilters || {}}
          categoryLabels={{
            women: i18n.category_women ? i18n.category_women() : 'Women',
            men: i18n.category_men ? i18n.category_men() : 'Men',
            kids: i18n.category_kids ? i18n.category_kids() : 'Kids',
            unisex: i18n.category_unisex ? i18n.category_unisex() : 'Unisex'
          }}
          onRemoveFilter={onFilterRemove}
          onClearAll={onClearAllFilters}
          clearAllLabel={i18n.filter_clearAll ? i18n.filter_clearAll() : 'Clear All'}
          class="justify-start"
          maxDisplay={5}
          showMore={false}
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

  .animate-pulse {
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
</style>
