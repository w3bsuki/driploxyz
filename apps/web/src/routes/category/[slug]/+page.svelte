<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, ProductCard, Breadcrumb, SellerQuickView, SearchBar, type Product, type BreadcrumbItem } from '@repo/ui';
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
  const sellers = data.sellers || [];
  
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
  
  // Use sellers data from server (all sellers with products in this category)
  
  // Determine background color based on category
  const categoryBgColor = $derived.by(() => {
    const categoryColors = {
      'women': 'bg-pink-500',
      'men': 'bg-blue-600',
      'kids': 'bg-orange-500',
      'unisex': 'bg-slate-600',
      'default': 'bg-gray-700'
    };
    return categoryColors[categorySlug] || categoryColors['default'];
  });
  
  let selectedSubcategory = $state<string | null>(null);
  let sortBy = $state('popular');
  let showFilters = $state(false);
  let searchQuery = $state('');
  
  // Seller quick view modal state
  let selectedSeller = $state<any>(null);
  let showSellerModal = $state(false);
  
  function openSellerModal(seller: any) {
    selectedSeller = seller;
    showSellerModal = true;
  }
  
  function closeSellerModal() {
    showSellerModal = false;
    selectedSeller = null;
  }
  
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
  
  // Filter products based on search query, subcategory and filters
  let filteredProducts = $derived(
    displayProducts.filter(p => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesBrand = p.brand?.toLowerCase().includes(query) || false;
        const matchesDescription = p.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesBrand && !matchesDescription) return false;
      }
      
      // Other filters
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
  
  function handleSearch(query: string) {
    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query)}&category=${categorySlug}`);
    }
  }
</script>

<svelte:head>
  <title>{category.name} - Driplo</title>
  <meta name="description" content={category.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Unified Header -->
  <Header />

  <!-- Breadcrumb -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: category.name }
      ]} />
    </div>
  </div>

  <!-- Colored Category Section -->
  <div class="{categoryBgColor} text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Top Avatars Centered -->
      <div class="flex justify-center items-center gap-3 overflow-x-auto scrollbar-hide pb-4">
        {#if sellers.length > 0}
          {#each sellers.slice(0, 15) as seller}
            <button
              onclick={() => openSellerModal(seller)}
              class="flex flex-col items-center group shrink-0 hover:scale-105 transition-transform cursor-pointer"
              title="{seller.username} - {seller.itemCount} {seller.itemCount === 1 ? 'item' : 'items'}"
            >
              <div class="relative">
                <img 
                  src={seller.avatar_url} 
                  alt={seller.username} 
                  class="w-12 h-12 rounded-full border-2 border-white/30 group-hover:border-white/60 shadow-sm transition-all" 
                />
                {#if seller.itemCount === 1}
                  <span class="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-white">NEW</span>
                {/if}
              </div>
              <span class="text-xs mt-1 font-medium opacity-90 group-hover:opacity-100">{seller.username}</span>
              <span class="text-[10px] opacity-75">{seller.itemCount} items</span>
            </button>
          {/each}
        {:else}
          {#each Array(8) as _}
            <div class="flex flex-col items-center shrink-0">
              <div class="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div>
              <div class="h-3 w-12 bg-white/20 rounded mt-1 animate-pulse"></div>
              <div class="h-2 w-8 bg-white/20 rounded mt-1 animate-pulse"></div>
            </div>
          {/each}
        {/if}
      </div>
      
      <!-- Search Bar -->
      <div class="pb-4">
        <div class="max-w-2xl mx-auto">
          <SearchBar 
            bind:value={searchQuery}
            onSearch={handleSearch}
            placeholder={`Search in ${category.name}...`}
            variant="default"
            class="w-full"
          />
        </div>
      </div>

      <!-- Category Pills -->
      {#if subcategories.length > 0}
        <div class="flex justify-center">
          <div class="flex overflow-x-auto scrollbar-hide space-x-2 px-4">
            <button
              onclick={() => selectedSubcategory = null}
              class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
                {selectedSubcategory === null 
                  ? 'bg-white text-gray-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'}"
            >
              All
            </button>
            {#each subcategories as subcat}
              <button
                onclick={() => selectedSubcategory = subcat.id}
                class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
                  {selectedSubcategory === subcat.id
                    ? 'bg-white text-gray-900' 
                    : 'bg-white/20 text-white hover:bg-white/30'}"
              >
                {subcat.name}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Sort and Filter Bar -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-600">
        {filteredProducts.length} items
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

<!-- Seller Quick View Modal -->
{#if selectedSeller}
  <SellerQuickView
    seller={selectedSeller}
    bind:isOpen={showSellerModal}
    onClose={closeSellerModal}
    onViewProfile={(sellerId) => goto(`/profile/${sellerId}`)}
  />
{/if}

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