<script lang="ts">
  import { ProductCard, Button, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  // Search and filter states
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let selectedSize = $state('all');
  let selectedBrand = $state('all');
  let selectedCondition = $state('all');
  let priceMin = $state('');
  let priceMax = $state('');
  let sortBy = $state('relevance');
  let showFilters = $state(false);
  
  // Categories  
  const categories = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'women', name: 'Women', icon: '👗' },
    { id: 'men', name: 'Men', icon: '👔' },
    { id: 'kids', name: 'Kids', icon: '👶' },
    { id: 'pets', name: 'Pets', icon: '🐕' },
    { id: 'shoes', name: 'Shoes', icon: '👟' },
    { id: 'bags', name: 'Bags', icon: '👜' },
    { id: 'more', name: 'More', icon: '✨' }
  ];
  
  // Subcategories based on selected category
  const subcategories: Record<string, string[]> = {
    women: ['Dresses', 'Tops', 'Pants', 'Jackets', 'Skirts'],
    men: ['Shirts', 'T-Shirts', 'Pants', 'Jackets', 'Suits'],
    kids: ['Baby', 'Toddler', 'School Age', 'Teen'],
    pets: ['Dog', 'Cat', 'Accessories', 'Toys'],
    shoes: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals'],
    bags: ['Handbags', 'Backpacks', 'Totes', 'Clutches'],
    more: ['Jewelry', 'Watches', 'Belts', 'Hats', 'Home']
  };
  
  let selectedSubcategory = $state<string | null>(null);
  
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Uniqlo', 'Gap', 'Other'];
  const conditions = ['new', 'like-new', 'good', 'fair'];
  
  // Mock products
  const allProducts: Product[] = Array.from({ length: 48 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Item ${i + 1}`,
    description: 'Great condition item',
    price: Math.floor(Math.random() * 200) + 20,
    images: ['/placeholder-product.svg'],
    brand: brands[i % brands.length],
    size: sizes[i % sizes.length],
    condition: conditions[i % 4] as Product['condition'],
    category: categories[i % categories.length].name,
    sellerId: `seller-${i % 10}`,
    sellerName: `Seller${i % 10}`,
    sellerRating: 4 + Math.random(),
    createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    location: 'New York, NY'
  }));
  
  // Filtered products
  let filteredProducts = $derived(() => {
    let results = [...allProducts];
    
    // Filter by search query
    if (searchQuery) {
      results = results.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(p => 
        p.category.toLowerCase() === selectedCategory
      );
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
    if (selectedCategory !== 'all') count++;
    if (selectedSize !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (priceMin || priceMax) count++;
    return count;
  });
  
  function clearFilters() {
    selectedCategory = 'all';
    selectedSize = 'all';
    selectedBrand = 'all';
    selectedCondition = 'all';
    priceMin = '';
    priceMax = '';
  }
</script>

<svelte:head>
  <title>Search - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Main App Header -->
  <Header />
  
  <!-- Search Section -->
  <div class="bg-white shadow-sm sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-3">
        <!-- Search Bar -->
        <div class="flex items-center space-x-2">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              bind:value={searchQuery}
              placeholder="Search for items, brands..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <button
            onclick={() => showFilters = !showFilters}
            class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 relative"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {#if activeFiltersCount() > 0}
              <span class="absolute -top-1 -right-1 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount()}
              </span>
            {/if}
          </button>
        </div>
        
        <!-- Categories (Horizontal Scroll) -->
        <div class="mt-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div class="flex space-x-2">
            {#each categories as category}
              <button
                onclick={() => {
                  selectedCategory = selectedCategory === category.id ? 'all' : category.id;
                  selectedSubcategory = null; // Reset subcategory when changing category
                }}
                class="flex flex-col items-center min-w-[70px] py-2 px-2 rounded-lg transition-colors
                  {selectedCategory === category.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                <span class="text-lg mb-1">{category.icon}</span>
                <span class="text-xs font-medium">{category.name}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Subcategories (Show when category selected) -->
        {#if selectedCategory !== 'all' && subcategories[selectedCategory]}
          <div class="mt-2 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div class="flex space-x-2">
              {#each subcategories[selectedCategory] as subcategory}
                <button
                  onclick={() => selectedSubcategory = selectedSubcategory === subcategory ? null : subcategory}
                  class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    {selectedSubcategory === subcategory 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-black'}"
                >
                  {subcategory}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Filters Panel (Mobile Drawer / Desktop Sidebar) -->
  {#if showFilters}
    <div class="fixed inset-0 z-40 sm:hidden">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" onclick={() => showFilters = false}></div>
      
      <!-- Drawer - More Compact -->
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
          
          <!-- Compact Filter Options - Horizontal Tabs -->
          <div class="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            <button class="px-3 py-1 bg-black text-white rounded-full text-xs font-medium">Size</button>
            <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Price</button>
            <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Brand</button>
            <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Condition</button>
          </div>
          
          <!-- Scrollable Filter Options -->
          <div class="space-y-3 overflow-y-auto flex-1 -mx-4 px-4">
            
            <!-- Size - Compact Grid -->
            <div>
              <div class="grid grid-cols-4 gap-1.5">
                {#each sizes as size}
                  <button
                    onclick={() => selectedSize = selectedSize === size ? 'all' : size}
                    class="py-2 px-2 text-xs rounded-lg border transition-colors
                      {selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}"
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
                  class="py-3 px-3 text-sm rounded-lg border transition-colors
                    {selectedBrand === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}"
                >
                  All Brands
                </button>
                {#each brands as brand}
                  <button
                    onclick={() => selectedBrand = brand}
                    class="py-3 px-3 text-sm rounded-lg border transition-colors
                      {selectedBrand === brand ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}"
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
                  class="w-full py-3 px-3 text-sm rounded-lg border text-left transition-colors
                    {selectedCondition === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}"
                >
                  All Conditions
                </button>
                {#each conditions as condition}
                  <button
                    onclick={() => selectedCondition = condition}
                    class="w-full py-3 px-3 text-sm rounded-lg border text-left transition-colors
                      {selectedCondition === condition ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}"
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
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span class="self-center">-</span>
                <input
                  type="number"
                  bind:value={priceMax}
                  placeholder="Max"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
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
      <select bind:value={sortBy} class="hidden sm:block px-3 py-1 border border-gray-300 rounded-lg text-sm">
        <option value="relevance">Relevance</option>
        <option value="newest">Newest first</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
    
    <!-- Active Filters Pills -->
    {#if activeFiltersCount() > 0}
      <div class="flex items-center space-x-2 mb-4 overflow-x-auto">
        {#if selectedCategory !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {categories.find(c => c.id === selectedCategory)?.name}
            <button onclick={() => selectedCategory = 'all'} class="ml-2">
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
            onclick={() => window.location.href = `/product/${product.id}`}
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