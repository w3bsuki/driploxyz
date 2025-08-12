<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ProductCard, Breadcrumb, type Product, type BreadcrumbItem } from '@repo/ui';
  
  // Get category from URL
  const categorySlug = $page.params.slug;
  
  // Category mapping
  const categoryInfo: Record<string, { name: string; description: string; image: string }> = {
    women: {
      name: 'Women',
      description: 'Discover amazing deals on women\'s fashion',
      image: '/placeholder-product.svg'
    },
    men: {
      name: 'Men',
      description: 'Shop men\'s clothing and accessories',
      image: '/placeholder-product.svg'
    },
    kids: {
      name: 'Kids',
      description: 'Adorable and affordable kids fashion',
      image: '/placeholder-product.svg'
    },
    pets: {
      name: 'Pets',
      description: 'Everything your furry friends need',
      image: '/placeholder-product.svg'
    },
    home: {
      name: 'Home',
      description: 'Transform your living space with great finds',
      image: '/placeholder-product.svg'
    },
    sports: {
      name: 'Sports',
      description: 'Gear up for your active lifestyle',
      image: '/placeholder-product.svg'
    },
    accessories: {
      name: 'Accessories',
      description: 'Complete your look with the perfect accessories',
      image: '/placeholder-product.svg'
    },
    shoes: {
      name: 'Shoes',
      description: 'Step out in style with pre-loved footwear',
      image: '/placeholder-product.svg'
    }
  };
  
  const category = categoryInfo[categorySlug] || { name: 'Category', description: '', image: '' };
  
  // Subcategories
  const subcategories = [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 
    'Activewear', 'Swimwear', 'Underwear', 'Sleepwear'
  ];
  
  // Mock featured sellers
  const featuredSellers = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Top Seller ${i + 1}`,
    avatar: '/placeholder-product.svg',
    itemCount: Math.floor(Math.random() * 100) + 20,
    rating: 4 + Math.random()
  }));
  
  // Mock products
  const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
    id: `${categorySlug}-product-${i + 1}`,
    title: `${category.name} Item ${i + 1}`,
    description: 'Great condition item',
    price: Math.floor(Math.random() * 200) + 20,
    images: ['/placeholder-product.svg'],
    brand: ['Nike', 'Adidas', 'Zara', 'H&M'][i % 4],
    size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
    condition: (['new', 'like-new', 'good', 'fair'] as const)[i % 4],
    category: category.name,
    sellerId: `seller-${i + 1}`,
    sellerName: `Seller ${i + 1}`,
    sellerRating: 4 + Math.random(),
    createdAt: new Date().toISOString(),
    location: 'New York, NY'
  }));
  
  let selectedSubcategory = $state<string | null>(null);
  let sortBy = $state('popular');
  let showFilters = $state(false);
  
  // Filter states
  let selectedSizes = $state<string[]>([]);
  let selectedBrands = $state<string[]>([]);
  let selectedConditions = $state<string[]>([]);
  let priceRange = $state({ min: 0, max: 500 });
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Louis Vuitton'];
  const conditions = [
    { value: 'new', label: 'New with tags' },
    { value: 'like-new', label: 'Like new' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];
  
  // Filter products based on selected subcategory and filters
  let filteredProducts = $derived(
    mockProducts.filter(p => {
      if (selectedSubcategory && Math.random() > 0.7) return false;
      if (selectedSizes.length && !selectedSizes.includes(p.size)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand || '')) return false;
      if (selectedConditions.length && !selectedConditions.includes(p.condition)) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      return true;
    })
  );
  
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
    selectedSubcategory = null;
    selectedSizes = [];
    selectedBrands = [];
    selectedConditions = [];
    priceRange = { min: 0, max: 500 };
  }
</script>

<svelte:head>
  <title>{category.name} - Driplo</title>
  <meta name="description" content={category.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <a href="/" class="text-2xl font-bold text-gray-900">Driplo</a>
        <nav class="flex items-center space-x-2 sm:space-x-6">
          <a href="/browse" class="text-gray-600 hover:text-gray-900 font-medium text-sm">Browse</a>
          <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium text-sm">Sell</a>
          <Button size="sm">Sign Up</Button>
        </nav>
      </div>
    </div>
  </header>

  <!-- Category Hero -->
  <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold mb-2">{category.name}</h1>
          <p class="text-lg opacity-90">{category.description}</p>
        </div>
        <img src={category.image} alt={category.name} class="w-24 h-24 rounded-full opacity-80 hidden sm:block" />
      </div>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: category.name }
      ]} />
    </div>
  </div>

  <!-- Subcategories -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex overflow-x-auto scrollbar-hide space-x-2">
        <button
          onclick={() => selectedSubcategory = null}
          class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
            {selectedSubcategory === null 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          All
        </button>
        {#each subcategories as subcat}
          <button
            onclick={() => selectedSubcategory = subcat}
            class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
              {selectedSubcategory === subcat 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            {subcat}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Featured Sellers -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Top Sellers in {category.name}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {#each featuredSellers as seller}
          <a href="/profile/{seller.id}" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
            <img src={seller.avatar} alt={seller.name} class="w-16 h-16 rounded-full mx-auto mb-2" />
            <h3 class="text-sm font-medium text-center truncate">{seller.name}</h3>
            <p class="text-xs text-gray-500 text-center">{seller.itemCount} items</p>
            <div class="flex items-center justify-center mt-1">
              <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="text-xs text-gray-600 ml-1">{seller.rating.toFixed(1)}</span>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <!-- Sort and Filter Bar -->
    <div class="flex justify-between items-center mb-6">
      <p class="text-sm text-gray-600">
        {filteredProducts.length} items {selectedSubcategory ? `in ${selectedSubcategory}` : `in ${category.name}`}
      </p>
      <div class="flex items-center space-x-2">
        <select 
          bind:value={sortBy}
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        <Button 
          variant="outline" 
          size="sm"
          onclick={() => showFilters = !showFilters}
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </Button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Filters Sidebar -->
      {#if showFilters}
        <aside class="w-64 flex-shrink-0">
          <div class="bg-white rounded-lg p-4 sticky top-24">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Filters</h3>
              <button onclick={clearFilters} class="text-sm text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            </div>
            
            <!-- Sizes -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3">Size</h4>
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
              <h4 class="font-medium text-sm mb-3">Condition</h4>
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
              <h4 class="font-medium text-sm mb-3">Price Range</h4>
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
          </div>
        </aside>
      {/if}
      
      <!-- Products Grid -->
      <div class="flex-1">
        <div class="grid grid-cols-2 sm:grid-cols-3 {showFilters ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4">
          {#each filteredProducts as product}
            <ProductCard 
              {product}
              onclick={() => window.location.href = `/product/${product.id}`}
            />
          {/each}
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div class="text-center mt-8">
      <Button variant="outline" size="lg">
        Load More {category.name} Items
      </Button>
    </div>
  </div>
</div>