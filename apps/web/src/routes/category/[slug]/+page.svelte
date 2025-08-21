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
  
  // Debug: log what we're receiving
  $effect(() => {
    console.log('Category page data:', data);
  });
  
  // Use real category data from server
  const category = data.category || { name: 'Women', slug: 'women', description: 'Discover amazing deals on women\'s clothing' };
  const categorySlug = category?.slug || 'women';
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
  
  // Extract featured sellers from products (show all sellers with items in this category)
  const featuredSellers = $derived.by(() => {
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
            itemCount: 0,
            createdAt: p.seller.created_at || p.created_at // Use seller creation date or product date
          });
        }
        sellerMap.get(p.seller_id).itemCount++;
      }
    });
    
    // Convert to array and sort - prioritize sellers with fewer items (newer sellers)
    // Then by most recent activity
    return Array.from(sellerMap.values())
      .sort((a, b) => {
        // If one is new (1 item) and other isn't, show new seller first
        if (a.itemCount === 1 && b.itemCount > 1) return -1;
        if (b.itemCount === 1 && a.itemCount > 1) return 1;
        
        // Otherwise sort by most recent activity
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 8); // Show up to 8 sellers
  });
  
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

  <!-- Category Hero with Sellers -->
  <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Compact header with title and sellers in same row -->
      <div class="flex items-center justify-between gap-4 mb-3">
        <div class="flex items-center gap-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold">Sellers in {category.name}</h1>
            <p class="text-sm opacity-90 mt-1">{category.description || `Discover amazing ${category.name.toLowerCase()} from our sellers`}</p>
          </div>
        </div>
        
        <!-- Sellers avatars inline -->
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2 overflow-hidden">
            {#if featuredSellers.length > 0}
              {#each featuredSellers.slice(0, 10) as seller, i}
                <a 
                  href="/profile/{seller.id}" 
                  class="relative inline-block hover:z-10 transition-transform hover:scale-110"
                  title="{seller.name} - {seller.itemCount} {seller.itemCount === 1 ? 'item' : 'items'}"
                >
                  <img 
                    src={seller.avatar} 
                    alt={seller.name} 
                    class="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                  />
                  {#if seller.itemCount === 1}
                    <span class="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 rounded-full">NEW</span>
                  {/if}
                </a>
              {/each}
              {#if featuredSellers.length > 10}
                <a 
                  href="/sellers?category={categorySlug}" 
                  class="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white hover:bg-white/30 transition-colors"
                  title="View all sellers"
                >
                  <span class="text-xs font-semibold">+{featuredSellers.length - 10}</span>
                </a>
              {/if}
            {:else}
              <!-- Skeleton sellers -->
              {#each Array(5) as _, i}
                <div class="relative inline-block">
                  <div class="w-10 h-10 rounded-full bg-white/20 animate-pulse border-2 border-white/30"></div>
                </div>
              {/each}
            {/if}
          </div>
          {#if featuredSellers.length > 0}
            <a href="/sellers?category={categorySlug}" class="text-xs opacity-75 hover:opacity-100 whitespace-nowrap">View all →</a>
          {/if}
        </div>
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
  {#if subcategories.length > 0}
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
              onclick={() => selectedSubcategory = subcat.id}
              class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
                {selectedSubcategory === subcat.id
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            >
              {subcat.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Sort and Filter Bar -->
    <div class="flex justify-between items-center mb-6">
      <p class="text-sm text-gray-600">
        {filteredProducts.length} items in {category.name}
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