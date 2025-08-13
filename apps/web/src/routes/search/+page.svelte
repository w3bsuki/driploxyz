<script lang="ts">
  import { ProductCard, Button, SearchBar, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
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
  
  let { data }: Props = $props();
  
  // Category data structure with subcategories
  const categoryData = {
    women: {
      name: 'Women',
      icon: '👗',
      subcategories: [
        { name: 'Dresses', icon: '👗' },
        { name: 'Tops', icon: '👚' },
        { name: 'Jeans', icon: '👖' },
        { name: 'Skirts', icon: '👠' },
        { name: 'Jackets', icon: '🧥' },
        { name: 'Shoes', icon: '👠' },
        { name: 'Bags', icon: '👜' },
        { name: 'Accessories', icon: '💍' }
      ]
    },
    men: {
      name: 'Men',
      icon: '👔',
      subcategories: [
        { name: 'T-Shirts', icon: '👕' },
        { name: 'Shirts', icon: '👔' },
        { name: 'Jeans', icon: '👖' },
        { name: 'Jackets', icon: '🧥' },
        { name: 'Suits', icon: '🤵' },
        { name: 'Shoes', icon: '👞' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Accessories', icon: '🎩' }
      ]
    },
    kids: {
      name: 'Kids',
      icon: '👶',
      subcategories: [
        { name: 'Baby (0-2)', icon: '👶' },
        { name: 'Girls (2-8)', icon: '👧' },
        { name: 'Boys (2-8)', icon: '👦' },
        { name: 'Girls (9-16)', icon: '🧒' },
        { name: 'Boys (9-16)', icon: '🧒' },
        { name: 'Shoes', icon: '👟' },
        { name: 'School', icon: '🎒' },
        { name: 'Toys', icon: '🧸' }
      ]
    },
    pets: {
      name: 'Pets',
      icon: '🐕',
      subcategories: [
        { name: 'Dog Apparel', icon: '🐕' },
        { name: 'Cat Accessories', icon: '🐱' },
        { name: 'Pet Toys', icon: '🦴' },
        { name: 'Leashes', icon: '🦮' },
        { name: 'Beds', icon: '🛏️' },
        { name: 'Food Bowls', icon: '🥣' },
        { name: 'Carriers', icon: '🎒' }
      ]
    },
    shoes: {
      name: 'Shoes',
      icon: '👟',
      subcategories: [
        { name: 'Sneakers', icon: '👟' },
        { name: 'Boots', icon: '🥾' },
        { name: 'Heels', icon: '👠' },
        { name: 'Flats', icon: '🩰' },
        { name: 'Sandals', icon: '👡' },
        { name: 'Athletic', icon: '⚽' },
        { name: 'Dress Shoes', icon: '👞' }
      ]
    },
    bags: {
      name: 'Bags',
      icon: '👜',
      subcategories: [
        { name: 'Handbags', icon: '👜' },
        { name: 'Backpacks', icon: '🎒' },
        { name: 'Totes', icon: '👝' },
        { name: 'Clutches', icon: '💼' },
        { name: 'Crossbody', icon: '👜' },
        { name: 'Travel', icon: '🧳' },
        { name: 'Laptop Bags', icon: '💻' }
      ]
    },
    home: {
      name: 'Home',
      icon: '🏠',
      subcategories: [
        { name: 'Decor', icon: '🖼️' },
        { name: 'Bedding', icon: '🛏️' },
        { name: 'Kitchen', icon: '🍽️' },
        { name: 'Lighting', icon: '💡' },
        { name: 'Storage', icon: '📦' },
        { name: 'Garden', icon: '🌱' },
        { name: 'Art', icon: '🎨' },
        { name: 'Textiles', icon: '🧶' }
      ]
    },
    beauty: {
      name: 'Beauty',
      icon: '💄',
      subcategories: [
        { name: 'Makeup', icon: '💄' },
        { name: 'Skincare', icon: '🧴' },
        { name: 'Fragrance', icon: '🌺' },
        { name: 'Hair Care', icon: '💇' },
        { name: 'Tools', icon: '🪞' },
        { name: 'Nails', icon: '💅' },
        { name: 'Bath & Body', icon: '🛁' },
        { name: 'Sets', icon: '🎁' }
      ]
    }
  };
  
  const mainCategories = Object.keys(categoryData);
  
  // Derive current display based on selection
  const currentDisplay = $derived(() => {
    if (selectedMainCategory && categoryData[selectedMainCategory]) {
      return {
        type: 'subcategories',
        items: categoryData[selectedMainCategory].subcategories,
        parent: categoryData[selectedMainCategory].name
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
      sellerRating: Number(product.seller?.rating) || 4.5,
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
        p.category.toLowerCase() === categoryData[selectedMainCategory].name.toLowerCase()
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
    showFilters = !showFilters;
  }
</script>

<svelte:head>
  <title>Search - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
  <!-- Main App Header -->
  <Header />
  
  <!-- Search Section -->
  <div class="bg-white shadow-sm sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-3">
        <!-- Search Bar -->
        <div class="relative">
          <SearchBar 
            bind:value={searchQuery}
            placeholder="Search for items, brands..."
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
      </div>
    </div>
  </div>
  
  <!-- Transforming Category Navigation -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {#if currentDisplay().type === 'main'}
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-3 pb-2">
            {#each mainCategories as category}
              <button
                onclick={() => selectMainCategory(category)}
                class="flex flex-col items-center min-w-[70px] py-2 px-2 rounded-lg flex-shrink-0
                  {selectedMainCategory === category ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                <span class="text-lg mb-1">{categoryData[category].icon}</span>
                <span class="text-xs font-medium">{categoryData[category].name}</span>
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-3 pb-2">
            <button
              onclick={goBackToMain}
              class="flex flex-col items-center justify-center min-w-[70px] py-2 px-2 rounded-lg flex-shrink-0 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <svg class="w-[18px] h-[18px] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="text-xs font-medium">Back</span>
            </button>
            {#each currentDisplay().items as subcategory}
              <button
                onclick={() => selectSubcategory(subcategory.name)}
                class="flex flex-col items-center min-w-[70px] py-2 px-2 rounded-lg flex-shrink-0
                  {selectedSubcategory === subcategory.name ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                <span class="text-lg mb-1">{subcategory.icon}</span>
                <span class="text-xs font-medium whitespace-nowrap">{subcategory.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Filters Panel (Mobile Drawer) -->
  {#if showFilters}
    <div class="fixed inset-0 z-40 sm:hidden">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" onclick={() => showFilters = false}></div>
      
      <!-- Drawer -->
      <div class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden flex flex-col">
        <div class="p-4 flex flex-col h-full">
          <!-- Fixed Header -->
          <div class="flex justify-between items-center mb-3 flex-shrink-0">
            <h2 class="text-lg font-semibold">Quick Filters</h2>
            <button onclick={() => showFilters = false} class="p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Scrollable Filter Options -->
          <div class="space-y-4 overflow-y-auto flex-1 -mx-4 px-4">
            
            <!-- Size -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onclick={() => selectedBrand = 'all'}
                  class="py-3 px-3 text-sm rounded-lg ring-1 transition-colors
                    {selectedBrand === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                >
                  All Brands
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div class="space-y-2">
                <button
                  onclick={() => selectedCondition = 'all'}
                  class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-colors
                    {selectedCondition === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                >
                  All Conditions
                </button>
                {#each conditions as condition}
                  <button
                    onclick={() => selectedCondition = condition}
                    class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-colors
                      {selectedCondition === condition ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300'}"
                  >
                    <span class="capitalize">{condition.replace('-', ' ')}</span>
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Price Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div class="flex space-x-2">
                <input
                  type="number"
                  bind:value={priceMin}
                  placeholder="Min"
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                />
                <span class="self-center">-</span>
                <input
                  type="number"
                  bind:value={priceMax}
                  placeholder="Max"
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                />
              </div>
            </div>
          </div>
          
          <!-- Fixed Actions -->
          <div class="flex space-x-2 mt-6 flex-shrink-0">
            <Button onclick={clearFilters} variant="outline" class="flex-1 h-12">Clear All</Button>
            <Button onclick={() => showFilters = false} class="flex-1 h-12">Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-600">
        {filteredProducts().length} items found
        {searchQuery && ` for "${searchQuery}"`}
      </p>
      
      <!-- Desktop Sort -->
      <select bind:value={sortBy} class="hidden sm:block px-3 py-1 ring-1 ring-gray-300 rounded-lg text-sm focus:ring-black">
        <option value="relevance">Relevance</option>
        <option value="newest">Newest first</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
    
    <!-- Active Filters Pills -->
    {#if activeFiltersCount() > 0}
      <div class="flex items-center space-x-2 mb-4 overflow-x-auto">
        {#if selectedMainCategory}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {categoryData[selectedMainCategory].name}
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
            Size: {selectedSize}
            <button onclick={() => selectedSize = 'all'} class="ml-2">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        <button onclick={clearFilters} class="text-sm text-gray-600 hover:text-gray-900">
          Clear all
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
          />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p class="text-gray-600">Try adjusting your filters or search terms</p>
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