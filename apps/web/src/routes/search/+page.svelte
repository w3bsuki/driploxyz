<script lang="ts">
  import { ProductCard, Button, SearchBar, ProductCardSkeleton, BottomNav, type Product } from '@repo/ui';
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
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Initialize filter store
  const filterStore = createProductFilter();
  
  // Core UI state
  let showFilterDrawer = $state(false);
  let showFilterDropdown = $state(false);
  let showCategoryDropdown = $state(false);
  let isSearching = $state(false);
  let isFilterLoading = $state(false);
  let searchInput = $state('');
  let categoryLevel = $state(1); // 1=gender, 2=type, 3=specific
  
  // Single derived filter state for performance
  let filters = $derived(filterStore.filters);
  
  // Category hierarchy from server data
  let categoryHierarchy = $derived((() => {
    if (!data.categoryHierarchy || Object.keys(data.categoryHierarchy).length === 0) {
      return {
        level1: [],
        level2: {},
        level3: {}
      };
    }
    
    const hierarchy = {
      level1: [] as Array<{key: string, name: string, icon: string, id: string}>,
      level2: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>,
      level3: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>
    };
    
    Object.entries(data.categoryHierarchy).forEach(([slug, catData]: [string, any]) => {
      hierarchy.level1.push({
        key: slug,
        name: translateCategory(catData.name),
        icon: getCategoryIcon(catData.name),
        id: catData.id
      });
      
      if (catData.level2) {
        hierarchy.level2[slug] = [];
        Object.entries(catData.level2).forEach(([l2Slug, l2Data]: [string, any]) => {
          const cleanSlug = l2Slug.replace(`${slug}-`, '').replace('-new', '');
          hierarchy.level2[slug].push({
            key: cleanSlug,
            name: translateCategory(l2Data.name),
            icon: getCategoryIcon(l2Data.name),
            id: l2Data.id
          });
          
          if (l2Data.level3 && Array.isArray(l2Data.level3)) {
            const level3Key = `${slug}-${cleanSlug}`;
            hierarchy.level3[level3Key] = l2Data.level3.map((l3: any) => ({
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
    hierarchy.level1.sort((a, b) => {
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
  
  // Initialize from server data
  $effect(() => {
    if (data.products) {
      filterStore.setProducts(data.products);
    }
    
    if (data.filters) {
      filterStore.updateMultipleFilters({
        query: data.searchQuery || '',
        level1: data.filters.category || null,
        level2: data.filters.subcategory || null,
        level3: data.filters.specific || null,
        size: data.filters.size || 'all',
        brand: data.filters.brand || 'all',
        condition: data.filters.condition || 'all',
        minPrice: data.filters.minPrice || '',
        maxPrice: data.filters.maxPrice || '',
        sortBy: data.filters.sortBy || 'relevance'
      });
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
    commonSizes[filters.level1 as keyof typeof commonSizes] || commonSizes.default
  );
  
  // Get current brands (using popular brands for now)
  let currentBrands = $derived(popularBrands);
  
  // Active filter count for badge
  let activeFilterCount = $derived(
    [
      filters.size !== 'all' ? 1 : 0,
      filters.brand !== 'all' ? 1 : 0,
      filters.condition !== 'all' ? 1 : 0,
      (filters.minPrice || filters.maxPrice) ? 1 : 0,
      (filters.level2 || filters.level3) ? 1 : 0
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
  
  // Debounced search handler
  const handleSearchDebounced = debounce((query: string) => {
    filterStore.updateFilter('query', query);
  }, 300);
  
  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchInput = value;
    isSearching = true;
    handleSearchDebounced(value);
    setTimeout(() => { isSearching = false; }, 350);
  }
  
  function handleCategorySelect(category: string | null) {
    isFilterLoading = true;
    if (filters.level1 === category) {
      // Deselect if same
      filterStore.updateMultipleFilters({
        level1: null,
        level2: null,
        level3: null
      });
    } else {
      // Select new category
      filterStore.updateMultipleFilters({
        level1: category,
        level2: null,
        level3: null
      });
    }
    // Reset loading state after a brief delay
    setTimeout(() => { isFilterLoading = false; }, 300);
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
  
  // Close dropdown when clicking outside
  function handleClickOutside(e: MouseEvent) {
    if (showCategoryDropdown) {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        showCategoryDropdown = false;
      }
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

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0" onclick={handleClickOutside}>
  
  <!-- Clean Header Section -->
  <div class="bg-white sticky top-0 z-30 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Search Container -->
      <div class="py-3">
        <div class="bg-gray-50 rounded-xl flex items-center relative category-dropdown">
          <!-- Category Dropdown (Vinted Style) -->
          <button
            onclick={() => {
              showCategoryDropdown = !showCategoryDropdown;
              categoryLevel = 1;
            }}
            class="flex items-center gap-2 h-12 px-3 sm:px-4 hover:bg-gray-100 rounded-l-xl text-sm font-medium transition-colors border-0 focus:ring-2 focus:ring-black"
          >
            <span class="text-base">
              {filters.level1 ? 
                categoryHierarchy.level1.find(cat => cat.key === filters.level1)?.icon || '📁' : 
                '📁'
              }
            </span>
            <!-- Mobile: Just icon + arrow -->
            <span class="sm:hidden">
              <svg class="w-4 h-4 transition-transform {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <!-- Desktop: Full text -->
            <span class="hidden sm:block">
              {filters.level3 ? 
                categoryHierarchy.level3[`${filters.level1}-${filters.level2}`]?.find(cat => cat.key === filters.level3)?.name || 
                (filters.level2 ? categoryHierarchy.level2[filters.level1]?.find(cat => cat.key === filters.level2)?.name : 'All Categories') :
                filters.level2 ? 
                  categoryHierarchy.level2[filters.level1]?.find(cat => cat.key === filters.level2)?.name :
                  filters.level1 ? 
                    categoryHierarchy.level1.find(cat => cat.key === filters.level1)?.name : 
                    'All Categories'
              }
            </span>
            <svg class="hidden sm:block w-4 h-4 transition-transform {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Vertical Separator -->
          <div class="w-px h-6 bg-gray-300"></div>
          
          <!-- Search Input -->
          <div class="flex-1 relative">
            <input
              type="search"
              value={searchInput}
              oninput={handleSearch}
              placeholder={i18n.search_placeholder()}
              class="w-full h-12 pl-10 pr-16 bg-transparent border-0 text-base placeholder-gray-500 focus:ring-0 focus:outline-none"
            />
            <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
          </div>
          
          <!-- Category Dropdown Menu -->
          {#if showCategoryDropdown}
            <div class="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200/60 z-40 max-h-[360px] overflow-hidden">
                
                <!-- Level 1: Gender Categories -->
                {#if categoryLevel === 1}
                  <div class="p-2">
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
                      Categories
                    </div>
                    <div class="space-y-0.5 overflow-y-auto max-h-72">
                      <button
                        onclick={() => {
                          filterStore.updateMultipleFilters({ level1: null, level2: null, level3: null });
                          showCategoryDropdown = false;
                        }}
                        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors
                          {!filters.level1 ? 'bg-gray-100' : ''}"
                      >
                        <span class="text-base">🌍</span>
                        <span class="text-sm font-medium text-gray-900">All Categories</span>
                      </button>
                      {#each categoryHierarchy.level1 as category}
                        <button
                          onclick={() => {
                            // First, set the filter
                            filterStore.updateMultipleFilters({ level1: category.key, level2: null, level3: null });
                            
                            // Then navigate to next level if subcategories exist
                            if (categoryHierarchy.level2[category.key]?.length > 0) {
                              categoryLevel = 2;
                            } else {
                              // No subcategories, close dropdown
                              showCategoryDropdown = false;
                            }
                          }}
                          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors group
                            {filters.level1 === category.key ? 'bg-blue-50 text-blue-700' : ''}"
                        >
                          <div class="flex items-center gap-2.5">
                            <span class="text-base">{category.icon}</span>
                            <span class="text-sm font-medium text-gray-900 {filters.level1 === category.key ? 'text-blue-700' : ''}">{category.name}</span>
                          </div>
                          {#if categoryHierarchy.level2[category.key]?.length > 0}
                            <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                <!-- Level 2: Product Types -->
                {#if categoryLevel === 2 && filters.level1 && categoryHierarchy.level2[filters.level1]}
                  <div class="p-2">
                    <button
                      onclick={() => categoryLevel = 1}
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Categories
                    </button>
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
                      {categoryHierarchy.level1.find(cat => cat.key === filters.level1)?.name}
                    </div>
                    <div class="space-y-0.5 overflow-y-auto max-h-72">
                      <button
                        onclick={() => {
                          filterStore.updateMultipleFilters({ level2: null, level3: null });
                          showCategoryDropdown = false;
                        }}
                        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors
                          {!filters.level2 ? 'bg-gray-100' : ''}"
                      >
                        <span class="text-base">📦</span>
                        <span class="text-sm font-medium text-gray-900">All {categoryHierarchy.level1.find(cat => cat.key === filters.level1)?.name}</span>
                      </button>
                      {#each categoryHierarchy.level2[filters.level1] as subcategory}
                        <button
                          onclick={() => {
                            // First, set the level2 filter
                            filterStore.updateMultipleFilters({ level2: subcategory.key, level3: null });
                            
                            // Then check if we need to go to level 3
                            if (categoryHierarchy.level3[`${filters.level1}-${subcategory.key}`]?.length > 0) {
                              categoryLevel = 3;
                            } else {
                              // No level 3 subcategories, close dropdown
                              showCategoryDropdown = false;
                            }
                          }}
                          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors group
                            {filters.level2 === subcategory.key ? 'bg-blue-50 text-blue-700' : ''}"
                        >
                          <div class="flex items-center gap-2.5">
                            <span class="text-base">{subcategory.icon}</span>
                            <span class="text-sm font-medium text-gray-900 {filters.level2 === subcategory.key ? 'text-blue-700' : ''}">{subcategory.name}</span>
                          </div>
                          {#if categoryHierarchy.level3[`${filters.level1}-${subcategory.key}`]?.length > 0}
                            <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                <!-- Level 3: Specific Items -->
                {#if categoryLevel === 3 && filters.level1 && filters.level2 && categoryHierarchy.level3[`${filters.level1}-${filters.level2}`]}
                  <div class="p-2">
                    <button
                      onclick={() => categoryLevel = 2}
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to {categoryHierarchy.level2[filters.level1]?.find(cat => cat.key === filters.level2)?.name}
                    </button>
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
                      {categoryHierarchy.level2[filters.level1]?.find(cat => cat.key === filters.level2)?.name}
                    </div>
                    <div class="space-y-0.5 overflow-y-auto max-h-72">
                      <button
                        onclick={() => {
                          filterStore.updateFilter('level3', null);
                          showCategoryDropdown = false;
                        }}
                        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors
                          {!filters.level3 ? 'bg-gray-100' : ''}"
                      >
                        <span class="text-base">📄</span>
                        <span class="text-sm font-medium text-gray-900">All {categoryHierarchy.level2[filters.level1]?.find(cat => cat.key === filters.level2)?.name}</span>
                      </button>
                      {#each categoryHierarchy.level3[`${filters.level1}-${filters.level2}`] as specific}
                        <button
                          onclick={() => {
                            filterStore.updateFilter('level3', specific.key);
                            showCategoryDropdown = false;
                          }}
                          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors group
                            {filters.level3 === specific.key ? 'bg-blue-50 text-blue-700' : ''}"
                        >
                          <span class="text-base">{specific.icon}</span>
                          <span class="text-sm font-medium text-gray-900 {filters.level3 === specific.key ? 'text-blue-700' : ''}">{specific.name}</span>
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
        </div>
      </div>
      
      <!-- Quick Category & Price Pills -->
      <div class="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
        <!-- Main Category Pills -->
        <button
          onclick={() => handleCategorySelect(null)}
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-9
            {filters.level1 === null 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          All Items
        </button>
        
        {#each mainCategories as cat}
          <button
            onclick={() => handleCategorySelect(cat.key)}
            class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 min-h-9
              {filters.level1 === cat.key 
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
            Clear all
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Clean Filter Bar Above Products -->
  <div class="bg-white border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      
      <!-- Mobile Layout - Results Count + Filter Button -->
      <div class="sm:hidden mb-3 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-900">
          {displayProducts.length} items
        </span>
        <div class="relative">
          <button
            onclick={() => showFilterDropdown = !showFilterDropdown}
            class="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors
              {activeFilterCount > 0 
                ? 'bg-black text-white' 
                : 'bg-black text-white hover:bg-gray-800'}"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {#if activeFilterCount > 0}
              <span class="bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-semibold">{activeFilterCount}</span>
            {/if}
          </button>
          
          <!-- Mobile Filter Dropdown -->
          {#if showFilterDropdown}
            <div class="absolute top-full right-0 mt-2 w-[calc(100vw-32px)] max-w-sm bg-white rounded-xl shadow-lg border border-gray-100 z-[60]">
              <!-- Size -->
              <div class="border-b border-gray-100 py-3">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Size</h3>
                <div class="flex gap-2 overflow-x-auto scrollbar-hide px-4">
                  <button
                    onclick={() => filterStore.updateFilter('size', 'all')}
                    class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                      {filters.size === 'all' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-700'}"
                  >
                    All
                  </button>
                  {#each currentSizes as size}
                    <button
                      onclick={() => filterStore.updateFilter('size', filters.size === size ? 'all' : size)}
                      class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                        {filters.size === size 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700'}"
                    >
                      {size}
                    </button>
                  {/each}
                </div>
              </div>
              
              <!-- Condition -->
              <div class="border-b border-gray-100 py-3">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Condition</h3>
                <div class="flex gap-2 overflow-x-auto scrollbar-hide px-4">
                  <button
                    onclick={() => filterStore.updateFilter('condition', 'all')}
                    class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                      {filters.condition === 'all' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-700'}"
                  >
                    All
                  </button>
                  {#each conditions as condition}
                    <button
                      onclick={() => filterStore.updateFilter('condition', filters.condition === condition.key ? 'all' : condition.key)}
                      class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                        {filters.condition === condition.key 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700'}"
                    >
                      {condition.label}
                    </button>
                  {/each}
                </div>
              </div>
              
              <!-- Brand -->
              <div class="border-b border-gray-100 py-3">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Brand</h3>
                <div class="flex gap-2 overflow-x-auto scrollbar-hide px-4">
                  <button
                    onclick={() => filterStore.updateFilter('brand', 'all')}
                    class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                      {filters.brand === 'all' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-700'}"
                  >
                    All
                  </button>
                  {#each currentBrands as brand}
                    <button
                      onclick={() => filterStore.updateFilter('brand', filters.brand === brand ? 'all' : brand)}
                      class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-8
                        {filters.brand === brand 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700'}"
                    >
                      {brand}
                    </button>
                  {/each}
                </div>
              </div>
              
              <!-- Price Range -->
              <div class="border-b border-gray-100 py-3">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Price</h3>
                <div class="flex gap-2 overflow-x-auto scrollbar-hide px-4">
                  <div class="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      oninput={(e) => filterStore.updateFilter('minPrice', e.target.value)}
                      class="w-16 px-2 py-1.5 border border-gray-200 rounded-full text-sm text-center"
                    />
                    <span class="text-gray-400 text-sm">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      oninput={(e) => filterStore.updateFilter('maxPrice', e.target.value)}
                      class="w-16 px-2 py-1.5 border border-gray-200 rounded-full text-sm text-center"
                    />
                  </div>
                  {#each quickConditionFilters.slice(0, 2) as condition, index}
                    <button
                      onclick={() => handleQuickCondition(condition.key)}
                      class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-8 relative overflow-hidden
                        {filters.condition === condition.key
                          ? index === 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300'}"
                    >
                      <span class="relative z-10 flex items-center gap-1">
                        {#if index === 0}
                          <span class="w-1 h-1 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-emerald-500'}"></span>
                        {:else}
                          <span class="w-1 h-1 rounded-full {filters.condition === condition.key ? 'bg-white' : 'bg-blue-500'}"></span>
                        {/if}
                        {condition.shortLabel}
                      </span>
                    </button>
                  {/each}
                </div>
              </div>
              
              <!-- Clear All -->
              {#if activeFilterCount > 0}
                <div class="px-4 py-2">
                  <button
                    onclick={clearAllFilters}
                    class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Desktop Layout -->
      <div class="hidden sm:flex items-center justify-between">
        <span class="text-sm font-medium text-gray-900">
          {displayProducts.length} items found
        </span>
        
        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-2">
          <!-- Category Filter -->
          <select 
            value={filters.level1 || 'all'}
            onchange={(e) => handleCategorySelect(e.currentTarget.value === 'all' ? null : e.currentTarget.value)}
            class="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            {#each mainCategories as cat}
              <option value={cat.key}>{cat.label}</option>
            {/each}
          </select>
          
          <!-- Condition Filter -->
          <select 
            value={filters.condition}
            onchange={(e) => filterStore.updateFilter('condition', e.currentTarget.value)}
            class="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <option value="all">All Conditions</option>
            {#each conditions as condition}
              <option value={condition.key}>{condition.label}</option>
            {/each}
          </select>
          
          <!-- Brand Filter -->
          <select 
            value={filters.brand}
            onchange={(e) => filterStore.updateFilter('brand', e.currentTarget.value)}
            class="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <option value="all">All Brands</option>
            {#each popularBrands as brand}
              <option value={brand}>{brand}</option>
            {/each}
          </select>
          
          <!-- Sort -->
          <select 
            value={filters.sortBy}
            onchange={handleSortChange}
            class="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <option value="relevance">Best Match</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          
          <!-- More Filters Button -->
          <div class="relative">
            <button
              onclick={() => showFilterDropdown = !showFilterDropdown}
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                {activeFilterCount > 0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
            >
              More
              {#if activeFilterCount > 0}
                <span class="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">{activeFilterCount}</span>
              {/if}
            </button>
            
            <!-- Desktop Filter Dropdown -->
            {#if showFilterDropdown}
              <div class="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-40 p-4 space-y-3">
                <!-- Size -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 mb-2">Size</h3>
                  <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onclick={() => filterStore.updateFilter('size', 'all')}
                      class="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        {filters.size === 'all' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                    >
                      All Sizes
                    </button>
                    {#each currentSizes as size}
                      <button
                        onclick={() => filterStore.updateFilter('size', filters.size === size ? 'all' : size)}
                        class="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          {filters.size === size 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                      >
                        {size}
                      </button>
                    {/each}
                  </div>
                </div>
                
                <!-- Price Range -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 mb-2">Price Range</h3>
                  <div class="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      oninput={(e) => filterStore.updateFilter('minPrice', e.target.value)}
                      class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <span class="flex items-center text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      oninput={(e) => filterStore.updateFilter('maxPrice', e.target.value)}
                      class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                
                <!-- Clear Button -->
                {#if activeFilterCount > 0}
                  <button
                    onclick={clearAllFilters}
                    class="w-full px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Products Grid -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    {#if displayProducts.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each displayProducts as product}
          <ProductCard 
            {product}
            onclick={() => goto(`/product/${product.id}`)}
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
      
      <!-- Simple Pagination -->
      {#if data.hasMore || data.currentPage > 1}
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
            Clear all filters
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