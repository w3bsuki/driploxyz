<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, ProductCard, Breadcrumb, type Product, type BreadcrumbItem } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Use real category data from server
  const category = data.category;
  const categorySlug = category.slug;
  const subcategories = data.subcategories || [];
  const products = data.products || [];
  
  // Transform products for ProductCard component
  const displayProducts: Product[] = products.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    price: p.price,
    images: p.images?.map((img: any) => img.image_url || img) || [],
    brand: p.brand,
    size: p.size,
    condition: p.condition,
    category: category.name,
    sellerId: p.seller_id,
    sellerName: p.seller?.username || 'Unknown',
    sellerRating: p.seller?.rating || 0,
    createdAt: p.created_at,
    location: p.location || p.seller?.location || ''
  }));
  
  // Extract featured sellers from products (top sellers in this category)
  const featuredSellers = $derived(() => {
    const sellerMap = new Map();
    
    // Group products by seller
    products.forEach(p => {
      if (p.seller_id && p.seller) {
        if (!sellerMap.has(p.seller_id)) {
          sellerMap.set(p.seller_id, {
            id: p.seller_id,
            name: p.seller.username || 'Unknown',
            avatar: p.seller.avatar_url || '/default-avatar.png',
            rating: p.seller.seller_rating || 0,
            itemCount: 0
          });
        }
        sellerMap.get(p.seller_id).itemCount++;
      }
    });
    
    // Convert to array and sort by item count
    return Array.from(sellerMap.values())
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, 6); // Get top 6 sellers
  })();
  
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
    displayProducts.filter(p => {
      // Real subcategory filtering would be done server-side
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
  <!-- Unified Header -->
  <Header />

  <!-- Category Hero -->
  <div class="bg-linear-to-r from-purple-600 to-pink-600 text-white">
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
          class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
            {selectedSubcategory === null 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          All
        </button>
        {#each subcategories as subcat}
          <button
            onclick={() => selectedSubcategory = subcat}
            class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
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
      <div class="overflow-x-auto scrollbar-hide">
        <div class="flex space-x-4 pb-2">
          {#each featuredSellers as seller}
            <a href="/profile/{seller.id}" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow shrink-0 min-w-[140px]">
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
        <aside class="w-64 shrink-0">
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
                      class="mr-2 rounded-sm text-blue-600"
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
                  class="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm"
                />
                <span class="text-gray-500">-</span>
                <input 
                  type="number" 
                  bind:value={priceRange.max}
                  placeholder="Max"
                  class="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm"
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

<style>
  /* Hide scrollbar for horizontal scroll */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>