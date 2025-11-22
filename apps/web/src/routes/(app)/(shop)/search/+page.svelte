<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import * as i18n from '@repo/i18n';
  
  import { 
    ProductCard, 
    ProductCardSkeleton,
    BottomNav,
    Button
  } from '@repo/ui';
  
  import { notificationStore } from '$lib/stores/notifications.svelte';
  import { createProductFilter, syncFiltersToUrl } from '$lib/stores/product-filter.svelte';
  import { formatPrice } from '$lib/utils/price';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import { debounce } from '$lib/utils/debounce';
  import type { PageData } from './$types';
  import { mapCategory } from '$lib/types/domain';

  let { data }: { data: PageData } = $props();

  // -- Store & Context --
  const filterStore = createProductFilter();
  const filterDrawer = getContext<{ open: () => void, close: () => void }>('filterDrawer');

  // -- Derived State from Store --
  let filters = $derived(filterStore.filters);
  let products = $derived(filterStore.filteredProducts);
  
  // -- Local State --
  let searchQuery = $state(data.searchQuery || '');
  let loadingMore = $state(false);
  let hasMore = $state(!!data.hasMore);
  let nextPage = $state((data.currentPage || 1) + 1);
  let loadMoreTrigger = $state<HTMLElement | null>(null);
  let observer = $state<IntersectionObserver | null>(null);
  let filtersInitialized = $state(false);
  let isSearchFocused = $state(false);

  // -- Derived Data --
  let activeFiltersCount = $derived(
    Object.entries(filters).filter(([key, value]) => {
      if (key === 'query' || key === 'sort') return false;
      return value !== null && value !== undefined && value !== 'all';
    }).length
  );

  let categories = $derived(data.categories || []);
  const mainCategories = $derived(
    (categories || [])
      .map((cat: any) => {
        const mapped = mapCategory(cat);
        return { ...mapped, name: mapped.name };
      })
  );

  const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.condition_newWithTags?.() ?? i18n.sell_condition_brandNewWithTags(), emoji: '🏷️' },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew(), emoji: '💎' },
		{ key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good(), emoji: '👍' },
		{ key: 'fair', label: i18n.condition_fair(), shortLabel: i18n.condition_fair(), emoji: '👌' }
	];

  // -- Effects --

  // 1. Initialize Store from Server Data
  $effect(() => {
    if (!filtersInitialized && data.products) {
      const mappedProducts = (data.products || []).map(mapProductForStore);
      filterStore.setProducts(mappedProducts);
      
      if (data.filters) {
         const cleanFilters: any = { ...data.filters };
         Object.keys(cleanFilters).forEach(key => {
           if (cleanFilters[key] === null) delete cleanFilters[key];
         });
         filterStore.updateMultipleFilters({
            query: data.searchQuery || '',
            ...cleanFilters
         });
      }
      filtersInitialized = true;
    }
  });

  // 2. Sync Store to URL
  $effect(() => {
    if (browser && filtersInitialized) {
      syncFiltersToUrl(filters);
    }
  });

  // 3. Infinite Scroll Observer
  $effect(() => {
    if (!browser || !loadMoreTrigger) return;
    
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    }, { rootMargin: '400px' });
    
    observer.observe(loadMoreTrigger);
    
    return () => observer?.disconnect();
  });

  // -- Handlers --

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    loadingMore = true;

    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.specific) params.set('specific', filters.specific);
      // Add other filters as needed
      params.set('page', String(nextPage));
      
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const newProducts = (json.products || json.data || []).map(mapProductForStore);
        if (newProducts.length > 0) {
          filterStore.appendProducts(newProducts);
          nextPage++;
        } else {
          hasMore = false;
        }
        hasMore = json.hasMore ?? (newProducts.length > 0);
      }
    } catch (e) {
      console.error('Failed to load more products:', e);
    } finally {
      loadingMore = false;
    }
  }

  function mapProductForStore(p: any) {
     return {
        ...p,
        price: Number(p.price || 0),
        images: p.images || [],
        sellerName: p.seller?.username || p.seller_name || '',
        sellerRating: typeof p.seller?.rating === 'number' ? p.seller.rating : (p.seller_rating ? Number(p.seller_rating) : 0),
        sellerAvatar: p.seller?.avatar_url ?? p.seller_avatar ?? undefined,
        sellerId: p.seller_id ?? p.sellerId ?? p.seller?.id ?? '',
        createdAt: (p.created_at as string | null) ?? p.createdAt ?? new Date().toISOString(),
        main_category_name: p.main_category_name ?? p.category_name ?? 'Uncategorized',
        subcategory_name: p.subcategory_name ?? undefined,
        specific_category_name: p.specific_category_name ?? undefined,
        category_name: p.category_name ?? p.main_category_name ?? 'Uncategorized'
     };
  }

  const handleSearch = debounce((query: string) => {
    searchQuery = query;
    filterStore.updateFilter('query', query);
    nextPage = 2; 
    hasMore = true;
  }, 300);

  function handleCategorySelect(slug: string | null) {
    if (!slug || filters.category === slug) {
      filterStore.updateFilter('category', null);
    } else {
      filterStore.updateMultipleFilters({ category: slug, subcategory: null, specific: null });
    }
  }

  function handleConditionFilter(condition: string) {
     if (filters.condition === condition) {
        filterStore.updateFilter('condition', null);
     } else {
        filterStore.updateFilter('condition', condition);
     }
  }

  function removeFilter(key: string) {
    filterStore.updateFilter(key, null);
  }

