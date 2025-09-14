<script lang="ts">
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { CategoryService } from '$lib/services/categories';
import { ProfileService } from '$lib/services/profiles';
import { getCollectionsForContext } from '$lib/data/collections';
import { goto, preloadCode, preloadData } from '$app/navigation';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import SearchInput from './SearchInput.svelte';
import CategoryPill from './CategoryPill.svelte';

type Category = Database['public']['Tables']['categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

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
  name: string;
  avatar?: string | null;
  verified?: boolean;
  items: number;
  rating: number;
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
  supabase: SupabaseClient<Database>;
  searchQuery?: string;
  topBrands?: TopBrand[];
  topSellers?: TopSeller[];
  mainCategories?: Category[];
  virtualCategories?: Category[];
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
}

let {
  supabase,
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
  onPrefetchCategory
}: Props = $props();

// Component state
let showTrendingDropdown = $state(false);
let activeDropdownTab = $state('trending');
let dropdownSearchQuery = $state('');

// Derived data for dropdown
const filteredTopBrands = $derived(
  dropdownSearchQuery.trim()
    ? topBrands.filter(brand =>
        brand.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : topBrands
);

const filteredTopSellers = $derived(
  dropdownSearchQuery.trim()
    ? topSellers.filter(seller =>
        seller.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : topSellers
);

// Quick shop items
const quickShopItems = [
  { label: 'Under $25', description: 'Budget finds', filter: 'max_price=25', icon: '💰' },
  { label: 'Drip Collection', description: 'Staff picks', filter: 'collection=drip', icon: '💧' },
  { label: 'Designer $100+', description: 'Premium pieces', filter: 'min_price=100', icon: '💎' },
  { label: 'New with Tags', description: 'Brand new condition', filter: 'condition=brand_new_with_tags', icon: '🏷️' },
  { label: 'Like New', description: 'Excellent condition', filter: 'condition=like_new', icon: '✨' }
];

const filteredQuickShopItems = $derived(
  dropdownSearchQuery.trim()
    ? quickShopItems.filter(item =>
        item.label.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
      )
    : quickShopItems
);

// Handle click outside for trending dropdown
$effect(() => {
  if (typeof window !== 'undefined') {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('#hero-search-container')) {
        showTrendingDropdown = false;
      }
    }

    if (showTrendingDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }
});

// Hide trending dropdown when user starts typing in search
$effect(() => {
  if (searchQuery.trim()) {
    showTrendingDropdown = false;
  }
});

function handleQuickCondition(conditionKey: string) {
  onConditionFilter(conditionKey);
}

async function prefetchCategoryPage(categorySlug: string) {
  if (onPrefetchCategory) {
    onPrefetchCategory(categorySlug);
  } else {
    try {
      await preloadCode(`/category/${categorySlug}`);
      await preloadData(`/category/${categorySlug}`);
    } catch (e) {
      // Preload failed, but continue
    }
  }
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

<!-- Sticky Search + Category Navigation -->
<div class="bg-white/90 backdrop-blur-sm sticky z-50 border-b border-gray-100 shadow-sm" style="top: var(--app-header-offset, 56px) !important;">
  <div class="px-2 sm:px-4 lg:px-6">
    <div class="mx-auto relative">
      <!-- Hero Search -->
      <div id="hero-search-container" class="relative py-2">
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
              onclick={() => showTrendingDropdown = !showTrendingDropdown}
              class="h-12 px-4 bg-transparent hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:bg-gray-50 border-r border-gray-200 rounded-l-lg"
              aria-expanded={showTrendingDropdown}
              aria-haspopup="listbox"
              aria-label={i18n.search_categories()}
            >
              <span class="text-lg" role="img" aria-hidden="true">📂</span>
              <svg
                class="w-4 h-4 text-gray-600 transition-transform {showTrendingDropdown ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="text-sm font-medium text-gray-600 hidden sm:inline">{i18n.search_categories()}</span>
            </button>
          {/snippet}
        </SearchInput>

        {#if showTrendingDropdown}
          <div class="absolute top-full left-0 right-0 mt-1 z-50">
            <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div class="flex items-center gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
                <button
                  onclick={() => activeDropdownTab = 'trending'}
                  class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'trending' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                >
                  Top Brands
                </button>
                <button
                  onclick={() => activeDropdownTab = 'sellers'}
                  class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'sellers' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                >
                  Top Sellers
                </button>
                <button
                  onclick={() => activeDropdownTab = 'quickshop'}
                  class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'quickshop' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                >
                  Quick Shop
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
                    placeholder={activeDropdownTab === 'trending' ? 'Search brands...' :
                                activeDropdownTab === 'sellers' ? 'Search sellers...' :
                                'Search quick actions...'}
                    class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] focus:border-[color:var(--input-focus-border)] bg-gray-50 hover:bg-white transition-colors"
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

              {#if activeDropdownTab === 'trending'}
                <div class="space-y-2">
                  {#if filteredTopBrands.length > 0}
                    {#each filteredTopBrands as brand}
                      <button
                        onclick={() => {
                          goto(`/search?brand=${encodeURIComponent(brand.name)}`);
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      >
                        <img
                          src={brand.avatar || '/avatars/1.png'}
                          alt={brand.name}
                          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onerror={() => (this.src = '/avatars/1.png')}
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
                          goto(`/profile/${seller.name}`);
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                      >
                        <img
                          src={seller.avatar || '/avatars/1.png'}
                          alt={seller.name}
                          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onerror={() => (this.src = '/avatars/1.png')}
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
                            {#if seller.rating > 0}
                              <span>•</span>
                              <div class="flex items-center gap-1">
                                <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{seller.rating.toFixed(1)}</span>
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
                            goto('/drip');
                          } else if (item.filter === 'category=vintage') {
                            goto('/search?category=vintage');
                          } else {
                            goto(`/search?${item.filter}`);
                          }
                          showTrendingDropdown = false;
                        }}
                        class="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
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
        class="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 pt-1 sm:justify-center"
      >
        <!-- All Categories -->
        <CategoryPill
          variant="primary"
          label={i18n.search_all()}
          loading={loadingCategory === 'all'}
          disabled={loadingCategory === 'all'}
          ariaLabel={i18n.search_viewAll()}
          ariaCurrent={$page.url.pathname === '/search' ? 'page' : undefined}
          data-prefetch="hover"
          onmouseenter={() => preloadCode('/search')}
          ontouchstart={() => preloadCode('/search')}
          onclick={onNavigateToAll}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 0)}
        />

        <!-- Main Categories -->
        {#each mainCategories as category, index}
          <CategoryPill
            label={category.name}
            emoji={category.slug === 'women' ? '👗' : category.slug === 'men' ? '👔' : category.slug === 'kids' ? '👶' : category.slug === 'unisex' ? '🌍' : undefined}
            loading={loadingCategory === category.slug}
            disabled={loadingCategory === category.slug}
            ariaLabel={`Browse ${category.name}`}
            itemCount={category.product_count || 0}
            showItemCount={category.product_count > 0}
            data-prefetch="hover"
            data-category={category.slug}
            onmouseenter={() => prefetchCategoryPage(category.slug)}
            ontouchstart={() => prefetchCategoryPage(category.slug)}
            onclick={() => onCategorySelect(category.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index + 1)}
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
            itemCount={virtualCategory.product_count}
            showItemCount={true}
            data-prefetch="hover"
            data-category={virtualCategory.slug}
            onmouseenter={() => prefetchCategoryPage(virtualCategory.slug)}
            ontouchstart={() => prefetchCategoryPage(virtualCategory.slug)}
            onclick={() => onCategorySelect(virtualCategory.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, mainCategories.length + 1 + index)}
          />
        {/each}

        <!-- Condition Pills -->
        {#each conditionFilters as condition, index}
          <button
            onclick={() => handleQuickCondition(condition.key)}
            class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-9 relative overflow-hidden
              {selectedCondition === condition.key
                ? index === 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : index === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : index === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
            aria-label={`Filter by ${condition.label}`}
          >
            <span class="relative z-10 flex items-center gap-1">
              {#if index === 0}
                <span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-emerald-500'}"></span>
              {:else if index === 1}
                <span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-blue-500'}"></span>
              {:else if index === 2}
                <span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-amber-500'}"></span>
              {:else}
                <span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-slate-500'}"></span>
              {/if}
              {condition.shortLabel}
            </span>
          </button>
        {/each}
      </nav>
    </div>
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