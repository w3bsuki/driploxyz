<script lang="ts">
import type { Database } from '@repo/database';
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
  showFilterButton?: boolean;
  showPills?: boolean;
  onFilterClick?: () => void;
  sticky?: boolean;
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
  currentPath = '',
  showFilterButton = false,
  showPills = true,
  onFilterClick,
  sticky = true
}: Props = $props();


// Component state - simplified search type selector (Vinted-style)
let searchType = $state<'products' | 'sellers' | 'brands'>('products');
let showSearchTypeMenu = $state(false);

const searchTypeOptions = [
  { value: 'products', label: '👕', fullLabel: 'Products' },
  { value: 'sellers', label: '👤', fullLabel: 'Sellers' },
  { value: 'brands', label: '🏷️', fullLabel: 'Brands' }
] as const;

const currentSearchTypeOption = $derived(
  searchTypeOptions.find(opt => opt.value === searchType) || searchTypeOptions[0]
);

function selectSearchType(type: 'products' | 'sellers' | 'brands') {
  searchType = type;
  showSearchTypeMenu = false;
}

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
            {#if showFilterButton}
              <button
                type="button"
                onclick={onFilterClick}
                class="search-input__leading-action"
                aria-label="Open filters"
              >
                <span class="text-[length:var(--text-lg)]" style="line-height: 1;">⚙️</span>
              </button>
            {:else}
              <!-- Vinted-style search type dropdown -->
              <div class="relative">
                <button
                  type="button"
                  onclick={() => showSearchTypeMenu = !showSearchTypeMenu}
                  class="flex items-center justify-center w-10 h-10 text-[length:var(--text-lg)] hover:bg-[color:var(--surface-subtle)] rounded-l-[var(--radius-md)] transition-colors"
                  aria-label="Search type: {currentSearchTypeOption.fullLabel}"
                  aria-expanded={showSearchTypeMenu}
                  aria-haspopup="listbox"
                >
                  {currentSearchTypeOption.label}
                </button>
                
                {#if showSearchTypeMenu}
                  <!-- Backdrop to close menu -->
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div 
                    class="fixed inset-0 z-40" 
                    onclick={() => showSearchTypeMenu = false}
                  ></div>
                  
                  <!-- Dropdown menu -->
                  <div 
                    class="absolute left-0 top-full mt-1 bg-[color:var(--surface-base)] border border-[color:var(--border-default)] rounded-[var(--radius-md)] shadow-lg z-50 min-w-[140px] py-1"
                    role="listbox"
                    aria-label="Select search type"
                  >
                    {#each searchTypeOptions as option}
                      <button
                        type="button"
                        role="option"
                        aria-selected={searchType === option.value}
                        onclick={() => selectSearchType(option.value)}
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[color:var(--surface-subtle)] transition-colors
                          {searchType === option.value ? 'bg-[color:var(--surface-brand-subtle)] text-[color:var(--brand-primary)]' : 'text-[color:var(--text-primary)]'}"
                      >
                        <span class="text-base">{option.label}</span>
                        <span>{option.fullLabel}</span>
                        {#if searchType === option.value}
                          <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          {/snippet}
        </SearchInput>
      </div>

      <!-- Category Pills -->
      {#if showPills}
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
      {/if}
    </div>
  </div>
</div>

