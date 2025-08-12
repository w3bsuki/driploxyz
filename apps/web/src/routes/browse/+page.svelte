<script lang="ts">
  import { Button, SearchBar, ProductCard, Avatar, Breadcrumb, type Product, type BreadcrumbItem } from '@repo/ui';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let searchQuery = $state('');
  let showFilters = $state(false);
  
  // Filter states
  let selectedCategories = $state<string[]>([]);
  let selectedSizes = $state<string[]>([]);
  let selectedBrands = $state<string[]>([]);
  let selectedConditions = $state<string[]>([]);
  let priceRange = $state({ min: 0, max: 500 });
  let sortBy = $state('newest');
  
  // Parse URL parameters on mount
  onMount(() => {
    const params = new URLSearchParams($page.url.search);
    
    // Apply category filter from URL
    const categoryParam = params.get('category');
    if (categoryParam) {
      selectedCategories = [categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)];
    }
    
    // Apply subcategory filter from URL
    const subcategoryParam = params.get('subcategory');
    if (subcategoryParam) {
      // You might want to handle subcategories differently
      // For now, we'll just add it to the selected categories
      selectedCategories = [...selectedCategories, subcategoryParam];
    }
    
    // Apply search query from URL
    const searchParam = params.get('q');
    if (searchParam) {
      searchQuery = searchParam;
    }
  });
  
  // Mock data
  const categories = ['Women', 'Men', 'Kids', 'Accessories', 'Shoes', 'Bags', 'Jewelry'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Louis Vuitton', 'Chanel'];
  const conditions = [
    { value: 'new', label: 'New with tags' },
    { value: 'like-new', label: 'Like new' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];
  
  // Mock products - would come from API/database
  const mockProducts: Product[] = Array.from({ length: 20 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Item ${i + 1}`,
    description: 'Great condition item',
    price: Math.floor(Math.random() * 200) + 20,
    images: ['/placeholder-product.svg'],
    brand: brands[i % brands.length],
    size: sizes[i % sizes.length],
    condition: (['new', 'like-new', 'good', 'fair'] as const)[i % 4],
    category: categories[i % categories.length],
    sellerId: `seller-${i + 1}`,
    sellerName: `Seller ${i + 1}`,
    sellerRating: 4 + Math.random(),
    createdAt: new Date().toISOString(),
    location: 'New York, NY'
  }));
  
  let filteredProducts = $derived(mockProducts);
  
  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      selectedCategories = selectedCategories.filter(c => c !== category);
    } else {
      selectedCategories = [...selectedCategories, category];
    }
  }
  
  function toggleSize(size: string) {
    if (selectedSizes.includes(size)) {
      selectedSizes = selectedSizes.filter(s => s !== size);
    } else {
      selectedSizes = [...selectedSizes, size];
    }
  }
  
  function toggleCondition(condition: string) {
    if (selectedConditions.includes(condition)) {
      selectedConditions = selectedConditions.filter(c => c !== condition);
    } else {
      selectedConditions = [...selectedConditions, condition];
    }
  }
  
  function clearFilters() {
    selectedCategories = [];
    selectedSizes = [];
    selectedBrands = [];
    selectedConditions = [];
    priceRange = { min: 0, max: 500 };
    sortBy = 'newest';
  }
  
  function handleSearch(query: string) {
    console.log('Searching:', query);
  }
  
  function handleFilter() {
    showFilters = !showFilters;
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <a href="/" class="text-2xl font-bold text-gray-900">Driplo</a>
        <nav class="flex items-center space-x-2 sm:space-x-6">
          <a href="/browse" class="text-gray-900 font-medium text-sm">Browse</a>
          <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium text-sm">Sell</a>
          <Button size="sm">Sign Up</Button>
        </nav>
      </div>
    </div>
  </header>

  <!-- Search Bar -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SearchBar 
        bind:value={searchQuery}
        variant="power"
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder="Search products, brands, categories..."
      />
    </div>
  </div>
  
  <!-- Category Navigation -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Shop by Category</h2>
        <button 
          onclick={() => selectedCategories = []}
          class="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear filters
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each categories as category}
          <button
            onclick={() => toggleCategory(category)}
            class="px-4 py-2 rounded-full text-sm font-medium transition-all
              {selectedCategories.includes(category) 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            {category}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Breadcrumb (show when coming from category) -->
  {#if selectedCategories.length > 0}
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          ...(selectedCategories[0] ? [{ label: selectedCategories[0], href: `/category/${selectedCategories[0].toLowerCase()}` }] : []),
          { label: 'Browse All' }
        ]} />
      </div>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex gap-6 py-6">
      <!-- Mobile Filter Button -->
      <button 
        onclick={() => showFilters = !showFilters}
        class="lg:hidden fixed bottom-4 right-4 z-30 bg-black text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
      </button>

      <!-- Filters Sidebar -->
      <aside class="{showFilters ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-64 flex-shrink-0">
        <div class="bg-white h-full lg:h-auto overflow-y-auto lg:sticky lg:top-24 rounded-lg p-4 lg:p-0">
          <!-- Mobile Filter Header -->
          <div class="flex justify-between items-center mb-4 lg:hidden">
            <h2 class="text-lg font-semibold">Filters</h2>
            <button onclick={() => showFilters = false}>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Sort -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Sort By</h3>
            <select bind:value={sortBy} class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <!-- Categories -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Categories</h3>
            <div class="space-y-2">
              {#each categories as category}
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(category)}
                    onchange={() => toggleCategory(category)}
                    class="mr-2 rounded text-blue-600"
                  />
                  <span class="text-sm text-gray-700">{category}</span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Sizes -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Size</h3>
            <div class="grid grid-cols-3 gap-2">
              {#each sizes as size}
                <button
                  onclick={() => toggleSize(size)}
                  class="px-3 py-1 text-sm border rounded-lg transition-colors
                    {selectedSizes.includes(size) 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                >
                  {size}
                </button>
              {/each}
            </div>
          </div>

          <!-- Condition -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Condition</h3>
            <div class="space-y-2">
              {#each conditions as condition}
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(condition.value)}
                    onchange={() => toggleCondition(condition.value)}
                    class="mr-2 rounded text-blue-600"
                  />
                  <span class="text-sm text-gray-700">{condition.label}</span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Price Range -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Price Range</h3>
            <div class="flex items-center space-x-2">
              <input 
                type="number" 
                bind:value={priceRange.min}
                placeholder="Min"
                class="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span class="text-gray-500">-</span>
              <input 
                type="number" 
                bind:value={priceRange.max}
                placeholder="Max"
                class="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <!-- Clear Filters -->
          <button 
            onclick={clearFilters}
            class="w-full py-2 text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear all filters
          </button>
        </div>
      </aside>

      <!-- Products Grid -->
      <main class="flex-1">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-4">
          <p class="text-sm text-gray-600">
            {filteredProducts.length} items found
          </p>
        </div>

        <!-- Products -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredProducts as product}
            <ProductCard 
              {product}
              onclick={() => window.location.href = `/product/${product.id}`}
            />
          {/each}
        </div>

        <!-- Load More -->
        <div class="text-center mt-8 pb-8">
          <Button variant="outline" size="lg" class="w-full sm:w-auto">
            Load More Products
          </Button>
        </div>
      </main>
    </div>
  </div>
</div>