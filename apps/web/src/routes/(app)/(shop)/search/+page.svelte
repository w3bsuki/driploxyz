<script lang="ts">
  import { 
    ProductCard, 
    Button, 
    BottomNav, 
    CategoryPills,
    FilterDrawer,
    SearchDropdownInput,
    ProductCardSkeleton
  } from '@repo/ui';

  // Type definitions removed (no longer used)

  import { unreadCount } from '$lib/stores/notifications.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { translateCategory, getCategoryIcon } from '$lib/categories/mapping';
  import { createProductFilter, syncFiltersToUrl } from '$lib/stores/product-filter.svelte';
  import { browser } from '$app/environment';
  import { debounce } from '$lib/utils/debounce';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  // Infinite scroll sentinel - properly managed with reactive cleanup
  let loadMoreTrigger = $state<HTMLDivElement | null>(null);
  let intersectionObserver = $state<IntersectionObserver | null>(null);

  // Only use $effect for DOM side effects like intersection observer
  $effect(() => {
    if (!browser || !loadMoreTrigger) {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
      return;
    }

    intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) loadMore();
    }, { rootMargin: '400px 0px' });

    intersectionObserver.observe(loadMoreTrigger);

    return () => {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
    };
  });

  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Initialize filter store with persistence
  const filterStore = createProductFilter();
  
  // Core UI state
  let showFilterDrawer = $state(false);
  let searchQuery = $state('');
  let ariaLiveMessage = $state('');

  
  // Single derived filter state for performance
  let filters = $derived(filterStore.filters);
  let previewFilteredProducts = $derived(filterStore.previewFilteredProducts);

  // Client-side script initialized

  // Popular brands
  const popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'North Face'];

  // L1 Categories for pills (Women/Men/Kids/Unisex)
  let categoryPillsData = $derived.by(() => {
    if (!data.categories || data.categories.length === 0) {
      return [];
    }
    
    return data.categories.map(cat => ({
      id: cat.id,
      name: translateCategory(cat.name),
      slug: cat.slug,
      icon: getCategoryIcon(cat.name),
      count: undefined // Could add product counts if needed
    }));
  });

  // Resolve categoryHierarchy once for dynamic L2/L3 pills
  type L3 = { id: string; name: string; slug: string };
  type L2 = { id: string; name: string; level3?: L3[] };
  type L1 = { id: string; name: string; slug: string; level2?: Record<string, L2> };
  let categoryHierarchyData = $state<Record<string, L1>>({});

  $effect(() => {
    if (data.categoryHierarchy) {
      Promise.resolve(data.categoryHierarchy).then((h: Record<string, L1>) => {
        categoryHierarchyData = h || {};
      });
    }
  });

  // Compute which pills to show based on selected filters
  type UIPill = { id: string; name: string; slug: string; count?: number };
  const pillsMode: 'L1' | 'L2' | 'L3' = $derived.by(() => {
    if (filters.category && !filters.subcategory && !filters.specific) return 'L2';
    if (filters.category && filters.subcategory && !filters.specific) return 'L3';
    return 'L1';
  });

  const currentPills: UIPill[] = $derived.by(() => {
    if (pillsMode === 'L1') {
      return categoryPillsData;
    }
    const l1Slug = filters.category as string | null;
    if (!l1Slug) return categoryPillsData;
    const l1Node = categoryHierarchyData[l1Slug];
    if (!l1Node || !l1Node.level2) return categoryPillsData;

    if (pillsMode === 'L2') {
      const allowedL2 = new Set(['clothing', 'shoes', 'accessories', 'bags']);
      return Object.entries(l1Node.level2)
        .map(([l2Slug, l2Data]) => {
          const cleanSlug = l2Slug.replace(`${l1Slug}-`, '').replace('-new', '');
          return { id: l2Data.id, name: translateCategory(l2Data.name), slug: cleanSlug };
        })
        .filter((p) => allowedL2.has(p.slug));
    }

    // L3 mode
    const subSlug = filters.subcategory as string | null;
    let l2Match: L2 | undefined;
    for (const [l2Slug, l2Data] of Object.entries(l1Node.level2)) {
      const cleanSlug = l2Slug.replace(`${l1Slug}-`, '').replace('-new', '');
      if (cleanSlug === subSlug) { l2Match = l2Data; break; }
    }
    if (!l2Match || !l2Match.level3) return [];
    return (l2Match.level3 || []).map((l3) => ({
      id: l3.id,
      name: translateCategory(l3.name),
      slug: l3.slug.replace(`${l1Slug}-`, '')
    }));
  });

  const currentActiveSlug = $derived.by(() => {
    if (pillsMode === 'L1') return filters.category;
    if (pillsMode === 'L2') return filters.subcategory;
    return filters.specific;
  });

  function handlePillSelect(slug: string | null) {
    if (pillsMode === 'L1') {
      if (slug === null) {
        filterStore.updateMultipleFilters({ category: null, subcategory: null, specific: null });
      } else {
        filterStore.updateMultipleFilters({ category: slug, subcategory: null, specific: null });
      }
    } else if (pillsMode === 'L2') {
      if (slug) filterStore.updateMultipleFilters({ subcategory: slug, specific: null });
    } else if (pillsMode === 'L3') {
      if (slug) filterStore.updateFilter('specific', slug);
    }
  }

  
  // Get all available brands from products
  const availableBrands = $derived.by(() => {
    const brands = new Set<string>();
    filterStore.allProducts.forEach((p: any) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  });

  // Get all available sizes from products
  const availableSizes = $derived.by(() => {
    const sizes = new Set<string>();
    filterStore.allProducts.forEach((p: any) => {
      if (p.size) sizes.add(p.size);
    });
    return Array.from(sizes);
  });
  
  
  // Common sizes based on category
  const commonSizes = {
    women: ['XS', 'S', 'M', 'L', 'XL'],
    men: ['S', 'M', 'L', 'XL', 'XXL'],
    kids: ['2T', '3T', '4T', '5-6', '7-8', '10-12'],
    default: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };
  
  // Get current sizes based on selected category, fallback to all available sizes
  let currentSizes = $derived(
    availableSizes.length > 0 
      ? availableSizes 
      : (commonSizes[filters.category as keyof typeof commonSizes] || commonSizes.default)
  );
  
  // Get current brands
  let currentBrands = $derived(availableBrands.length > 0 ? availableBrands : popularBrands);
  
  
  // Define a minimal Product shape compatible with filter store
  type ListProduct = {
    id: string;
    title?: string;
    description?: string;
    brand?: string;
    price?: number;
    size?: string;
    condition?: string;
    createdAt?: string;
    main_category_name?: string;
    subcategory_name?: string;
    specific_category_name?: string;
    images?: string[];
    product_images?: { image_url: string }[];
    seller_name?: string;
    seller_rating?: number;
    seller_avatar?: string;
    seller_id?: string;
    category_name?: string;
  };

  // Initialize filters from server data - only needs to run once on mount
  let filtersInitialized = $state(false);

  $effect(() => {
  if (!filtersInitialized && data.products) {
      // Handle products array directly (no longer wrapped in Promise)
      const products: ListProduct[] = (Array.isArray(data.products) ? data.products : []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? '',
        brand: p.brand ?? undefined,
        price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
        size: p.size ?? undefined,
        condition: p.condition ?? 'good',
        createdAt: (p.created_at as string | null) ?? p.createdAt ?? new Date().toISOString(),
        main_category_name: p.main_category_name || undefined,
        subcategory_name: p.subcategory_name || undefined,
        specific_category_name: p.specific_category_name || undefined,
        // Ensure images are present in both formats expected by ProductCard/ProductImage
        images: Array.isArray(p.images) && p.images.length
          ? p.images
          : (Array.isArray(p.product_images) ? p.product_images.map((img: any) => img.image_url) : []),
        product_images: Array.isArray(p.product_images) && p.product_images.length
          ? p.product_images
          : (Array.isArray(p.images) ? p.images.map((url: string) => ({ image_url: url })) : [])
      }));
      filterStore.setProducts(products as any);
      filterStore.loadPersistedFilters();

      if (data.filters) {
      const serverFilters = {
        query: data.searchQuery || '',
        category: data.filters.category || null,
        subcategory: data.filters.subcategory || null,
        specific: data.filters.specific || null,
        size: data.filters.size || 'all',
        brand: data.filters.brand || 'all',
        condition: data.filters.condition || 'all',
        minPrice: data.filters.minPrice || '',
        maxPrice: data.filters.maxPrice || '',
        sortBy: data.filters.sortBy || 'relevance'
      };

      // Only override persisted filters if URL has non-default values
      const hasUrlFilters = Object.entries(serverFilters).some(([key, value]) => {
        if (key === 'sortBy') return value !== 'relevance';
        if (typeof value === 'string' && (value === 'all' || value === '')) return false;
        return value !== null;
      });

      if (hasUrlFilters) {
        filterStore.updateMultipleFilters(serverFilters);
      }

      searchQuery = data.searchQuery || '';
      }
      filtersInitialized = true;
    }
  });
  
  // URL syncing - use $effect only for browser side effects
  $effect(() => {
    if (browser && filtersInitialized) {
      syncFiltersToUrl(filters);
    }
  });

  
  // Get filtered products
  let displayProducts: ListProduct[] = $derived(
    filterStore.filteredProducts.map((p: any) => {
      const images: string[] = Array.isArray(p.images) && p.images.length ? p.images : ['/placeholder-product.svg'];
      const sellerName = p.seller?.username || p.seller_name || '';
      return {
        ...p,
        // Ensure UI-required fields
        images,
        sellerName: sellerName === 'Unknown' ? '' : sellerName, // Don't show "Unknown"
        sellerRating: typeof p.seller?.rating === 'number' ? p.seller.rating : (p.seller_rating ? Number(p.seller_rating) : 0),
        sellerAvatar: p.seller?.avatar_url ?? p.seller_avatar ?? undefined,
        sellerId: p.seller_id ?? p.sellerId ?? p.seller?.id ?? '',
        createdAt: (p.created_at as string | null) ?? p.createdAt ?? new Date().toISOString(),
        // Preserve category hierarchy for ProductCard
        main_category_name: p.main_category_name ?? p.category_name ?? 'Uncategorized',
        subcategory_name: p.subcategory_name ?? undefined,
        specific_category_name: p.specific_category_name ?? undefined,
        category_name: p.category_name ?? p.main_category_name ?? 'Uncategorized'
    } as ListProduct;
    })
  );
  
  // Map ensures fallback category name for cards - preserve all category fields
  import type { Product as UIProduct } from '@repo/ui';
  const displayProductsWithCategory: UIProduct[] = $derived(
    (displayProducts.map(p => ({
      ...p,
      // Preserve full category hierarchy
      main_category_name: p.main_category_name || p.category_name || 'Uncategorized',
      subcategory_name: p.subcategory_name,
      specific_category_name: p.specific_category_name,
      category_name: p.category_name || p.main_category_name || 'Uncategorized'
    })) as unknown) as UIProduct[]
  );

  // Active filter count for badge (excluding search query)
  let activeFilterCount = $derived(
    [
      filters.category ? 1 : 0,
      filters.subcategory ? 1 : 0,
      filters.specific ? 1 : 0,
      filters.size !== 'all' ? 1 : 0,
      filters.brand !== 'all' ? 1 : 0,
      filters.condition !== 'all' ? 1 : 0,
      (filters.minPrice || filters.maxPrice) ? 1 : 0,
      filters.sortBy !== 'relevance' ? 1 : 0
    ].reduce((sum, val) => sum + val, 0)
  );

  // Infinite scroll state
  let nextPage = $state((data.currentPage || 1) + 1);
  let hasMore = $state(!!data.hasMore);
  let loadingMore = $state(false);
  let loadError = $state<string | null>(null);
  let loadAbortController = $state<AbortController | null>(null);

  async function loadMore() {
    if (!browser || loadingMore || !hasMore) return;
    // cancel any in-flight request
    try { loadAbortController?.abort(); } catch {}
    loadAbortController = new AbortController();
    loadingMore = true;
    loadError = null;
    try {
      const params = new URLSearchParams();
      // Carry over filters
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.specific) params.set('specific', filters.specific);
      if (filters.size && filters.size !== 'all') params.set('size', filters.size);
      if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand);
      if (filters.condition && filters.condition !== 'all') params.set('condition', filters.condition);
      if (filters.minPrice) params.set('min_price', filters.minPrice);
      if (filters.maxPrice) params.set('max_price', filters.maxPrice);
      if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
      params.set('page', String(nextPage));
      params.set('pageSize', String(data.pageSize || 50));

      const res = await fetch(`/api/search?${params.toString()}` , { signal: loadAbortController.signal });
      if (res.ok) {
        const json = await res.json();
        // API returns { data, pagination } shape; support legacy { products }
        const incoming = Array.isArray(json.products) ? json.products : Array.isArray(json.data) ? json.data : [];
        if (incoming.length > 0) {
          filterStore.appendProducts(incoming);
        }
        // pagination flags from either shape
        hasMore = json.hasMore ?? json.pagination?.hasMore ?? (incoming.length > 0);
        nextPage = (json.currentPage || json.pagination?.page || nextPage) + 1;
      } else if (res.status !== 499) {
        loadError = 'Failed to load more products';
      }
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Failed to load more products:', error);
        loadError = 'Network error';
      }
    }
    finally {
      loadingMore = false;
    }
  }
  
  // Debounced search handler
  const handleSearchDebounced = debounce((query: string) => {
    filterStore.updateFilter('query', query);
  }, 300);

  // Search input handler
  function handleSearchInput(value: string) {
    searchQuery = value;
    handleSearchDebounced(value);
  }

  // L1 handler replaced by handlePillSelect (supports L1/L2/L3)

  // Apply filters from drawer
  function handleApplyFilters(newFilters: Record<string, any>) {
    // Update all filters at once
    const filterUpdate: any = {};
    
    if (newFilters.brand !== undefined) filterUpdate.brand = newFilters.brand || 'all';
    if (newFilters.condition !== undefined) filterUpdate.condition = newFilters.condition || 'all';
    if (newFilters.size !== undefined) filterUpdate.size = newFilters.size || 'all';
    if (newFilters.minPrice !== undefined) filterUpdate.minPrice = newFilters.minPrice || '';
    if (newFilters.maxPrice !== undefined) filterUpdate.maxPrice = newFilters.maxPrice || '';
    if (newFilters.sortBy !== undefined) filterUpdate.sortBy = newFilters.sortBy || 'relevance';
    
    filterStore.updateMultipleFilters(filterUpdate);
    showFilterDrawer = false;
  }

  // Clear all filters
  function clearAllFilters() {
    filterStore.resetFilters();
    searchQuery = '';
  }

  // Removed unused handleRemoveAppliedFilter (applied pills UI removed)

  

  
  
  // Product category translations
  function getCategoryTranslation(categoryName: string): string {
    const categoryMap: Record<string, string> = {
      'Women': i18n.category_women(),
      'Men': i18n.category_men(),
      'Kids': i18n.category_kids(),
      'Unisex': i18n.category_unisex(),
      'Clothing': i18n.category_clothing(),
      'Shoes': i18n.category_shoesType(),
      'Accessories': i18n.category_accessoriesType(),
      'Bags': i18n.category_bagsType()
    };
    return categoryMap[categoryName] || categoryName;
  }
