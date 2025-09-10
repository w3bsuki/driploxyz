<script lang="ts">
  import { ProductCard, Button, IntegratedSearchBar, ProductCardSkeleton, BottomNav, StickyFilterModal, AppliedFilterPills, CategoryBottomSheet, type Product } from '@repo/ui';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
  import { goto } from '$app/navigation';
  import { page, navigating } from '$app/stores';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { translateCategory, getCategoryIcon } from '$lib/categories/mapping';
  import type { Database } from '@repo/database';
  import { createProductFilter, syncFiltersToUrl } from '$lib/stores/product-filter.svelte';
  import { browser } from '$app/environment';
  import { debounce } from '$lib/utils/debounce';
  import { untrack } from 'svelte';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  // Infinite scroll sentinel
  let loadMoreTrigger = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!browser || !loadMoreTrigger) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '400px 0px' });
    io.observe(loadMoreTrigger);
    return () => io.disconnect();
  });

  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Initialize filter store with persistence
  const filterStore = createProductFilter();
  
  // Core UI state
  let showStickyFilterModal = $state(false);
  let showCategoryBottomSheet = $state(false);
  let isSearching = $state(false);
  let isFilterLoading = $state(false);
  let searchInput = $state('');
  let ariaLiveMessage = $state('');
  
  // Single derived filter state for performance
  let filters = $derived(filterStore.filters);
  let pendingFilters = $derived(filterStore.pendingFilters);
  let previewFilteredProducts = $derived(filterStore.previewFilteredProducts);
  
  // Category hierarchy from server data
  let categoryHierarchy = $derived((() => {
    if (!data.categoryHierarchy || Object.keys(data.categoryHierarchy).length === 0) {
      return {
        categories: [],
        subcategories: {},
        specifics: {}
      };
    }
    
    const hierarchy = {
      categories: [] as Array<{key: string, name: string, icon: string, id: string}>,
      subcategories: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>,
      specifics: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>
    };
    
    Object.entries(data.categoryHierarchy).forEach(([slug, catData]: [string, any]) => {
      hierarchy.categories.push({
        key: slug,
        name: translateCategory(catData.name),
        icon: getCategoryIcon(catData.name),
        id: catData.id
      });
      
      if (catData.level2) {
        hierarchy.subcategories[slug] = [];
        Object.entries(catData.level2).forEach(([l2Slug, l2Data]: [string, any]) => {
          const cleanSlug = l2Slug.replace(`${slug}-`, '').replace('-new', '');
          hierarchy.subcategories[slug].push({
            key: cleanSlug,
            name: translateCategory(l2Data.name),
            icon: getCategoryIcon(l2Data.name),
            id: l2Data.id
          });
          
          if (l2Data.level3 && Array.isArray(l2Data.level3)) {
            const level3Key = `${slug}-${cleanSlug}`;
            hierarchy.specifics[level3Key] = l2Data.level3.map((l3: any) => ({
              key: l3.slug.replace(`${slug}-`, ''),
              name: translateCategory(l3.name),
              icon: getCategoryIcon(l3.name),
              id: l3.id
            }));
          }
        });
      }
    });
    
    const order = ['women', 'men', 'kids', 'unisex'];
    hierarchy.categories.sort((a, b) => {
      const aIndex = order.indexOf(a.key);
      const bIndex = order.indexOf(b.key);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    return hierarchy;
  })());
  
  // Main categories for quick pills  
  const mainCategories = [
    { key: 'women', label: i18n.category_women(), icon: '👗' },
    { key: 'men', label: i18n.category_men(), icon: '👔' },
    { key: 'kids', label: i18n.category_kids(), icon: '👶' },
    { key: 'unisex', label: i18n.category_unisex(), icon: '🌍' }
  ];
  
  // Quick condition filters (most used)
  const quickConditionFilters = [
    { key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.sell_condition_brandNewWithTags() },
    { key: 'new_without_tags', label: i18n.sell_condition_newWithoutTags(), shortLabel: i18n.condition_new() },
    { key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
    { key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
  ];
  
  // Common sizes based on category
  const commonSizes = {
    women: ['XS', 'S', 'M', 'L', 'XL'],
    men: ['S', 'M', 'L', 'XL', 'XXL'],
    kids: ['2T', '3T', '4T', '5-6', '7-8', '10-12'],
    default: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };
  
  // Popular brands
  const popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'North Face'];
  
  // Conditions
  const conditions = [
    { key: 'new', label: i18n.condition_new(), emoji: '✨' },
    { key: 'like-new', label: i18n.condition_likeNew(), emoji: '💎' },
    { key: 'good', label: i18n.condition_good(), emoji: '👍' },
    { key: 'fair', label: i18n.condition_fair(), emoji: '👌' }
  ];
  
  // Initialize from server data and load persisted filters
  $effect(() => {
    if (data.products) {
      untrack(() => filterStore.setProducts(data.products));
    }
    
    // Load persisted filters first (untracked to prevent circular dependencies)
    untrack(() => filterStore.loadPersistedFilters());
    
    // Then apply server-provided filters (URL params override persisted)
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
        untrack(() => filterStore.updateMultipleFilters(serverFilters));
      }
      
      searchInput = data.searchQuery || '';
    }
  });
  
  // Sync to URL on filter changes (client-side)
  $effect(() => {
    if (browser) {
      syncFiltersToUrl(filters);
    }
  });
  
  // Get current sizes based on selected category
  let currentSizes = $derived(
    commonSizes[filters.category as keyof typeof commonSizes] || commonSizes.default
  );
  
  // Get current brands (using popular brands for now)
  let currentBrands = $derived(popularBrands);
  
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
  
  // Get filtered products
  let displayProducts = $derived(
    filterStore.filteredProducts.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      images: product.images?.length > 0 ? product.images : ['/placeholder-product.svg'],
      product_images: product.product_images,
      brand: product.brand,
      size: product.size,
      condition: product.condition as Product['condition'],
      category: product.category?.name || 'Uncategorized',
      main_category_name: product.main_category_name,
      category_name: product.category_name || product.main_category_name,
      subcategory_name: product.subcategory_name,
      specific_category_name: product.specific_category_name,
      sellerId: product.seller_id || product.seller?.id,
      sellerName: product.seller?.username || 'Unknown',
      sellerRating: product.seller?.rating ? Number(product.seller.rating) : null,
      sellerAvatar: product.seller?.avatar_url,
      sellerAccountType: product.sellerAccountType,
      createdAt: product.created_at,
      location: product.location || 'Unknown'
    }))
  );
  
  // Map ensures fallback category name for cards
  const displayProductsWithCategory = $derived(
    displayProducts.map(p => ({
      ...p,
      category_name: p.category_name || p.main_category_name || 'Uncategorized'
    }))
  );

  // Infinite scroll state
  let nextPage = $state((data.currentPage || 1) + 1);
  let hasMore = $state(!!data.hasMore);
  let loadingMore = $state(false);

  async function loadMore() {
    if (!browser || loadingMore || !hasMore) return;
    loadingMore = true;
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

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.products) && json.products.length > 0) {
          filterStore.appendProducts(json.products);
        }
        hasMore = !!json.hasMore;
        nextPage = (json.currentPage || nextPage) + 1;
      }
    } catch {}
    finally {
      loadingMore = false;
    }
  }
  
  // Debounced search handler
  const handleSearchDebounced = debounce((query: string) => {
    filterStore.updateFilter('query', query);
  }, 300);
  
  function handleSearch(value: string) {
    isSearching = true;
    handleSearchDebounced(value);
    setTimeout(() => { isSearching = false; }, 350);
  }
  
  // Current category path for bottom sheet
  let currentCategoryPath = $derived({
    category: filters.category,
    subcategory: filters.subcategory,
    specific: filters.specific
  });

  function handleCategorySelect(category: string | null) {
    isFilterLoading = true;
    ariaLiveMessage = category ? `Selected category: ${category}` : 'Cleared category filter';
    if (filters.category === category) {
      // Deselect if same
      filterStore.updateMultipleFilters({
        category: null,
        subcategory: null,
        specific: null
      });
    } else {
      // Select new category
      filterStore.updateMultipleFilters({
        category: category,
        subcategory: null,
        specific: null
      });
    }
    // Reset loading state after a brief delay
    setTimeout(() => { 
      isFilterLoading = false;
      ariaLiveMessage = '';
    }, 300);
  }

  // Handle category selection from bottom sheet
  function handleBottomSheetCategorySelect(path: {category: string | null, subcategory: string | null, specific: string | null}) {
    isFilterLoading = true;
    
    // Update all category filters at once
    filterStore.updateMultipleFilters({
      category: path.category,
      subcategory: path.subcategory,
      specific: path.specific
    });
    
    // Provide feedback
    const categoryName = path.specific 
      ? categoryHierarchy.specifics[`${path.category}-${path.subcategory}`]?.find(s => s.key === path.specific)?.name
      : path.subcategory 
        ? categoryHierarchy.subcategories[path.category || '']?.find(s => s.key === path.subcategory)?.name
        : path.category
          ? categoryHierarchy.categories.find(c => c.key === path.category)?.name
          : i18n.category_all();
          
    ariaLiveMessage = `Selected: ${categoryName}`;
    
    // Reset loading state after a brief delay
    setTimeout(() => { 
      isFilterLoading = false;
      ariaLiveMessage = '';
    }, 300);
  }
  
  function handleQuickCondition(conditionKey: string) {
    isFilterLoading = true;
    // Toggle off if already selected
    if (filters.condition === conditionKey) {
      filterStore.updateFilter('condition', 'all');
    } else {
      filterStore.updateFilter('condition', conditionKey);
    }
    // Reset loading state after a brief delay
    setTimeout(() => { isFilterLoading = false; }, 300);
  }
  
  function clearAllFilters() {
    filterStore.resetFilters();
    searchInput = '';
  }
  
  function handleSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    filterStore.updateFilter('sortBy', value);
  }

  // Sticky filter modal handlers
  function handlePendingFilterChange(key: string, value: any) {
    filterStore.updatePendingFilter(key, value);
  }

  function handleApplyFilters(appliedFilters: Record<string, any>) {
    filterStore.applyPendingFilters();
    showStickyFilterModal = false;
  }

  function handleCancelFilters() {
    filterStore.resetPendingFilters();
    showStickyFilterModal = false;
  }

  function handleClearFilters() {
    filterStore.resetFilters();
    searchInput = '';
  }

  function handleRemoveAppliedFilter(key: string) {
    if (key === 'minPrice') {
      filterStore.updateFilter('minPrice', '');
    } else if (key === 'maxPrice') {
      filterStore.updateFilter('maxPrice', '');
    } else if (key === 'category') {
      filterStore.updateMultipleFilters({
        category: null,
        subcategory: null,
        specific: null
      });
    } else if (key === 'subcategory') {
      filterStore.updateMultipleFilters({
        subcategory: null,
        specific: null
      });
    } else if (key === 'specific') {
      filterStore.updateFilter('specific', null);
    } else if (key === 'sortBy') {
      filterStore.updateFilter('sortBy', 'relevance');
    } else {
      filterStore.updateFilter(key as any, 'all');
    }
  }
  
  
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

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
  
  <!-- ARIA Live Region for announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {ariaLiveMessage}
  </div>
  
  <!-- Clean Header Section -->
  <div class="bg-white/40 backdrop-blur-sm sticky z-30 border-b border-gray-100" style="top: var(--app-header-offset, 56px);">
    <div class="px-2 sm:px-4 lg:px-6">
      
      <!-- Search Container -->
      <div class="py-3">
        <IntegratedSearchBar
          bind:searchValue={searchInput}
          placeholder={i18n.search_placeholder()}
          onSearch={(query) => filterStore.updateFilter('query', query)}
          onInput={handleSearch}
          searchId="search-page-input"
        >
          {#snippet leftSection()}
            <CategoryBottomSheet
              bind:open={showCategoryBottomSheet}
              {categoryHierarchy}
              selectedPath={currentCategoryPath}
              onCategorySelect={handleBottomSheetCategorySelect}
              allCategoriesLabel={i18n.search_categories()}
              backLabel={i18n.common_back()}
              allLabel={i18n.category_all()}
              class="h-12 rounded-l-xl border-0"
            >
              {#snippet trigger()}
                <span class="text-base">
                  {filters.category ? 
                    categoryHierarchy.categories.find(cat => cat.key === filters.category)?.icon || '📁' : 
                    '📁'
                  }
                </span>
                <span>
                  {filters.specific ? 
                    categoryHierarchy.specifics[`${filters.category}-${filters.subcategory}`]?.find(cat => cat.key === filters.specific)?.name || 
                    (filters.subcategory ? categoryHierarchy.subcategories[filters.category]?.find(cat => cat.key === filters.subcategory)?.name : i18n.category_all()) :
                    filters.subcategory ? 
                      categoryHierarchy.subcategories[filters.category]?.find(cat => cat.key === filters.subcategory)?.name :
                      filters.category ? 
                        categoryHierarchy.categories.find(cat => cat.key === filters.category)?.name : 
                        i18n.category_all()
                  }
                </span>
                <svg class="w-4 h-4 transition-transform {showCategoryBottomSheet ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              {/snippet}
            </CategoryBottomSheet>
          {/snippet}
        </IntegratedSearchBar>
      </div>
      
      <!-- Quick Category & Price Pills -->
      <div class="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
        <!-- Main Category Pills -->
        <button
          onclick={() => handleCategorySelect(null)}
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-9
            {filters.category === null 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {i18n.search_all()}
        </button>
        
        {#each mainCategories as cat}
          <button
            onclick={() => handleCategorySelect(cat.key)}
            class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 min-h-9
              {filters.category === cat.key 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        {/each}
        
        <div class="w-px h-5 bg-gray-200 mx-2"></div>
        
        <!-- Condition Pills -->
        {#each quickConditionFilters as condition, index}
          <button
            onclick={() => handleQuickCondition(condition.key)}
            class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-9 relative overflow-hidden
              {filters.condition === condition.key
                ? index === 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md' 
                  : index === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : index === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
          >
            <span class="relative z-10 flex items-center gap-1">
              {#if index === 0}
                <span class="w-1.5 h-1.5 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-emerald-500'}"></span>
              {:else if index === 1}
                <span class="w-1.5 h-1.5 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-blue-500'}"></span>
              {:else if index === 2}
                <span class="w-1.5 h-1.5 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-amber-500'}"></span>
              {:else}
                <span class="w-1.5 h-1.5 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-slate-500'}"></span>
              {/if}
              {condition.shortLabel}
            </span>
          </button>
        {/each}
        
        <!-- Clear All Quick Action -->
        {#if activeFilterCount > 0}
          <button
            onclick={clearAllFilters}
            class="shrink-0 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {i18n.search_clearAll()}
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Clean Filter Bar Above Products -->
  <div class="bg-white/40 backdrop-blur-sm border-b border-gray-100">
    <div class="px-2 sm:px-4 lg:px-6 py-3">
      
      <!-- Mobile Layout - Results Count + Filter Button + Filter Pills -->
      <div class="sm:hidden mb-3 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-900">
            {displayProducts.length} items
          </span>
          <!-- Applied Filter Pills (mobile - inline) -->
          {#if activeFilterCount > 0}
            <AppliedFilterPills
              filters={filters}
              categoryLabels={{
                women: i18n.category_women(),
                men: i18n.category_men(),
                kids: i18n.category_kids(),
                unisex: i18n.category_unisex()
              }}
              onRemoveFilter={handleRemoveAppliedFilter}
              onClearAll={handleClearFilters}
              clearAllLabel={i18n.search_clearAllFilters()}
              class="justify-start"
              maxDisplay={3}
              showMore={false}
            />
          {/if}
        </div>
        <!-- Mobile Sticky Filter Modal -->
        <StickyFilterModal 
            bind:open={showStickyFilterModal}
            sections={[
              {
                key: 'size',
                label: i18n.filter_size(),
                type: 'pills',
                value: pendingFilters.size,
                options: currentSizes.map(size => ({ value: size, label: size }))
              },
              {
                key: 'condition', 
                label: i18n.filter_condition(),
                type: 'pills',
                value: pendingFilters.condition,
                options: conditions.map(c => ({ value: c.key, label: c.label, icon: c.emoji }))
              },
              {
                key: 'brand',
                label: i18n.filter_brand(), 
                type: 'pills',
                value: pendingFilters.brand,
                options: currentBrands.map(brand => ({ value: brand, label: brand }))
              },
              {
                key: 'price',
                label: i18n.filter_priceRange(),
                type: 'range',
                minValue: pendingFilters.minPrice,
                maxValue: pendingFilters.maxPrice,
                placeholder: { min: i18n.search_min(), max: i18n.search_max() }
              },
              {
                key: 'sortBy',
                label: i18n.filter_sortBy(),
                type: 'pills', 
                value: pendingFilters.sortBy,
                options: [
                  { value: 'relevance', label: i18n.search_relevance() },
                  { value: 'newest', label: i18n.filter_newest() },
                  { value: 'price-low', label: i18n.filter_priceLowToHigh() },
                  { value: 'price-high', label: i18n.filter_priceHighToLow() }
                ]
              }
            ]}
            appliedFilters={filters}
            pendingFilters={pendingFilters}
            previewResultCount={previewFilteredProducts.length}
            totalResultCount={filterStore.allProducts.length}
            title={i18n.search_filters()}
            applyLabel={i18n.filter_apply()}
            cancelLabel={i18n.common_cancel()}
            clearLabel={i18n.filter_reset()}
            closeLabel={i18n.common_close()}
            minPriceLabel={i18n.search_min()}
            maxPriceLabel={i18n.search_max()}
            onPendingFilterChange={handlePendingFilterChange}
            onApply={handleApplyFilters}
            onCancel={handleCancelFilters}
            onClear={handleClearFilters}
            announceChanges={true}
          >
            {#snippet trigger()}
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
{i18n.search_filters()}
            {/snippet}
          </StickyFilterModal>
      </div>
      
      <!-- Applied Filter Pills (desktop only) -->
      <div class="hidden sm:block">
        {#if activeFilterCount > 0}
          <div class="flex items-center gap-2 flex-wrap px-1">
            <AppliedFilterPills
              filters={filters}
              categoryLabels={{
                women: i18n.category_women(),
                men: i18n.category_men(),
                kids: i18n.category_kids(),
                unisex: i18n.category_unisex()
              }}
              onRemoveFilter={handleRemoveAppliedFilter}
              onClearAll={handleClearFilters}
              clearAllLabel={i18n.search_clearAllFilters()}
              class="justify-center"
              maxDisplay={8}
              showMore={false}
            />
          </div>
        {/if}
      </div>
      
      <!-- Desktop Layout -->
      <div class="hidden sm:flex items-center justify-between">
        <span class="text-sm font-medium text-gray-900">
          {displayProducts.length} items found
        </span>
        
        <!-- Desktop Filter Controls -->
        <div class="flex items-center gap-3">
          <!-- Sort -->
          <select 
            value={filters.sortBy}
            onchange={handleSortChange}
            class="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <option value="relevance">{i18n.search_relevance()}</option>
            <option value="newest">{i18n.filter_newest()}</option>
            <option value="price-low">{i18n.filter_priceLowToHigh()}</option>
            <option value="price-high">{i18n.filter_priceHighToLow()}</option>
          </select>
          
          <!-- Desktop Filter Modal Trigger -->
          <button
            onclick={() => showStickyFilterModal = true}
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              {activeFilterCount > 0 
                ? 'bg-[color:var(--primary)] text-[color:var(--primary-fg)]' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
{i18n.search_filters()}
            {#if activeFilterCount > 0}
              <span class="bg-white text-[color:var(--primary)] text-xs px-1.5 py-0.5 rounded-full font-semibold">{activeFilterCount}</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Products Grid (window scroll + infinite load) -->
  <div class="px-2 sm:px-4 lg:px-6 py-3">
    {#if displayProductsWithCategory.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each displayProductsWithCategory as product}
          <ProductCard 
            {product}
            onclick={() => goto(getProductUrl(product))}
            translations={{
              size: i18n.product_size(),
              newSeller: i18n.trending_newSeller(),
              unknownSeller: i18n.seller_unknown(),
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
        {/each}
      </div>
      <!-- Infinite scroll sentinel -->
      {#if hasMore}
        <div class="flex justify-center py-6">
          <div class="text-xs text-gray-500">{loadingMore ? 'Loading more…' : 'Scroll to load more'}</div>
        </div>
        <div bind:this={loadMoreTrigger} class="h-1"></div>
      {/if}
      
      <!-- Simple Pagination (disabled when infinite scroll is active) -->
      {#if false && (data.hasMore || data.currentPage > 1)}
        <div class="flex justify-center items-center gap-4 mt-8 mb-4">
          {#if data.currentPage > 1}
            <button
              onclick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', String(data.currentPage - 1));
                goto(url.pathname + url.search);
              }}
              class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-9"
            >
              ← Previous
            </button>
          {/if}
          
          <span class="text-sm text-gray-600">
            Page {data.currentPage}
          </span>
          
          {#if data.hasMore}
            <button
              onclick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', String(data.currentPage + 1));
                goto(url.pathname + url.search);
              }}
              class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-9"
            >
              Next →
            </button>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{i18n.search_noItemsFound()}</h3>
        <p class="text-gray-600 text-sm">{i18n.search_adjustFilters()}</p>
        {#if activeFilterCount > 0}
          <Button onclick={clearAllFilters} variant="outline" size="sm" class="mt-4">
            {i18n.search_clearAllFilters()}
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</div>


<BottomNav 
  currentPath={$page.url.pathname}
  isNavigating={!!$navigating}
  navigatingTo={$navigating?.to?.url.pathname}
  unreadMessageCount={$unreadMessageCount}
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

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
