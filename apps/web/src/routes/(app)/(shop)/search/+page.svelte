<script lang="ts">
  import { page } from '$app/state';
  import { goto, preloadCode, preloadData } from '$app/navigation';
  import { browser } from '$app/environment';
  import * as i18n from '@repo/i18n';
  
  import { 
    ProductCard, 
    ProductCardSkeleton,
    BottomNav,
    Button,
    MainPageSearchBar,
    BrowseByType,
    CategorySidebar,
    FilterDrawer
  } from '@repo/ui';
  
  import { notificationStore } from '$lib/stores/notifications.svelte';
  import { createProductFilter } from '$lib/stores/product-filter.svelte';
  import { formatPrice } from '$lib/utils/price';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import { debounce } from '$lib/utils/debounce';
  import type { PageData } from './$types';
  import { mapCategory } from '$lib/types/domain';
  import { performQuickSearch, type QuickSearchResult } from '$lib/utils/search';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { logError } from '$lib/utils/error-logger';

  let { data }: { data: PageData } = $props();

  // -- Store & Context --
  const filterStore = createProductFilter();
  let showFilterDrawer = $state(false);
  const supabase = browser ? createBrowserSupabaseClient() : null;

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
  let loadingCategory = $state<string | null>(null);
  let currentLang = $state(i18n.getLocale());

  // -- Derived Data --
  let totalResults = $derived(data.total || products.length);
  
  let activeFiltersCount = $derived(
    Object.entries(filters).filter(([key, value]) => {
      if (key === 'query' || key === 'sort') return false;
      return value !== null && value !== undefined && value !== 'all' && value !== '';
    }).length
  );

  let categories = $derived(data.categories || []);

  function translateCategory(categoryName: string): string {
		const categoryMap: Record<string, string> = {
			'Women': i18n.category_women(),
			'Men': i18n.category_men(),
			'Kids': i18n.category_kids(),
			'Unisex': i18n.category_unisex(),
			'Accessories': i18n.category_accessories(),
			'Activewear': i18n.category_activewear(),
			'Bags': i18n.category_bags(),
			'Boots': i18n.category_boots(),
			'Dresses': i18n.category_dresses(),
			'Flats': i18n.category_flats(),
			'Formal Shoes': i18n.category_formalShoes(),
			'Heels': i18n.category_heels(),
			'Hoodies': i18n.category_hoodies(),
			'Jackets': i18n.category_jackets(),
			'Jeans': i18n.category_jeans(),
			'Jewelry': i18n.category_jewelry(),
			'Lingerie & Underwear': i18n.category_lingerie(),
			'Pants & Jeans': i18n.category_pantsJeans(),
			'Sandals': i18n.category_sandals(),
			'Shirts': i18n.category_shirts(),
			'Shorts': i18n.category_shorts(),
			'Skirts': i18n.category_skirts(),
			'Sneakers': i18n.category_sneakers(),
			'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
			'Swimwear': i18n.category_swimwear(),
			'T-Shirts': i18n.category_tshirts(),
			'Tops & T-Shirts': i18n.category_topsTshirts(),
			'Underwear': i18n.category_underwear(),
			'Watches': i18n.category_watches(),
			'Clothing': i18n.category_clothing(),
			'Shoes': i18n.category_shoesType(),
		};
		return categoryMap[categoryName] || categoryName;
	}

  const mainCategories = $derived.by(() => {
    const allCategories = categories || [];
    let currentParentId = null;

    if (filters.category && filters.category !== 'all') {
        const currentCategory = allCategories.find((c: any) => c.slug === filters.category);
        if (currentCategory) {
            const hasChildren = allCategories.some((c: any) => c.parent_id === currentCategory.id);
            if (hasChildren) {
                currentParentId = currentCategory.id;
            } else {
                currentParentId = currentCategory.parent_id;
            }
        }
    }

    return allCategories
        .filter((cat: any) => cat.parent_id === currentParentId)
        .sort((a: any, b: any) => {
            const priority = ['Men', 'Women', 'Kids'];
            const aIdx = priority.indexOf(a.name);
            const bIdx = priority.indexOf(b.name);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
        .map((cat: any) => {
            const mapped = mapCategory(cat);
            return {
                ...mapped,
                name: translateCategory(mapped.name)
            };
        });
  });

  const categoryTree = $derived.by(() => {
    if (!categories) return [];
    const roots = categories.filter((c: any) => !c.parent_id);
    return roots.map((root: any) => {
        const mapped = mapCategory(root);
        // Level 2 categories (children of root)
        const level2Children = categories
            .filter((c: any) => c.parent_id === root.id)
            .map((child: any) => {
                const mappedChild = mapCategory(child);
                // Level 3 categories (grandchildren)
                const level3Children = categories
                    .filter((c: any) => c.parent_id === child.id)
                    .map((grandchild: any) => {
                        const mappedGrandchild = mapCategory(grandchild);
                        return {
                            ...mappedGrandchild,
                            name: translateCategory(mappedGrandchild.name),
                            level: 3,
                            children: []
                        };
                    });
                return {
                    ...mappedChild,
                    name: translateCategory(mappedChild.name),
                    level: 2,
                    children: level3Children
                };
            });
        return {
            ...mapped,
            name: translateCategory(mapped.name),
            level: 1,
            children: level2Children
        };
    }).sort((a: any, b: any) => {
        // Sort by priority first (Women, Men, Kids)
        const priority = ['Women', 'Men', 'Kids'];
        const aIdx = priority.indexOf(a.name);
        const bIdx = priority.indexOf(b.name);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  });

const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.condition_newWithTags?.() ?? i18n.sell_condition_brandNewWithTags(), emoji: '🏷️' },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew(), emoji: '💎' },
		{ key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good(), emoji: '👍' },
		{ key: 'fair', label: i18n.condition_fair(), shortLabel: i18n.condition_fair(), emoji: '👌' }
	];

  // -- Effects --

  // 1. Initialize Store from Server Data
  $effect(() => {
    if (data.products) {
      // DEBUG: Phase 1 - Trace product data flow
      console.log('[Search] Server returned products:', data.products?.length);
      console.log('[Search] First product sample:', data.products?.[0]);
      
      const mappedProducts = (data.products || []).map(mapProductForStore);
      
      // DEBUG: Verify mapping
      console.log('[Search] Mapped products count:', mappedProducts.length);
      console.log('[Search] First mapped product:', mappedProducts[0]);
      
      filterStore.setProducts(mappedProducts);
      
      // DEBUG: Verify store received products
      console.log('[Search] Store allProducts after set:', filterStore.allProducts?.length);
      
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
      
      // DEBUG: Confirm initialization
      console.log('[Search] filtersInitialized set to true');
      console.log('[Search] filteredProducts count:', products.length);
      
      // Reset pagination state from server data
      hasMore = !!data.hasMore;
      nextPage = (data.currentPage || 1) + 1;
    }
  });

  // 2. Sync Store to URL and Navigate
  $effect(() => {
    if (browser && filtersInitialized) {
      // Use goto to trigger server-side filtering
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.specific) params.set('specific', filters.specific);
      if (filters.size && filters.size !== 'all') params.set('size', filters.size);
      if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand);
      if (filters.condition && filters.condition !== 'all') params.set('condition', filters.condition);
      if (filters.price_min) params.set('min_price', filters.price_min);
      if (filters.price_max) params.set('max_price', filters.price_max);
      if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);

      const queryString = params.toString();
      
      // Only navigate if params changed significantly
      // We need to be careful about order, so we compare sorted params or just rely on SvelteKit's goto intelligence
      // But simple string comparison might fail if order differs.
      
      // Let's check if we need to navigate
      let needsNavigation = false;
      const currentKeys = Array.from(page.url.searchParams.keys());
      const newKeys = Array.from(params.keys());
      
      if (currentKeys.length !== newKeys.length) {
        needsNavigation = true;
      } else {
        for (const key of newKeys) {
          if (params.get(key) !== page.url.searchParams.get(key)) {
            needsNavigation = true;
            break;
          }
        }
      }

      if (needsNavigation) {
         goto(`?${queryString}`, { keepFocus: true, noScroll: true, replaceState: false });
      }
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
      
      if (filters.condition && filters.condition !== 'all') params.set('condition', filters.condition);
      if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand);
      if (filters.size && filters.size !== 'all') params.set('size', filters.size);
      if (filters.price_min) params.set('min_price', filters.price_min);
      if (filters.price_max) params.set('max_price', filters.price_max);
      if (filters.sort) params.set('sort', filters.sort);

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
     // Extract category name from nested categories object or fallback fields
     const categoryName = p.categories?.name 
       ?? p.main_category_name 
       ?? p.category_name 
       ?? null;
     const categorySlug = p.categories?.slug 
       ?? p.main_category_slug 
       ?? p.category_slug 
       ?? null;
     
     return {
        ...p,
        price: Number(p.price || 0),
        images: p.images || p.product_images?.map((img: any) => img.image_url) || [],
        sellerName: p.seller?.username || p.profiles?.username || p.seller_name || '',
        sellerRating: typeof p.seller?.rating === 'number' ? p.seller.rating : (p.seller_rating ? Number(p.seller_rating) : 0),
        sellerAvatar: p.seller?.avatar_url ?? p.profiles?.avatar_url ?? p.seller_avatar ?? undefined,
        sellerId: p.seller_id ?? p.sellerId ?? p.seller?.id ?? '',
        createdAt: (p.created_at as string | null) ?? p.createdAt ?? new Date().toISOString(),
        main_category_name: categoryName,
        subcategory_name: p.subcategory_name ?? undefined,
        specific_category_name: p.specific_category_name ?? undefined,
        category_name: categoryName,
        main_category_slug: categorySlug,
        subcategory_slug: p.subcategory_slug ?? undefined,
        specific_category_slug: p.specific_category_slug ?? undefined
     };
  }

  const handleSearch = debounce((query: string) => {
    searchQuery = query;
    filterStore.updateFilter('query', query);
    nextPage = 2; 
    hasMore = true;
  }, 300);

  function saveRecentSearch(query: string) {
    if (!query.trim()) return;
    const stored = localStorage.getItem('recent_searches');
    let searches = stored ? JSON.parse(stored) : [];
    searches = [query, ...searches.filter((s: string) => s !== query)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(searches));
  }

  function handleSearchSubmit(query: string) {
    handleSearch(query);
    saveRecentSearch(query);
  }

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

  // Handlers for MainPageSearchBar
  function handleMainPageSearch(query: string) {
		handleSearchSubmit(query);
	}

	async function handleMainPageQuickSearch(query: string): Promise<{ data: QuickSearchResult[]; error: string | null }> {
		return performQuickSearch(supabase, query);
	}

	function handleMainPageNavigateToBrand(brandName: string) {
		if (!brandName?.trim()) return;
		goto(`/search?brand=${encodeURIComponent(brandName.trim())}`);
	}

	function handleMainPageNavigateToSeller(identifier: string) {
		if (!identifier?.trim()) return;
		goto(`/profile/${identifier.trim()}`);
	}

	function handleMainPageNavigateToQuickShop(filter: string) {
		if (!filter) {
			goto('/search');
			return;
		}

		const params = new URLSearchParams();
		for (const segment of filter.split('&')) {
			const [key, value] = segment.split('=');
			if (key && value) {
				params.set(key, value);
			}
		}

		const queryString = params.toString();
		goto(queryString ? `/search?${queryString}` : '/search');
	}

	function handleMainPageNavigateToDrip() {
		goto('/drip');
	}

	function handleMainPageConditionFilter(condition: string) {
		handleConditionFilter(condition);
	}

	function handleMainPageNavigateToAll() {
		loadingCategory = 'all';
		try {
			handleCategorySelect(null);
		} finally {
			loadingCategory = null;
		}
	}

	async function handleMainPagePrefetchCategory(categorySlug: string) {
		if (!browser) return;

		const path = `/category/${categorySlug}`;

		try {
			await preloadCode(path);
			preloadData(path).catch(() => {});
		} catch (error) {
			logError('Failed to prefetch category page', error as Error, { categorySlug });
		}
	}