</script>

<svelte:head>
  <title>Search - Driplo</title>
</svelte:head>

<div class="search-page min-h-screen pb-20 sm:pb-0">
  
  <!-- ARIA Live Region for announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {ariaLiveMessage}
  </div>

  <!-- Sticky Search Container -->
  <div class="sticky-header sticky top-[var(--app-header-offset)] z-40">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-[var(--gutter-xxs)] sm:py-[var(--gutter-xs)]">

      <!-- Search Bar with Dropdown -->
      <div class="py-0 flex items-center gap-2">
        <!-- Filter button (left) -->
        <button
          type="button"
          class="search-filter-btn inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-base)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-emphasis)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary)] transition-all active:scale-95"
          aria-label="Open filters"
          onclick={() => (showFilterDrawer = true)}
        >
          <svg class="w-5 h-5 text-[color:var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
        </button>

        <!-- Search with dropdown -->
        <div class="flex-1">
          <SearchDropdownInput
            bind:searchValue={searchQuery}
            onInput={handleSearchInput}
            onSearch={(query) => handleSearchInput(query)}
            placeholder={i18n.search_placeholder ? i18n.search_placeholder() : 'Search for clothes, brands...'}
            searchId="search-page-input"
          />
        </div>
      </div>

  <!-- Category Pills (unified) - inside same container -->
  <div class="pt-[var(--gutter-xxs)] pb-[var(--gutter-xxs)]">
        <CategoryPills
          categories={currentPills}
          activeCategory={currentActiveSlug as unknown as string | null}
          onCategorySelect={handlePillSelect}
          showAllButton={pillsMode === 'L1'}
        />
      </div>
    </div>
  </div>

  
  
  <!-- Products Grid (window scroll + infinite load) -->
  <div 
    class="max-w-7xl mx-auto pt-[var(--space-2)] pb-[var(--space-6)] px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)]" 
    data-testid="search-results-container"
    style="
      padding-left: max(var(--space-3), env(safe-area-inset-left));
      padding-right: max(var(--space-3), env(safe-area-inset-right));
    "
  >
    <!-- Compact results count -->
    <div class="mb-[var(--space-2)]">
      <p class="text-[11px] tertiary">
        {displayProducts.length.toLocaleString()} {displayProducts.length === 1 ? 'item' : 'items'}
        {#if searchQuery}
          <span> for "{searchQuery}"</span>
        {/if}
      </p>
    </div>
    {#if displayProductsWithCategory.length > 0}
      <!-- Responsive grid matching main page: 2-col mobile, 3-col tablet, 4-col desktop, 5-col xl -->
      <div 
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[var(--space-2)] sm:gap-[var(--space-3)]"
        role="list"
        aria-label="Product results with {displayProductsWithCategory.length} items"
      >
        {#each displayProductsWithCategory as product, index (product.id)}
          <article
            role="listitem"
            aria-setsize={displayProductsWithCategory.length}
            aria-posinset={index + 1}
          >
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
                formatPrice: (price: number) => formatPrice(price),
                categoryTranslation: getCategoryTranslation
              }}
            />
          </article>
        {/each}
        
        {#if loadingMore}
          {#each Array(5) as _}
            <ProductCardSkeleton />
          {/each}
        {/if}
      </div>
      
      <!-- Infinite scroll sentinel with better touch target -->
      {#if hasMore}
        <div class="flex flex-col items-center gap-3 py-8">
          {#if loadError}
            <div class="text-sm load-error font-medium">{loadError}</div>
          {/if}
          <button 
            class="btn-secondary min-h-[48px] min-w-[140px] active:scale-95"
            disabled={loadingMore}
            onclick={loadMore}
          >
            {#if loadingMore}
              <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            {:else}
              Load More Products
            {/if}
          </button>
          <p class="text-xs tertiary">or scroll to auto-load</p>
        </div>
        <div bind:this={loadMoreTrigger} class="h-1"></div>
      {/if}
      
    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 empty-icon rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 empty-icon-stroke" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="heading-lg font-semibold text-primary mb-1">
          {i18n.search_noItemsFound()}
        </h3>
        <p class="text-secondary text-sm">{i18n.search_adjustFilters()}</p>
        {#if activeFilterCount > 0}
          <Button onclick={clearAllFilters} variant="outline" size="sm" class="mt-4">
            {i18n.search_clearAllFilters()}
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Filter Drawer (Mobile Bottom Sheet) -->
<FilterDrawer
  isOpen={showFilterDrawer}
  onClose={() => showFilterDrawer = false}
  onApply={handleApplyFilters}
  onClear={clearAllFilters}
  currentFilters={{
    brand: filters.brand === 'all' ? null : filters.brand,
    condition: filters.condition === 'all' ? null : filters.condition,
    size: filters.size === 'all' ? null : filters.size,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    sortBy: filters.sortBy || 'relevance'
  }}
  previewCount={previewFilteredProducts.length}
  brands={currentBrands}
  sizes={currentSizes}
/>

<!-- Bottom Navigation - Hidden when filter drawer is open -->
{#if !showFilterDrawer}
  <BottomNav 
    currentPath={page.url.pathname}
    unreadMessageCount={unreadCount}
    profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
    isAuthenticated={!!data.user}
    labels={{
      home: i18n.nav_home(),
      search: i18n.nav_search(),
      sell: i18n.nav_sell(),
      messages: i18n.nav_messages(),
      profile: i18n.nav_profile()
    }}
  />
{/if}

<style>
  /* Page background and common surfaces using tokens */
  .search-page {
    background-color: var(--surface-subtle);
  }

  /* heading token helper */
  .heading-lg { font-size: var(--text-lg); line-height: 1.3; }

  .sticky-header {
    background-color: var(--surface-base);
    /* Match main page subtle divider; no heavy shadow */
    border-bottom: 1px solid var(--border-subtle);
    box-shadow: none;
  }

  /* Search filter button */
  .search-filter-btn {
    transition: all 150ms ease;
  }

  .text-primary { color: var(--color-text-primary); }
  .text-secondary { color: var(--color-text-secondary); }
  .tertiary { color: var(--color-text-tertiary); }


  .load-error { color: var(--status-error-text, oklch(0.6 0.22 25)); }

  .empty-icon { background-color: var(--surface-muted); }
  .empty-icon-stroke { color: var(--color-text-tertiary); }
</style>