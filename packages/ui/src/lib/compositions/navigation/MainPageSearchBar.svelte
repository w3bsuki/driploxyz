<script lang="ts">
import type { Database } from '@repo/database';
import SearchInput from '../../compositions/forms/SearchInput.svelte';
import CategoryPill from '../../primitives/pill/CategoryPill.svelte';

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
  currentPath = ''
}: Props = $props();


// Component state
let showTrendingDropdown = $state(false);
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

// Quick shop items
const quickShopItems = [
  { label: 'Under $25', description: 'Budget finds', filter: 'max_price=25', icon: '💰' },
  { label: 'Drip Collection', description: 'Staff picks', filter: 'collection=drip', icon: '💧' },
  { label: 'Designer $100+', description: 'Premium pieces', filter: 'min_price=100', icon: '💎' },
  { label: 'New with Tags', description: 'Brand new condition', filter: 'condition=brand_new_with_tags', icon: '🏷️' },
  { label: 'Like New', description: 'Excellent condition', filter: 'condition=like_new', icon: '✨' }
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

// Hide trending dropdown when user starts typing - use derived instead of effect
const shouldHideTrendingDropdown = $derived(searchQuery.trim().length > 0);

// Update showTrendingDropdown based on derived value
$effect(() => {
  if (shouldHideTrendingDropdown) {
    showTrendingDropdown = false;
  }
});

// Handle click outside for trending dropdown - effect for DOM listeners only
$effect(() => {
  if (typeof window !== 'undefined' && showTrendingDropdown) {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#hero-search-container')) {
        showTrendingDropdown = false;
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
    const totalPills = mainCategories.length + 1 + virtualCategories.length;

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
        >
          {#snippet leftSection()}
            <button
              type="button"
              onclick={() => showTrendingDropdown = !showTrendingDropdown}
              class="h-11 px-3 bg-transparent hover:bg-[color:var(--surface-subtle)] transition-all duration-200 flex items-center gap-2 focus:outline-none focus:bg-[color:var(--surface-subtle)] border-r border-[color:var(--border-subtle)] rounded-l-[var(--input-radius)] focus-visible:ring-2 focus-visible:ring-[color:var(--input-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-emphasis)]"
              aria-expanded={showTrendingDropdown}
              aria-haspopup="listbox"
              aria-label={i18n.search_categories()}
            >
              <span class="text-sm font-medium text-[color:var(--text-secondary)]">{i18n.menu_browse()}</span>
              <svg class="w-3 h-3 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          {/snippet}
        </SearchInput>

        {#if showTrendingDropdown}
          <div class="absolute top-full left-0 right-0 mt-1 z-50">
            <div class="bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-[var(--radius-sm)] shadow-lg p-[var(--space-4)] min-h-[300px] max-h-[80vh] overflow-y-auto">
              <div class="flex items-center gap-1 mb-3 bg-[color:var(--surface-subtle)] p-1 rounded-[var(--radius-sm)]">
                <button
                  onclick={() => activeDropdownTab = 'trending'}
                  class="flex-1 px-4 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-200 {activeDropdownTab === 'trending' ? 'bg-[color:var(--surface-base)] text-[color:var(--text-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}"
                >
                  {i18n.nav_topBrands()}
                </button>
                <button
                  onclick={() => activeDropdownTab = 'sellers'}
                  class="flex-1 px-4 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-200 {activeDropdownTab === 'sellers' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                >
                  {i18n.nav_topSellers()}
                </button>
                <button
                  onclick={() => activeDropdownTab = 'quickshop'}
                  class="flex-1 px-4 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-200 {activeDropdownTab === 'quickshop' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                >
                  {i18n.nav_quickShop()}
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
                    placeholder={activeDropdownTab === 'trending' ? 'Search brands...' :
                                activeDropdownTab === 'sellers' ? 'Search sellers...' :
                                'Search quick actions...'}
                    class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] focus:border-[color:var(--input-focus-border)] bg-gray-50 hover:bg-white transition-colors"
                  />
                  {#if dropdownSearchQuery.trim()}
                    <button
                      onclick={() => dropdownSearchQuery = ''}
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search input"
                      type="button"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>

              {#if activeDropdownTab === 'trending'}
                <div class="space-y-2">
                  {#if filteredTopBrands.length > 0}
                    {#each filteredTopBrands as brand}
                      <button
                        onclick={() => {
                          onNavigateToBrand?.(brand.name);
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-[var(--radius-sm)] border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      >
                        <img
                          src={brand.avatar || '/avatars/1.png'}
                          alt={brand.name}
                          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onerror={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/avatars/1.png';
                          }}
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)]">{brand.name}</span>
                            {#if brand.verified}
                              <svg class="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                            {/if}
                            <span class="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{brand.trending}</span>
                          </div>
                          <span class="text-xs text-gray-500">{brand.items} items</span>
                        </div>
                      </button>
                    {/each}
                  {:else if dropdownSearchQuery.trim()}
                    <div class="text-center py-8 text-gray-500">
                      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <p class="text-sm">No brands found matching "{dropdownSearchQuery}"</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'sellers'}
                <div class="space-y-2">
                  {#if filteredTopSellers.length > 0}
                    {#each filteredTopSellers as seller}
                      <button
                        onclick={() => {
                          onNavigateToSeller?.(seller.name ?? seller.username ?? "");
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-[var(--radius-sm)] border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      >
                        <img
                          src={seller.avatar || '/avatars/1.png'}
                          alt={seller.name}
                          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onerror={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/avatars/1.png';
                          }}
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)] truncate">{seller.name}</span>
                            {#if seller.verified}
                              <svg class="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                            {/if}
                          </div>
                          <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span>{seller.items} items</span>
                            {#if seller.rating && seller.rating > 0}
                              <span>•</span>
                              <div class="flex items-center gap-1">
                                <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{seller.rating?.toFixed(1)}</span>
                              </div>
                            {/if}
                          </div>
                        </div>
                      </button>
                    {/each}
                  {:else if dropdownSearchQuery.trim()}
                    <div class="text-center py-8 text-gray-500">
                      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <p class="text-sm">No sellers found matching "{dropdownSearchQuery}"</p>
                    </div>
                  {/if}
                </div>
              {:else if activeDropdownTab === 'quickshop'}
                <div class="space-y-2">
                  {#if filteredQuickShopItems.length > 0}
                    {#each filteredQuickShopItems as item}
                      <button
                        onclick={() => {
                          if (item.filter === 'collection=drip') {
                            onNavigateToDrip?.();
                          } else {
                            onNavigateToQuickShop?.(item.filter);
                          }
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-[var(--radius-sm)] border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      >
                        <span class="text-lg">{item.icon}</span>
                        <div class="flex-1 min-w-0">
                          <span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)] block">{item.label}</span>
                          <span class="text-xs text-gray-500">{item.description}</span>
                        </div>
                      </button>
                    {/each}
                  {:else if dropdownSearchQuery.trim()}
                    <div class="text-center py-8 text-gray-500">
                      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <p class="text-sm">No quick actions found matching "{dropdownSearchQuery}"</p>
                    </div>
                  {/if}
                </div>
              {/if}
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

        <!-- Virtual Categories -->
        {#each virtualCategories as virtualCategory, index}
          <CategoryPill
            variant="outline"
            label={virtualCategory.name}
            loading={loadingCategory === virtualCategory.slug}
            disabled={loadingCategory === virtualCategory.slug}
            ariaLabel={`Browse ${virtualCategory.name}`}
            itemCount={virtualCategory.product_count || 0}
            showItemCount={true}
            data-prefetch="hover"
            data-category={virtualCategory.slug}
            onmouseenter={() => prefetchCategoryPage(virtualCategory.slug)}
            ontouchstart={() => prefetchCategoryPage(virtualCategory.slug)}
            onclick={() => onCategorySelect(virtualCategory.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, mainCategories.length + 1 + index)}
            class="min-h-11"
          />
        {/each}

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