</script>

<svelte:head>
  <title>{(i18n.nav_search ? i18n.nav_search() : 'Search') + ' - Driplo'}</title>
</svelte:head>

<div class="min-h-screen bg-[var(--surface-subtle)] pb-20 sm:pb-0">
  
  <!-- Consistent Search Header -->
  <MainPageSearchBar
    bind:searchQuery
    topBrands={[]}
    topSellers={[]}
    {mainCategories}
    conditionFilters={quickConditionFilters}
    {i18n}
    {currentLang}
    selectedCondition={filters.condition}
    {loadingCategory}
    onSearch={handleMainPageSearch}
    onQuickSearch={handleMainPageQuickSearch}
    onCategorySelect={handleCategorySelect}
    onConditionFilter={handleMainPageConditionFilter}
    onNavigateToAll={handleMainPageNavigateToAll}
    onPillKeyNav={() => {}}
    onPrefetchCategory={handleMainPagePrefetchCategory}
    currentPath={page.url.pathname}
    onNavigateToBrand={handleMainPageNavigateToBrand}
    onNavigateToSeller={handleMainPageNavigateToSeller}
    onNavigateToQuickShop={handleMainPageNavigateToQuickShop}
    onNavigateToDrip={handleMainPageNavigateToDrip}
    onNavigateToSellersList={() => goto('/sellers')}
    onNavigateToBrandsList={() => goto('/brands')}
    onFilterClick={() => showFilterDrawer = true}
    showFilterButton={true}
    showPills={true}
    sticky={true}
  />

  <!-- Vinted-Style Filter Bar Removed as per request -->
  <!-- <FilterBar 
    {filters} 
    onFilterChange={handleFilterBarChange} 
    onClearAll={() => filterStore.resetFilters()} 
  /> -->

  <!-- Main Content Area -->
  <main class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
    
    <!-- Sidebar (Desktop Only) -->
    <div class="hidden lg:block">
       <CategorySidebar 
         categories={categoryTree} 
         activeCategory={filters.category}
         onSelect={handleCategorySelect}
       />
    </div>

    <!-- Results Column -->
    <div class="min-w-0">

    <!-- Results Header with Count and Sort -->
    {#if filtersInitialized && products.length > 0}
      <div class="flex items-center justify-between mb-4 px-1 gap-4">
        <div class="text-sm text-[var(--text-secondary)] flex-1 min-w-0">
          {#if searchQuery}
            <span class="truncate">{i18n.search_resultsFor?.({ query: searchQuery }) ?? `Results for "${searchQuery}"`}</span>
          {:else}
            <span>{i18n.search_results?.() ?? 'Results'}</span>
          {/if}
          <span class="font-medium text-[var(--text-primary)] ml-1">({totalResults > 50 ? `${totalResults}+` : totalResults})</span>
        </div>
        
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- Sort Dropdown -->
          <div class="relative">
            <select 
              value={filters.sort || 'relevance'}
              onchange={(e) => filterStore.updateFilter('sort', (e.target as HTMLSelectElement).value)}
              class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-[var(--surface-base)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] cursor-pointer hover:border-[var(--border-emphasis)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-colors"
            >
              <option value="relevance">{i18n.search_sortRelevance?.() ?? 'Best match'}</option>
              <option value="newest">{i18n.search_sortNewest?.() ?? 'Newest first'}</option>
              <option value="price-low">{i18n.search_sortPriceLow?.() ?? 'Price: Low to high'}</option>
              <option value="price-high">{i18n.search_sortPriceHigh?.() ?? 'Price: High to low'}</option>
            </select>
            <!-- Sort Icon -->
            <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          
          {#if activeFiltersCount > 0}
            <button 
              onclick={() => filterStore.resetFilters()}
              class="text-sm text-[var(--brand-primary)] hover:underline whitespace-nowrap"
            >
              {i18n.search_clearAll?.() ?? 'Clear all'}
            </button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Product Grid -->
    {#if products.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each products as product (product.id)}
           <ProductCard 
             product={product as any} 
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
       <!-- Empty State with Suggestions -->
       <div class="flex flex-col items-center justify-center py-16 text-center px-4 animate-in fade-in duration-500">
          <div class="w-20 h-20 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mb-6 shadow-sm">
             <svg class="w-10 h-10 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">
            {#if searchQuery}
              {i18n.search_noResultsFor?.({ query: searchQuery }) ?? `No results for "${searchQuery}"`}
            {:else}
              {i18n.search_noResults?.() ?? 'No items found'}
            {/if}
          </h3>
          <p class="text-base text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
             {i18n.search_adjustFilters?.() ?? 'Try adjusting your filters or search terms'}
          </p>
          
          {#if activeFiltersCount > 0}
            <Button variant="outline" onclick={() => filterStore.resetFilters()} class="min-w-[140px] mb-8">
               {i18n.search_clearFilters?.() ?? 'Clear Filters'}
            </Button>
          {/if}

          <!-- Popular Search Suggestions -->
          <div class="w-full max-w-md mb-8">
            <p class="text-sm font-medium text-[var(--text-secondary)] mb-3">
              {i18n.search_popularSearches?.() ?? 'Popular searches'}
            </p>
            <div class="flex flex-wrap justify-center gap-2">
              {#each [
                { label: i18n.home_searchSuggestions_sneakers?.() ?? 'Sneakers', query: 'sneakers' },
                { label: i18n.home_searchSuggestions_designerBags?.() ?? 'Designer bags', query: 'designer bags' },
                { label: i18n.home_searchSuggestions_vintageJackets?.() ?? 'Vintage jackets', query: 'vintage jacket' },
                { label: i18n.home_searchSuggestions_summerDresses?.() ?? 'Summer dresses', query: 'summer dress' }
              ] as suggestion}
                <button 
                  onclick={() => handleSearchSubmit(suggestion.query)}
                  class="px-4 py-2 text-sm bg-[var(--surface-base)] border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-subtle)] hover:border-[var(--brand-primary)] transition-colors"
                >
                  {suggestion.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Browse by Category -->
          <div class="w-full max-w-2xl">
             <p class="text-sm font-medium text-[var(--text-secondary)] mb-3">
              {i18n.search_browseByCategory?.() ?? 'Or browse by category'}
            </p>
             <BrowseByType onCategorySelect={handleCategorySelect} />
          </div>
       </div>
    {:else if !filtersInitialized}
      <!-- Initial Loading State -->
      <div class="vinted-grid">
        {#each Array(10) as _, i (i)}
          <ProductCardSkeleton />
        {/each}
      </div>
    {/if}
    </div>
  </main>
</div>

<!-- Filter Drawer -->
<FilterDrawer
  bind:isOpen={showFilterDrawer}
  currentFilters={{
    brand: filters.brand || null,
    condition: filters.condition || null,
    size: filters.size || null,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    sortBy: filters.sortBy || 'relevance'
  }}
  onApply={(newFilters) => {
    filterStore.updateMultipleFilters({
      brand: (newFilters.brand as string) || 'all',
      condition: (newFilters.condition as string) || 'all',
      size: (newFilters.size as string) || 'all',
      minPrice: newFilters.minPrice ? String(newFilters.minPrice) : '',
      maxPrice: newFilters.maxPrice ? String(newFilters.maxPrice) : '',
      sortBy: (newFilters.sortBy as string) || 'relevance'
    });
    showFilterDrawer = false;
  }}
  onClear={() => {
    filterStore.resetFilters();
    showFilterDrawer = false;
  }}
  categories={categoryTree}
  brands={['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'North Face']}
  sizes={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
/>

<BottomNav
	currentPath={page.url.pathname}
	unreadMessageCount={notificationStore.unreadCount}
	isAuthenticated={!!data.user}
	labels={{
			home: i18n.nav_home(),
			search: i18n.nav_search(),
			sell: i18n.nav_sell(),
			messages: i18n.nav_messages ? i18n.nav_messages() : 'Messages',
			profile: i18n.nav_profile()
	}}
/>

<style>
</style>