</script>

<svelte:head>
  <title>{(i18n.nav_search ? i18n.nav_search() : 'Search') + ' - Driplo'}</title>
</svelte:head>

<div class="min-h-screen bg-[var(--surface-subtle)] pb-20 sm:pb-0">
  
  <!-- Ultrathink Sticky Header -->
  <div class="sticky top-0 z-40 bg-[var(--surface-base)] border-b border-[var(--border-subtle)] shadow-sm">
    
    <!-- Top Row: Search Input & Filter Toggle -->
    <div class="px-4 py-3 flex items-center gap-3">
      <div class="relative flex-1 group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          oninput={(e) => handleSearch(e.currentTarget.value)}
          onfocus={() => isSearchFocused = true}
          onblur={() => isSearchFocused = false}
          placeholder={i18n.search_placeholder?.() ?? "Search for items, brands, or styles..."}
          class="block w-full pl-10 pr-10 py-2.5 bg-[var(--surface-subtle)] border-none rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:bg-[var(--surface-base)] transition-all text-base"
        />
        {#if searchQuery}
          <button
            onclick={() => { searchQuery = ''; handleSearch(''); }}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>

      <button
        onclick={() => filterDrawer.open()}
        class="relative p-2.5 rounded-xl bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors active:scale-95"
        aria-label="Filters"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        {#if activeFiltersCount > 0}
          <span class="absolute top-2 right-2 block h-2 w-2 rounded-full bg-[var(--brand-primary)] ring-2 ring-[var(--surface-base)]"></span>
        {/if}
      </button>
    </div>

    <!-- Middle Row: Categories & Quick Filters (Horizontal Scroll) -->
    <div class="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar items-center">
      <!-- All Categories Pill -->
      <button
        onclick={() => handleCategorySelect(null)}
        class="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border {filters.category === null ? 'bg-[var(--text-primary)] text-[var(--surface-base)] border-transparent' : 'bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--text-secondary)]'}"
      >
        All
      </button>

      <!-- Main Categories -->
      {#each mainCategories as cat}
        <button
          onclick={() => handleCategorySelect(cat.slug)}
          class="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border {filters.category === cat.slug ? 'bg-[var(--text-primary)] text-[var(--surface-base)] border-transparent' : 'bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--text-secondary)]'}"
        >
          {cat.name}
        </button>
      {/each}

      <div class="w-px h-6 bg-[var(--border-subtle)] mx-1 flex-shrink-0"></div>

      <!-- Condition Filters -->
      {#each quickConditionFilters as condition}
        <button
          onclick={() => handleConditionFilter(condition.key)}
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border {filters.condition === condition.key ? 'bg-[var(--surface-brand-subtle)] text-[var(--brand-dark)] border-[var(--brand-primary)]' : 'bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'}"
        >
          <span>{condition.emoji}</span>
          <span>{condition.shortLabel}</span>
        </button>
      {/each}
    </div>

    <!-- Bottom Row: Active Filters (Only if active) -->
    {#if activeFiltersCount > 0}
      <div class="px-4 py-2 bg-[var(--surface-muted)] border-t border-[var(--border-subtle)] flex gap-2 overflow-x-auto no-scrollbar">
        {#each Object.entries(filters) as [key, value]}
          {#if key !== 'query' && key !== 'sort' && value && value !== 'all' && key !== 'category' && key !== 'condition'}
            <button 
              onclick={() => removeFilter(key)}
              class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] shadow-sm hover:text-[var(--brand-primary)] transition-colors"
            >
              <span class="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {value}</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          {/if}
        {/each}
        <button 
          onclick={() => filterStore.resetFilters()}
          class="text-xs font-semibold text-[var(--brand-primary)] whitespace-nowrap px-2 hover:underline self-center"
        >
          Clear all
        </button>
      </div>
    {/if}
  </div>

  <!-- Main Content Area -->
  <main class="max-w-7xl mx-auto px-4 py-6">
    
    <!-- Results Header -->
    {#if products.length > 0}
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-[var(--text-secondary)] font-medium">
          {products.length.toLocaleString()} {products.length === 1 ? 'result' : 'results'} found
        </p>
      </div>
    {/if}

    <!-- Product Grid -->
    {#if products.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each products as product (product.id)}
           <ProductCard 
             {product} 
             onclick={() => goto(getProductUrl(product))}
             translations={{
                size: i18n.product_size(),
                currency: i18n.common_currency(),
                addToFavorites: i18n.product_addToFavorites(),
                brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
                newWithoutTags: i18n.sell_condition_newWithoutTags(),
                new: i18n.condition_new(),
                likeNew: i18n.condition_likeNew(),
                good: i18n.condition_good(),
                worn: i18n.sell_condition_worn(),
                fair: i18n.condition_fair(),
                formatPrice: (price) => formatPrice(price),
                categoryTranslation: (name) => name
             }}
           />
        {/each}
        
        <!-- Loading Skeletons (Append) -->
        {#if loadingMore}
           {#each Array(4) as _, i (i)}
             <ProductCardSkeleton />
           {/each}
        {/if}
      </div>
      
      <!-- Infinite Scroll Trigger -->
      {#if hasMore}
        <div bind:this={loadMoreTrigger} class="h-24 w-full flex justify-center items-center mt-8">
           {#if !loadingMore}
             <span class="text-sm text-[var(--text-tertiary)]">Scroll for more</span>
           {:else}
             <div class="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
           {/if}
        </div>
      {/if}

    {:else if !loadingMore && filtersInitialized}
       <!-- Empty State -->
       <div class="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in duration-500">
          <div class="w-24 h-24 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mb-6 shadow-sm">
             <svg class="w-12 h-12 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">
            {i18n.search_noResults?.() ?? 'No items found'}
          </h3>
          <p class="text-base text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">
             We couldn't find anything matching your search. Try adjusting your filters or search for something else.
          </p>
          
          {#if activeFiltersCount > 0}
            <Button variant="outline" onclick={() => filterStore.resetFilters()} class="min-w-[140px]">
               Clear all filters
            </Button>
          {:else}
            <div class="space-y-6 w-full max-w-md">
              <p class="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Popular Categories
              </p>
              <div class="flex flex-wrap gap-3 justify-center">
                {#each mainCategories.slice(0, 6) as cat}
                  <button
                    onclick={() => handleCategorySelect(cat.slug)}
                    class="px-5 py-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border-muted)] transition-all active:scale-95 shadow-sm"
                  >
                    {cat.name}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
       </div>
    {:else if !filtersInitialized}
      <!-- Initial Loading State -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each Array(10) as _, i (i)}
          <ProductCardSkeleton />
        {/each}
      </div>
    {/if}
  </main>
</div>

<BottomNav
	currentPath={page.url.pathname}
	unreadMessageCount={notificationStore.unreadCount}
	profileHref={'/account'}
	isAuthenticated={!!data.user}
  onFilterClick={() => filterDrawer.open()}
	labels={{
			home: i18n.nav_home(),
			search: i18n.nav_search(),
			sell: i18n.nav_sell(),
			filter: 'Filter',
			profile: i18n.nav_profile()
	}}
/>

<style>
  .no-scrollbar::-webkit-scrollbar {
      display: none;
  }
  .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
</style>
