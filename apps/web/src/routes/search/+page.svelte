<script lang="ts">
  import { ProductCard, Button, SearchBar, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
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
  let showCategories = $state(false);
  
  let { data }: Props = $props();
  
  // Category data structure with subcategories using i18n
  const categoryData = $derived(() => ({
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
    }
  }));
  
  const mainCategories = Object.keys(categoryData());
  
  // Derive current display based on selection
  const currentDisplay = $derived(() => {
    if (selectedMainCategory && categoryData()[selectedMainCategory]) {
      return {
        type: 'subcategories',
        items: categoryData()[selectedMainCategory].subcategories,
        parent: categoryData()[selectedMainCategory].name
      };
    }
    return {
      type: 'main',
      items: mainCategories
    };
  });
  
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Uniqlo', 'Gap', 'Other'];
  const conditions = ['new', 'like-new', 'good', 'fair'];
  
  // Transform real products from Supabase to Product interface
  const allProducts = $derived(() => {
    return (data.products || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      images: product.images?.map(img => img.image_url) || ['/placeholder-product.svg'],
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
  
  // Filtered products
  let filteredProducts = $derived(() => {
    let results = [...allProducts()];
    
    // Filter by search query
    if (searchQuery) {
      results = results.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedMainCategory) {
      results = results.filter(p => 
        p.category.toLowerCase() === categoryData()[selectedMainCategory].name.toLowerCase()
      );
    }
    
    // Filter by subcategory
    if (selectedSubcategory) {
      // In real app, you'd have subcategory data on products
      // For now, just show filtered results
    }
    
    // Filter by size
    if (selectedSize !== 'all') {
      results = results.filter(p => p.size === selectedSize);
    }
    
    // Filter by brand
    if (selectedBrand !== 'all') {
      results = results.filter(p => p.brand === selectedBrand);
    }
    
    // Filter by condition
    if (selectedCondition !== 'all') {
      results = results.filter(p => p.condition === selectedCondition);
    }
    
    // Filter by price
    if (priceMin) {
      results = results.filter(p => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      results = results.filter(p => p.price <= parseFloat(priceMax));
    }
    
    // Sort
    switch(sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return results;
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
  
  // Category selection handlers
  function selectMainCategory(category: string) {
    const isCurrentlySelected = selectedMainCategory === category;
    selectedMainCategory = isCurrentlySelected ? null : category;
    selectedSubcategory = null; // Always reset subcategory
  }
  
  function selectSubcategory(subcategory: string) {
    const isCurrentlySelected = selectedSubcategory === subcategory;
    selectedSubcategory = isCurrentlySelected ? null : subcategory;
  }
  
  function resetCategories() {
    selectedMainCategory = null;
    selectedSubcategory = null;
  }
  
  function goBackToMain() {
    resetCategories();
  }
  
  function clearFilters() {
    resetCategories();
    selectedSize = 'all';
    selectedBrand = 'all';
    selectedCondition = 'all';
    priceMin = '';
    priceMax = '';
  }
  
  function handleSearch(query: string) {
    searchQuery = query;
  }
  
  function handleFilter() {
    // Toggle categories (main/subcategory navigation)
    showCategories = !showCategories;
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
  <Header />
  
  <!-- Clean Search Section -->
  <div class="bg-gray-50 sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="space-y-3">
        <!-- Main Search Bar -->
        <div class="relative">
          <SearchBar 
            bind:value={searchQuery}
            placeholder={i18n.search_placeholder()}
            onSearch={handleSearch}
            onFilter={handleFilter}
            variant="hero"
          />
          {#if activeFiltersCount() > 0}
            <div class="absolute top-2 right-1 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center pointer-events-none">
              {activeFiltersCount()}
            </div>
          {/if}
        </div>
        
        <!-- Collapsible Categories -->
        {#if showCategories}
          <div class="bg-white rounded-2xl border border-gray-200 p-1 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out">
            <div class="bg-gray-50/80 relative rounded-xl border overflow-hidden">
              <div 
                aria-hidden="true"
                class="absolute inset-x-0 top-0 h-full rounded-[inherit] pointer-events-none"
                style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
              />
              <div class="relative p-3">
                <!-- Category Navigation -->
      {#if currentDisplay().type === 'main'}
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-3 pb-2">
            {#each mainCategories as category}
              <button
                onclick={() => selectMainCategory(category)}
                class="flex-shrink-0 min-w-[70px]"
              >
                {#if selectedMainCategory === category}
                  <!-- Selected state - solid black -->
                  <div class="flex flex-col items-center py-2 px-2 rounded-lg bg-black text-white">
                    <span class="text-lg mb-1">{categoryData()[category].icon}</span>
                    <span class="text-xs font-medium">{categoryData()[category].name}</span>
                  </div>
                {:else}
                  <!-- Glass morphism for unselected categories -->
                  <div class="bg-white/70 rounded-lg border border-white/50 p-0.5 shadow-sm backdrop-blur-sm hover:shadow-md hover:bg-white/80 transition-all">
                    <div class="bg-white/60 relative rounded-lg border border-white/30 overflow-hidden">
                      <div 
                        aria-hidden="true"
                        class="absolute inset-x-0 top-0 h-full rounded-[inherit] pointer-events-none"
                        style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0) 100%)"
                      />
                      <div class="relative flex flex-col items-center py-2 px-2 text-gray-700">
                        <span class="text-lg mb-1">{categoryData()[category].icon}</span>
                        <span class="text-xs font-medium">{categoryData()[category].name}</span>
                      </div>
                    </div>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
            </div>
          {:else}
            <div class="overflow-x-auto scrollbar-hide">
              <div class="flex space-x-3 pb-2">
                <!-- Back button with glass morphism -->
                <button
                  onclick={goBackToMain}
                  class="flex-shrink-0 min-w-[70px]"
                >
                  <div class="bg-white/70 rounded-lg border border-white/50 p-0.5 shadow-sm backdrop-blur-sm hover:shadow-md hover:bg-white/80 transition-all">
                    <div class="bg-white/60 relative rounded-lg border border-white/30 overflow-hidden">
                      <div 
                        aria-hidden="true"
                        class="absolute inset-x-0 top-0 h-full rounded-[inherit] pointer-events-none"
                        style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0) 100%)"
                      />
                      <div class="relative flex flex-col items-center justify-center py-2 px-2 text-gray-700">
                        <svg class="w-[18px] h-[18px] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span class="text-xs font-medium">{i18n.search_back()}</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                {#each currentDisplay().items as subcategory}
                  <button
                    onclick={() => selectSubcategory(subcategory.name)}
                    class="flex-shrink-0 min-w-[70px]"
                  >
                    {#if selectedSubcategory === subcategory.name}
                      <!-- Selected state - solid black -->
                      <div class="flex flex-col items-center py-2 px-2 rounded-lg bg-black text-white">
                        <span class="text-lg mb-1">{subcategory.icon}</span>
                        <span class="text-xs font-medium whitespace-nowrap">{subcategory.name}</span>
                      </div>
                    {:else}
                      <!-- Glass morphism for unselected subcategories -->
                      <div class="bg-white/70 rounded-lg border border-white/50 p-0.5 shadow-sm backdrop-blur-sm hover:shadow-md hover:bg-white/80 transition-all">
                        <div class="bg-white/60 relative rounded-lg border border-white/30 overflow-hidden">
                          <div 
                            aria-hidden="true"
                            class="absolute inset-x-0 top-0 h-full rounded-[inherit] pointer-events-none"
                            style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0) 100%)"
                          />
                          <div class="relative flex flex-col items-center py-2 px-2 text-gray-700">
                            <span class="text-lg mb-1">{subcategory.icon}</span>
                            <span class="text-xs font-medium whitespace-nowrap">{subcategory.name}</span>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Filters Panel (Mobile Drawer) -->
  {#if showFilters}
    <div class="fixed inset-0 z-40 sm:hidden">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" onclick={() => showFilters = false}></div>
      
      <!-- Drawer -->
      <div class="fixed bottom-20 left-0 right-0 bg-white rounded-t-2xl h-[calc(85vh-5rem)] flex flex-col">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 class="text-lg font-semibold">{i18n.search_quickFilters()}</h2>
          <button onclick={() => showFilters = false} class="p-1">
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
              <label class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_size()}</label>
              <div class="grid grid-cols-4 gap-1.5">
                {#each sizes as size}
                  <button
                    onclick={() => selectedSize = selectedSize === size ? 'all' : size}
                    class="py-2 px-2 text-xs rounded-lg ring-1 transition-colors
                      {selectedSize === size ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Brand -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_brand()}</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onclick={() => selectedBrand = 'all'}
                  class="py-3 px-3 text-sm rounded-lg ring-1 transition-colors
                    {selectedBrand === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                >
                  {i18n.search_allBrands()}
                </button>
                {#each brands as brand}
                  <button
                    onclick={() => selectedBrand = brand}
                    class="py-3 px-3 text-sm rounded-lg ring-1 transition-colors
                      {selectedBrand === brand ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                  >
                    {brand}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Condition -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_condition()}</label>
              <div class="space-y-2">
                <button
                  onclick={() => selectedCondition = 'all'}
                  class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-colors
                    {selectedCondition === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                >
                  {i18n.search_allConditions()}
                </button>
                {#each conditions as condition}
                  <button
                    onclick={() => selectedCondition = condition}
                    class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-colors
                      {selectedCondition === condition ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
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
              <label class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_priceRange()}</label>
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
        <div class="flex space-x-3 p-4 border-t border-gray-100 flex-shrink-0">
          <Button onclick={clearFilters} variant="outline" class="flex-1 h-12">{i18n.search_clearAll()}</Button>
          <Button onclick={() => showFilters = false} class="flex-1 h-12">{i18n.search_applyFilters()}</Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-600">
        {filteredProducts().length} {i18n.search_itemsFound()}
        {searchQuery && ` ${i18n.search_for()} "${searchQuery}"`}
      </p>
      
      <div class="flex items-center space-x-3">
        <!-- Mobile Filter Button -->
        <button
          onclick={handleMobileFilters}
          class="sm:hidden flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
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
            <button onclick={() => selectedMainCategory = null} class="ml-2">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedSubcategory}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {selectedSubcategory}
            <button onclick={() => selectedSubcategory = null} class="ml-2">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedSize !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_size()}: {selectedSize}
            <button onclick={() => selectedSize = 'all'} class="ml-2">
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
    {#if filteredProducts().length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each filteredProducts() as product}
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

<BottomNav />

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