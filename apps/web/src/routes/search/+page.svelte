<script lang="ts">
  import { ProductCard, Button, SearchBar, MegaMenu, CategorySidebar, ProductCardSkeleton, BottomNav, type Product, type CategoryData } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  
  interface Props {
    data: PageData;
  }
  
  // Search and filter states
  let searchQuery = $state('');
  let selectedMainCategory = $state<string | null>(null);
  let selectedSubcategory = $state<string | null>(null);
  let selectedSize = $state('all');
  let selectedBrand = $state('all');
  let selectedCondition = $state('all');
  let priceMin = $state('');
  let priceMax = $state('');
  let sortBy = $state('relevance');
  let showFilters = $state(false);
  let showMegaMenu = $state(false);
  let isLoading = $state(false);
  let isSearching = $state(false);
  
  let { data }: Props = $props();

  // Initialize search state from server data and URL parameters
  $effect(() => {
    if (data.searchQuery) {
      searchQuery = data.searchQuery;
    }
    if (data.filters) {
      if (data.filters.category) selectedMainCategory = data.filters.category;
      if (data.filters.size) selectedSize = data.filters.size;
      if (data.filters.brand) selectedBrand = data.filters.brand;
      if (data.filters.condition) selectedCondition = data.filters.condition;
      if (data.filters.minPrice) priceMin = data.filters.minPrice;
      if (data.filters.maxPrice) priceMax = data.filters.maxPrice;
      if (data.filters.sortBy) sortBy = data.filters.sortBy;
    }
  });
  
  // Category data structure with subcategories using i18n
  const categoryData = $derived<CategoryData>(() => ({
    women: {
      name: i18n.category_women(),
      icon: '👗',
      subcategories: [
        { name: i18n.subcategory_dresses(), icon: '👗' },
        { name: i18n.subcategory_tops(), icon: '👚' },
        { name: i18n.subcategory_jeans(), icon: '👖' },
        { name: i18n.subcategory_skirts(), icon: '👠' },
        { name: i18n.subcategory_jackets(), icon: '🧥' },
        { name: i18n.category_shoes(), icon: '👠' },
        { name: i18n.category_bags(), icon: '👜' },
        { name: i18n.subcategory_accessories(), icon: '💍' }
      ]
    },
    men: {
      name: i18n.category_men(),
      icon: '👔',
      subcategories: [
        { name: i18n.subcategory_tshirts(), icon: '👕' },
        { name: i18n.subcategory_shirts(), icon: '👔' },
        { name: i18n.subcategory_jeans(), icon: '👖' },
        { name: i18n.subcategory_jackets(), icon: '🧥' },
        { name: i18n.subcategory_suits(), icon: '🤵' },
        { name: i18n.category_shoes(), icon: '👞' },
        { name: i18n.subcategory_watches(), icon: '⌚' },
        { name: i18n.subcategory_accessories(), icon: '🎩' }
      ]
    },
    kids: {
      name: i18n.category_kids(),
      icon: '👶',
      subcategories: [
        { name: i18n.subcategory_baby(), icon: '👶' },
        { name: i18n.subcategory_girls2to8(), icon: '👧' },
        { name: i18n.subcategory_boys2to8(), icon: '👦' },
        { name: i18n.subcategory_girls9to16(), icon: '🧒' },
        { name: i18n.subcategory_boys9to16(), icon: '🧒' },
        { name: i18n.category_shoes(), icon: '👟' },
        { name: i18n.subcategory_school(), icon: '🎒' },
        { name: i18n.subcategory_toys(), icon: '🧸' }
      ]
    },
    pets: {
      name: i18n.category_pets(),
      icon: '🐕',
      subcategories: [
        { name: i18n.subcategory_dogApparel(), icon: '🐕' },
        { name: i18n.subcategory_catAccessories(), icon: '🐱' },
        { name: i18n.subcategory_petToys(), icon: '🦴' },
        { name: i18n.subcategory_leashes(), icon: '🦮' },
        { name: i18n.subcategory_beds(), icon: '🛏️' },
        { name: i18n.subcategory_foodBowls(), icon: '🥣' },
        { name: i18n.subcategory_carriers(), icon: '🎒' }
      ]
    },
    shoes: {
      name: i18n.category_shoes(),
      icon: '👟',
      subcategories: [
        { name: i18n.subcategory_sneakers(), icon: '👟' },
        { name: i18n.subcategory_boots(), icon: '🥾' },
        { name: i18n.subcategory_heels(), icon: '👠' },
        { name: i18n.subcategory_flats(), icon: '🩰' },
        { name: i18n.subcategory_sandals(), icon: '👡' },
        { name: i18n.subcategory_athletic(), icon: '⚽' },
        { name: i18n.subcategory_dressShoes(), icon: '👞' }
      ]
    },
    bags: {
      name: i18n.category_bags(),
      icon: '👜',
      subcategories: [
        { name: i18n.subcategory_handbags(), icon: '👜' },
        { name: i18n.subcategory_backpacks(), icon: '🎒' },
        { name: i18n.subcategory_totes(), icon: '👝' },
        { name: i18n.subcategory_clutches(), icon: '💼' },
        { name: i18n.subcategory_crossbody(), icon: '👜' },
        { name: i18n.subcategory_travel(), icon: '🧳' },
        { name: i18n.subcategory_laptopBags(), icon: '💻' }
      ]
    },
    home: {
      name: i18n.category_home(),
      icon: '🏠',
      subcategories: [
        { name: i18n.subcategory_decor(), icon: '🖼️' },
        { name: i18n.subcategory_bedding(), icon: '🛏️' },
        { name: i18n.subcategory_kitchen(), icon: '🍽️' },
        { name: i18n.subcategory_lighting(), icon: '💡' },
        { name: i18n.subcategory_storage(), icon: '📦' },
        { name: i18n.subcategory_garden(), icon: '🌱' },
        { name: i18n.subcategory_art(), icon: '🎨' },
        { name: i18n.subcategory_textiles(), icon: '🧶' }
      ]
    },
    beauty: {
      name: i18n.category_beauty(),
      icon: '💄',
      subcategories: [
        { name: i18n.subcategory_makeup(), icon: '💄' },
        { name: i18n.subcategory_skincare(), icon: '🧴' },
        { name: i18n.subcategory_fragrance(), icon: '🌺' },
        { name: i18n.subcategory_hairCare(), icon: '💇' },
        { name: i18n.subcategory_tools(), icon: '🪞' },
        { name: i18n.subcategory_nails(), icon: '💅' },
        { name: i18n.subcategory_bathBody(), icon: '🛁' },
        { name: i18n.subcategory_sets(), icon: '🎁' }
      ]
    },
    unisex: {
      name: 'Unisex',
      icon: '👥',
      subcategories: [
        { name: 'Hoodies', icon: '🧥' },
        { name: 'T-Shirts', icon: '👕' },
        { name: 'Jeans', icon: '👖' },
        { name: 'Sneakers', icon: '👟' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Backpacks', icon: '🎒' },
        { name: 'Hats', icon: '🧢' },
        { name: 'Sunglasses', icon: '🕶️' }
      ]
    },
    accessories: {
      name: 'Accessories',
      icon: '💍',
      subcategories: [
        { name: 'Jewelry', icon: '💍' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Sunglasses', icon: '🕶️' },
        { name: 'Hats', icon: '🧢' },
        { name: 'Scarves', icon: '🧣' },
        { name: 'Belts', icon: '👔' },
        { name: 'Wallets', icon: '👛' }
      ]
    }
  }));
  
  
  // Smart filter data based on category
  const smartFilterData = {
    women: {
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      brands: ['Zara', 'H&M', 'Mango', 'COS', 'ASOS', 'Urban Outfitters', 'Free People', 'Other']
    },
    men: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      brands: ['Nike', 'Adidas', 'Levi\'s', 'Uniqlo', 'Gap', 'Patagonia', 'North Face', 'Other']
    },
    kids: {
      sizes: ['0-3m', '3-6m', '6-12m', '12-18m', '18-24m', '2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'],
      brands: ['Gap Kids', 'H&M Kids', 'Zara Kids', 'Nike', 'Adidas', 'Carter\'s', 'OshKosh', 'Other']
    },
    shoes: {
      sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
      brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Vans', 'Converse', 'Dr. Martens', 'Other']
    },
    bags: {
      sizes: ['Mini', 'Small', 'Medium', 'Large', 'XL'],
      brands: ['Coach', 'Michael Kors', 'Kate Spade', 'Longchamp', 'Fjällräven', 'Herschel', 'JanSport', 'Other']
    },
    default: {
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Uniqlo', 'Gap', 'Other']
    }
  };
  
  // Get smart filters based on selected category
  const currentFilters = $derived(() => {
    const category = selectedMainCategory || 'default';
    return smartFilterData[category] || smartFilterData.default;
  });
  
  const sizes = $derived(() => currentFilters().sizes);
  const brands = $derived(() => currentFilters().brands);
  const conditions = ['new', 'like-new', 'good', 'fair'];
  
  // Transform server products to component format
  const displayProducts = $derived(() => {
    return (data.products || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      images: product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'],
      brand: product.brand,
      size: product.size,
      condition: product.condition as Product['condition'],
      category: product.category?.name || 'Uncategorized',
      sellerId: product.seller_id,
      sellerName: product.seller?.username || 'Unknown',
      sellerRating: product.seller?.rating ? Number(product.seller.rating) : null,
      sellerAvatar: product.seller?.avatar_url,
      createdAt: product.created_at,
      location: product.location || 'Unknown'
    }));
  });
  
  let activeFiltersCount = $derived(() => {
    let count = 0;
    if (selectedMainCategory) count++;
    if (selectedSubcategory) count++;
    if (selectedSize !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (priceMin || priceMax) count++;
    return count;
  });
  
  
  function clearFilters() {
    selectedMainCategory = null;
    selectedSubcategory = null;
    selectedSize = 'all';
    selectedBrand = 'all';
    selectedCondition = 'all';
    priceMin = '';
    priceMax = '';
  }
  
  async function handleSearch(query: string) {
    isSearching = true;
    
    // Build URL with search parameters for server-side filtering
    const url = new URL('/search', window.location.origin);
    if (query.trim()) {
      url.searchParams.set('q', query.trim());
    }
    
    // Preserve existing filters
    if (selectedMainCategory) url.searchParams.set('category', selectedMainCategory);
    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
    if (priceMin) url.searchParams.set('min_price', priceMin);
    if (priceMax) url.searchParams.set('max_price', priceMax);
    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
    
    // Navigate to trigger server-side load
    await goto(url.pathname + url.search);
    isSearching = false;
  }
  
  function handleFilter() {
    // Toggle filter panel
    showFilters = !showFilters;
  }
  
  function handleOpenMegaMenu() {
    showMegaMenu = true;
  }
  
  function handleCategorySelectFromMega(category: string | null) {
    selectedMainCategory = category;
    selectedSubcategory = null;
    // Keep the menu open when selecting a category
    // Don't change showMegaMenu here
  }
  
  function handleSubcategorySelectFromMega(subcategory: string | null, category: string) {
    selectedMainCategory = category;
    selectedSubcategory = subcategory;
    // Only close when selecting an actual subcategory (not null)
    if (subcategory !== null) {
      showMegaMenu = false;
    }
  }
  
  function handleFilterRemove(filterType: string) {
    switch(filterType) {
      case 'size':
        selectedSize = 'all';
        break;
      case 'brand':
        selectedBrand = 'all';
        break;
      case 'condition':
        selectedCondition = 'all';
        break;
      case 'priceRange':
        priceMin = '';
        priceMax = '';
        break;
    }
  }
  
  function handleMobileFilters() {
    // Toggle mobile filter drawer (size, brand, condition, price)
    showFilters = !showFilters;
  }
</script>

<svelte:head>
  <title>Search - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
  <!-- Main App Header -->
  <Header user={data.user} profile={data.profile} />
  
  <!-- Clean Search Section -->
  <div class="bg-gray-50 sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="relative">
        <!-- Main Search Bar -->
        <SearchBar 
          bind:value={searchQuery}
          placeholder={i18n.search_placeholder()}
          onSearch={handleSearch}
          onFilter={handleOpenMegaMenu}
          showCategoriesButton={true}
          categoriesText="Categories"
        />
        {#if activeFiltersCount() > 0}
          <div class="absolute top-2 right-1 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center pointer-events-none">
            {activeFiltersCount()}
          </div>
        {/if}
        
        <!-- MegaMenu Dropdown -->
        <MegaMenu
          isOpen={showMegaMenu}
          categories={categoryData()}
          selectedCategory={selectedMainCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelectFromMega}
          onSubcategorySelect={handleSubcategorySelectFromMega}
          onClose={() => showMegaMenu = false}
        />
      </div>
    </div>
  </div>

  <!-- Filters Panel (Mobile Drawer) -->
  {#if showFilters}
    <div class="fixed inset-0 z-40 sm:hidden">
      <!-- Backdrop -->
      <button 
        class="fixed inset-0 bg-black bg-opacity-50 border-0 cursor-default"
        onclick={() => showFilters = false}
        aria-label="Close filters"
        tabindex="-1"
      ></button>
      
      <!-- Drawer -->
      <div class="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl h-[calc(90vh-4rem)] flex flex-col shadow-2xl border-t border-gray-100">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 class="text-lg font-semibold">{i18n.search_quickFilters()}</h2>
          <button onclick={() => showFilters = false} class="p-1" aria-label="Close filters">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Scrollable Filter Options -->
        <div class="flex-1 overflow-y-auto">
          <div class="space-y-6 p-4">
            
            <!-- Size -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_size()}</div>
              <div class="grid grid-cols-4 gap-2">
                {#each sizes() as size}
                  <button
                    onclick={() => selectedSize = selectedSize === size ? 'all' : size}
                    class="py-2.5 px-2 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                      {selectedSize === size ? 'bg-black text-white ring-black shadow-sm transform scale-105' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Brand -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_brand()}</div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onclick={() => selectedBrand = 'all'}
                  class="py-3 px-3 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                    {selectedBrand === 'all' ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allBrands()}
                </button>
                {#each brands() as brand}
                  <button
                    onclick={() => selectedBrand = selectedBrand === brand ? 'all' : brand}
                    class="py-3 px-3 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                      {selectedBrand === brand ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {brand}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Condition -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_condition()}</div>
              <div class="space-y-2">
                <button
                  onclick={() => selectedCondition = 'all'}
                  class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-all duration-200 font-medium
                    {selectedCondition === 'all' ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allConditions()}
                </button>
                {#each conditions as condition}
                  <button
                    onclick={() => selectedCondition = selectedCondition === condition ? 'all' : condition}
                    class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-all duration-200 font-medium
                      {selectedCondition === condition ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    <span class="capitalize">{
                      condition === 'new' ? i18n.condition_new() :
                      condition === 'like-new' ? i18n.condition_likeNew() :
                      condition === 'good' ? i18n.condition_good() :
                      condition === 'fair' ? i18n.condition_fair() :
                      condition.replace('-', ' ')
                    }</span>
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Price Range -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_priceRange()}</div>
              <div class="flex space-x-2">
                <input
                  type="number"
                  bind:value={priceMin}
                  placeholder={i18n.search_min()}
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                />
                <span class="self-center">-</span>
                <input
                  type="number"
                  bind:value={priceMax}
                  placeholder={i18n.search_max()}
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Fixed Actions -->
        <div class="flex space-x-3 p-4 border-t border-gray-100 shrink-0">
          <Button onclick={clearFilters} variant="outline" class="flex-1 h-12">{i18n.search_clearAll()}</Button>
          <Button onclick={() => showFilters = false} class="flex-1 h-12">{i18n.search_applyFilters()}</Button>
        </div>
      </div>
    </div>
  {/if}


  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex gap-6">
      <!-- Desktop Sidebar -->
      <CategorySidebar
        categories={categoryData()}
        selectedCategory={selectedMainCategory}
        selectedSubcategory={selectedSubcategory}
        appliedFilters={{
          size: selectedSize,
          brand: selectedBrand,
          condition: selectedCondition,
          priceMin,
          priceMax
        }}
        onCategorySelect={handleCategorySelectFromMega}
        onSubcategorySelect={handleSubcategorySelectFromMega}
        onFilterRemove={handleFilterRemove}
        onClearAll={clearFilters}
        translations={{
          categories: 'Categories',
          filters: 'Active Filters',
          clearAll: 'Clear All',
          size: 'Size',
          brand: 'Brand',
          condition: 'Condition',
          priceRange: 'Price Range',
          allCategories: 'All Categories'
        }}
      />
      
      <!-- Products Content -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-600">
        {data.total || displayProducts().length} {i18n.search_itemsFound()}
        {data.searchQuery && ` ${i18n.search_for()} "${data.searchQuery}"`}
      </p>
      
      <div class="flex items-center space-x-3">
        <!-- Mobile Filter Button -->
        <button
          onclick={handleMobileFilters}
          class="sm:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Open filters"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{i18n.search_filters()}</span>
          {#if activeFiltersCount() > 0}
            <div class="h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount()}
            </div>
          {/if}
        </button>
        
        <!-- Desktop Sort -->
        <select bind:value={sortBy} class="hidden sm:block px-3 py-1 ring-1 ring-gray-300 rounded-lg text-sm focus:ring-black">
          <option value="relevance">{i18n.search_relevance()}</option>
          <option value="newest">{i18n.search_newestFirst()}</option>
          <option value="price-low">{i18n.search_priceLowToHigh()}</option>
          <option value="price-high">{i18n.search_priceHighToLow()}</option>
        </select>
      </div>
    </div>
    
    <!-- Active Filters Pills -->
    {#if activeFiltersCount() > 0}
      <div class="flex items-center space-x-2 mb-4 overflow-x-auto">
        {#if selectedMainCategory}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {categoryData()[selectedMainCategory].name}
            <button onclick={() => selectedMainCategory = null} class="ml-2" aria-label="Remove category filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedSubcategory}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {selectedSubcategory}
            <button onclick={() => selectedSubcategory = null} class="ml-2" aria-label="Remove subcategory filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedSize !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_size()}: {selectedSize}
            <button onclick={() => selectedSize = 'all'} class="ml-2" aria-label="Remove size filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedBrand !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_brand()}: {selectedBrand}
            <button onclick={() => selectedBrand = 'all'} class="ml-2" aria-label="Remove brand filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedCondition !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_condition()}: {
              selectedCondition === 'new' ? i18n.condition_new() :
              selectedCondition === 'like-new' ? i18n.condition_likeNew() :
              selectedCondition === 'good' ? i18n.condition_good() :
              selectedCondition === 'fair' ? i18n.condition_fair() :
              selectedCondition
            }
            <button onclick={() => selectedCondition = 'all'} class="ml-2" aria-label="Remove condition filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if priceMin || priceMax}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_priceRange()}: ${priceMin || '0'} - ${priceMax || '∞'}
            <button onclick={() => { priceMin = ''; priceMax = ''; }} class="ml-2" aria-label="Remove price filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        <button onclick={clearFilters} class="text-sm text-gray-600 hover:text-gray-900">
          {i18n.search_clearAllFilters()}
        </button>
      </div>
    {/if}
    
    <!-- Products Grid -->
    {#if isSearching || isLoading}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each Array(12) as _}
          <ProductCardSkeleton />
        {/each}
      </div>
    {:else if displayProducts().length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each displayProducts() as product}
          <ProductCard 
            {product}
            onclick={() => goto(`/product/${product.id}`)}
            translations={{
              size: i18n.product_size(),
              newSeller: i18n.trending_newSeller(),
              unknownSeller: i18n.seller_unknown(),
              currency: i18n.common_currency(),
              addToFavorites: i18n.product_addToFavorites(),
              new: i18n.condition_new(),
              likeNew: i18n.condition_likeNew(),
              good: i18n.condition_good(),
              fair: i18n.condition_fair(),
              formatPrice: (price: number) => formatPrice(price)
            }}
          />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.search_noItemsFound()}</h3>
        <p class="text-gray-600">{i18n.search_adjustFilters()}</p>
      </div>
    {/if}
        </div>
      </div>
    </div>
  </div>

{#if !showMegaMenu}
  <BottomNav />
{/if}

<style>
  /* Hide scrollbar for category carousel */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>