<script lang="ts">
import type { Database } from '@repo/database';
import { slide } from 'svelte/transition';
import * as SearchInputMod from '../../compositions/forms/SearchInput.svelte';
const SearchInput = (SearchInputMod as any).default ?? (SearchInputMod as any);
import * as CategoryPillMod from '../../primitives/pill/CategoryPill.svelte';
const CategoryPill = (CategoryPillMod as any).default ?? (CategoryPillMod as any);

type Category = Database['public']['Tables']['categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended category with UI-specific fields
interface CategoryWithCount extends Category {
  product_count?: number;
}

interface TopBrand {
  id: string;
  name: string;
  avatar?: string | null;
  verified?: boolean;
  trending: string;
  items: number;
}

interface TopSeller {
  id: string;
  username: string;
  display_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  name?: string | null; // Computed from display_name || full_name || username
  avatar?: string | null; // Alias for avatar_url
  verified?: boolean;
  items?: number;
  product_count?: number;
  rating?: number;
}

interface QuickShopItem {
  label: string;
  description: string;
  filter: string;
  icon: string;
}

interface ConditionFilter {
  key: string;
  label: string;
  shortLabel: string;
}

interface Props {
  searchQuery?: string;
  topBrands?: TopBrand[];
  topSellers?: TopSeller[];
  mainCategories?: CategoryWithCount[];
  virtualCategories?: CategoryWithCount[];
  conditionFilters?: ConditionFilter[];
  i18n: any;
  currentLang?: string;
  selectedCondition?: string | null;
  loadingCategory?: string | null;
  onSearch: (query: string) => void;
  onQuickSearch?: (query: string) => Promise<{ data: any[]; error: string | null }>;
  onCategorySelect: (slug: string) => void;
  onConditionFilter: (condition: string) => void;
  onNavigateToAll: () => void;
  onPillKeyNav?: (e: KeyboardEvent, index: number) => void;
  onPrefetchCategory?: (slug: string) => void;
  onPrefetchSearch?: () => void;
  onNavigateToBrand?: (brandName: string) => void;
  onNavigateToSeller?: (sellerName: string) => void;
  onNavigateToDrip?: () => void;
  onNavigateToQuickShop?: (filter: string) => void;
  // New: navigation to list pages
  onNavigateToSellersList?: () => void;
  onNavigateToBrandsList?: () => void;
  currentPath?: string;
}

let {
  searchQuery = $bindable(''),
  topBrands = [],
  topSellers = [],
  mainCategories = [],
  virtualCategories = [],
  conditionFilters = [],
  i18n,
  currentLang = 'bg',
  selectedCondition = null,
  loadingCategory = null,
  onSearch,
  onQuickSearch,
  onCategorySelect,
  onConditionFilter,
  onNavigateToAll,
  onPillKeyNav,
  onPrefetchCategory,
  onPrefetchSearch,
  onNavigateToBrand,
  onNavigateToSeller,
  onNavigateToDrip,
  onNavigateToQuickShop,
  onNavigateToSellersList,
  onNavigateToBrandsList,
  currentPath = ''
}: Props = $props();


// Component state
let showSearchTypeDropdown = $state(false);
let searchType = $state<'products' | 'sellers' | 'brands'>('products');
let activeDropdownTab = $state('trending');
let dropdownSearchQuery = $state('');

// Optimized derived data for dropdown - using $derived.by() for better performance
const filteredTopBrands = $derived.by(() => {
  if (!dropdownSearchQuery.trim()) return topBrands;
  const query = dropdownSearchQuery.toLowerCase();
  return topBrands.filter(brand =>
    brand.name.toLowerCase().includes(query)
  );
});

const filteredTopSellers = $derived.by(() => {
  if (!dropdownSearchQuery.trim()) return topSellers;
  const query = dropdownSearchQuery.toLowerCase();
  return topSellers.filter(seller => {
    const name = seller.name || seller.display_name || seller.username || '';
    return name.toLowerCase().includes(query);
  });
});

// Quick shop items (localized)
const quickShopItems = [
  { label: i18n.quick_under25?.() ?? 'Under $25', description: i18n.quick_budgetFinds?.() ?? 'Budget finds', filter: 'max_price=25', icon: '💰' },
  { label: i18n.quick_dripCollection?.() ?? 'Drip Collection', description: i18n.quick_staffPicks?.() ?? 'Staff picks', filter: 'collection=drip', icon: '💧' },
  { label: i18n.quick_designer100?.() ?? 'Designer $100+', description: i18n.quick_premiumPieces?.() ?? 'Premium pieces', filter: 'min_price=100', icon: '💎' },
  { label: i18n.condition_newWithTags?.() ?? 'New with Tags', description: i18n.quick_brandNewCondition?.() ?? 'Brand new condition', filter: 'condition=brand_new_with_tags', icon: '🏷️' },
  { label: i18n.condition_likeNew?.() ?? 'Like New', description: i18n.quick_excellentCondition?.() ?? 'Excellent condition', filter: 'condition=like_new', icon: '✨' }
];

// Optimized quick shop items filtering
const filteredQuickShopItems = $derived.by(() => {
  if (!dropdownSearchQuery.trim()) return quickShopItems;
  const query = dropdownSearchQuery.toLowerCase();
  return quickShopItems.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
});

// Track last query to hide dropdown only when the user changes the search text while the panel is open
let lastSearchQuery = $state(searchQuery.trim());

$effect(() => {
  const normalizedQuery = searchQuery.trim();

  if (showSearchTypeDropdown && normalizedQuery !== lastSearchQuery) {
    showSearchTypeDropdown = false;
  }

  lastSearchQuery = normalizedQuery;
});

// Handle click outside for search type dropdown
$effect(() => {
  if (typeof window !== 'undefined' && showSearchTypeDropdown) {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#hero-search-container')) {
        showSearchTypeDropdown = false;
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }
});

function handleQuickCondition(conditionKey: string) {
  onConditionFilter(conditionKey);
}

function prefetchCategoryPage(categorySlug: string) {
  if (onPrefetchCategory) {
    onPrefetchCategory(categorySlug);
  }
  // Note: UI package components should use callback props for navigation/prefetching
}

function handlePillKeyNav(e: KeyboardEvent, index: number) {
  if (onPillKeyNav) {
    onPillKeyNav(e, index);
  } else {
    const pills = document.querySelectorAll('#category-pills button');
    const totalPills = pills.length; // use actual count for robustness

    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = Math.min(index + 1, totalPills - 1);
        (pills[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        (pills[prevIndex] as HTMLElement)?.focus();
        break;
      case 'Home':
        e.preventDefault();
        (pills[0] as HTMLElement)?.focus();
        break;
      case 'End':
        e.preventDefault();
        (pills[totalPills - 1] as HTMLElement)?.focus();
        break;
    }
  }
}
</script>

<!-- Sticky Search + Category Navigation (compact) -->
<div class="bg-[color:var(--surface-base)] sticky top-[var(--app-header-offset)] z-40 border-b border-[color:var(--border-subtle)]">
  <div class="px-2 sm:px-4 lg:px-6 py-[var(--gutter-xxs)] sm:py-[var(--gutter-xs)]">
    <div class="mx-auto relative">
      <!-- Hero Search -->
      <div id="hero-search-container" class="relative py-0">
        <SearchInput
          bind:searchValue={searchQuery}
          onSearch={onSearch}
          placeholder={i18n.search_placeholder()}
          searchId="hero-search-input"
          searchFunction={onQuickSearch}
          showDropdown={true}
          maxResults={6}
          mode="compact"
        >
          {#snippet leftSection()}
            <button
              type="button"
              onclick={() => showSearchTypeDropdown = !showSearchTypeDropdown}
              class="search-input__leading-action"
              aria-expanded={showSearchTypeDropdown}
              aria-haspopup="listbox"
              aria-label={searchType === 'products' ? 'Searching products' : searchType === 'sellers' ? 'Searching sellers' : 'Searching brands'}
            >
              {#if searchType === 'products'}
                <span class="text-[length:var(--text-lg)]" style="line-height: 1;">🛍️</span>
              {:else if searchType === 'sellers'}
                <span class="text-[length:var(--text-lg)]" style="line-height: 1;">👤</span>
              {:else}
                <span class="text-[length:var(--text-lg)]" style="line-height: 1;">🏷️</span>
              {/if}
              <svg class:rotate-180={showSearchTypeDropdown} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          {/snippet}
        </SearchInput>

        {#if showSearchTypeDropdown}
          <div class="absolute top-full left-0 mt-1 z-50 w-[200px]" transition:slide={{ duration: 200 }}>
            <div class="bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-hidden">
              <button
                type="button"
                onclick={() => { searchType = 'products'; showSearchTypeDropdown = false; searchQuery = ''; }}
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-muted)] transition-colors text-left"
                class:bg-[color:var(--surface-brand-subtle)]={searchType === 'products'}
                class:text-[color:var(--text-brand)]={searchType === 'products'}
              >
                <span class="text-lg">🛍️</span>
                <span class="font-medium text-sm flex-1">{i18n.search_products?.() ?? 'Products'}</span>
                {#if searchType === 'products'}
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
              
              <button
                type="button"
                onclick={() => { searchType = 'sellers'; showSearchTypeDropdown = false; searchQuery = ''; }}
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-muted)] transition-colors text-left"
                class:bg-[color:var(--surface-brand-subtle)]={searchType === 'sellers'}
                class:text-[color:var(--text-brand)]={searchType === 'sellers'}
              >
                <span class="text-lg">👤</span>
                <span class="font-medium text-sm flex-1">{i18n.search_sellers?.() ?? 'Sellers'}</span>
                {#if searchType === 'sellers'}
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
              
              <button
                type="button"
                onclick={() => { searchType = 'brands'; showSearchTypeDropdown = false; searchQuery = ''; }}
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-muted)] transition-colors text-left"
                class:bg-[color:var(--surface-brand-subtle)]={searchType === 'brands'}
                class:text-[color:var(--text-brand)]={searchType === 'brands'}
              >
                <span class="text-lg">🏷️</span>
                <span class="font-medium text-sm flex-1">{i18n.search_brands?.() ?? 'Brands'}</span>
                {#if searchType === 'brands'}
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Category Pills -->
      <nav
        id="category-pills"
        aria-label={i18n.nav_browseCategories()}
        class="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto scrollbarhide pt-[var(--gutter-xxs)] pb-[var(--gutter-xxs)] sm:justify-center"
      >
        <!-- All Categories -->
        <CategoryPill
          variant="muted"
          label={i18n.search_all()}
          loading={loadingCategory === 'all'}
          disabled={loadingCategory === 'all'}
          ariaLabel={i18n.search_viewAll()}
          ariaCurrent={currentPath === '/search' ? 'page' : undefined}
          data-prefetch="hover"
          onmouseenter={() => onPrefetchSearch?.()}
          ontouchstart={() => onPrefetchSearch?.()}
          onclick={onNavigateToAll}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 0)}
          class="min-h-11"
        />

        <!-- Main Categories -->
        {#each mainCategories as category, index}
          <CategoryPill
            label={category.name}
            loading={loadingCategory === category.slug}
            disabled={loadingCategory === category.slug}
            ariaLabel={`Browse ${category.name}`}
            itemCount={category.product_count || 0}
            showItemCount={(category.product_count || 0) > 0}
            data-prefetch="hover"
            data-category={category.slug}
            onmouseenter={() => prefetchCategoryPage(category.slug)}
            ontouchstart={() => prefetchCategoryPage(category.slug)}
            onclick={() => onCategorySelect(category.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index + 1)}
            class="min-h-11"
          />
        {/each}

        <!-- Special destination pills: Top Sellers and Top Brands -->
        <CategoryPill
          variant="outline"
          label={i18n.search_topSellers?.() || 'Top Sellers'}
          emoji="👑"
          ariaLabel={i18n.search_topSellers?.() || 'Top Sellers'}
          onclick={() => onNavigateToSellersList?.()}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, mainCategories.length + 1)}
          class="min-h-11"
        />
        <CategoryPill
          variant="outline"
          label={i18n.nav_topBrands?.() || 'Top Brands'}
          emoji="🏷️"
          ariaLabel={i18n.nav_topBrands?.() || 'Top Brands'}
          onclick={() => onNavigateToBrandsList?.()}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, mainCategories.length + 2)}
          class="min-h-11"
        />

        <!-- Condition Pills -->
        {#each conditionFilters as condition, index}
          <CategoryPill
            variant={selectedCondition === condition.key ? 'primary' : 'secondary'}
            label={condition.shortLabel}
            emoji={index === 0 ? '🏷️' : index === 1 ? '💎' : '👍'}
            ariaLabel={`Filter by ${condition.label}`}
            onclick={() => handleQuickCondition(condition.key)}
            class="min-h-11"
          />
        {/each}
      </nav>
    </div>
  </div>
</div>

