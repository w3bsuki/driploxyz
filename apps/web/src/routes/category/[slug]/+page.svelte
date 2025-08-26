<script lang="ts">
  import { page, navigating } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, ProductCard, Breadcrumb, SellerQuickView, SearchBar, BottomNav, type Product, type BreadcrumbItem } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
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

  // Translation mapping for category names
  function translateCategoryName(name: string): string {
    const translations: Record<string, string> = {
      'Women': i18n.category_women_title(),
      'Men': i18n.category_men_title(),
      'Kids': i18n.category_kids_title(),
      'Unisex': 'Унисекс'
    };
    return translations[name] || name;
  }

  // Translation mapping for all category names  
  function translateSubcategoryName(name: string): string {
    const translations: Record<string, string> = {
      // Level 1 - Gender categories
      'Women': i18n.category_women(),
      'Men': i18n.category_men(),
      'Kids': i18n.category_kids(),
      'Unisex': i18n.category_unisex(),
      
      // Level 2 - Main categories
      'Accessories': i18n.category_accessories(),
      'Activewear': i18n.category_activewear(),
      'Bags': i18n.category_bags(),
      'Boots': i18n.category_boots(),
      'Dresses': i18n.category_dresses(),
      'Flats': i18n.category_flats(),
      'Formal Shoes': i18n.category_formalShoes(),
      'Heels': i18n.category_heels(),
      'Hoodies': i18n.category_hoodies(),
      'Jackets': i18n.category_jackets(),
      'Jackets & Coats': i18n.category_jacketsCoats(),
      'Jeans': i18n.category_jeans(),
      'Jewelry': i18n.category_jewelry(),
      'Lingerie & Underwear': i18n.category_lingerie(),
      'Pants & Jeans': i18n.category_pantsJeans(),
      'Pants & Trousers': i18n.category_pantsTrousers(),
      'Sandals': i18n.category_sandals(),
      'Sandals & Slides': i18n.category_sandalsSlides(),
      'Shirts': i18n.category_shirts(),
      'Shirts & Blouses': i18n.category_shirtsBlouses(),
      'Shorts': i18n.category_shorts(),
      'Skirts': i18n.category_skirts(),
      'Sneakers': i18n.category_sneakers(),
      'Suits & Blazers': i18n.category_suitsBlazers(),
      'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
      'Swimwear': i18n.category_swimwear(),
      'T-Shirts': i18n.category_tshirts(),
      'Tops & T-Shirts': i18n.category_topsTshirts(),
      'Underwear': i18n.category_underwear(),
      'Watches': i18n.category_watches(),
      'Bags & Purses': i18n.category_bags(),
      
      // Level 3 - Accessory subcategories
      'Hats & Caps': i18n.category_hatsAndCaps(),
      'Belts': i18n.category_belts(),
      'Scarves': i18n.category_scarves(),
      'Sunglasses': i18n.category_sunglasses(),
      'Wallets': i18n.category_wallets(),
      'Hair Accessories': i18n.category_hairAccessories(),
      'Ties': i18n.category_ties(),
      'Cufflinks': i18n.category_cufflinks(),
      'Backpacks': i18n.category_backpacks()
    };
    return translations[name] || name;
  }
  
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
    main_category_name: category.parent_name || category.name,
    subcategory_name: category.parent_name ? category.name : null,
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
  let showMegaMenu = $state(false);
  
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
    { value: 'new', label: i18n.condition_newWithTags() },
    { value: 'like-new', label: i18n.condition_likeNew() },
    { value: 'good', label: i18n.condition_good() },
    { value: 'fair', label: i18n.condition_fair() }
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

  function handleMegaMenuToggle() {
    showMegaMenu = !showMegaMenu;
  }

  function handleSubcategoryFromMega(subcategory: string) {
    goto(`/category/${subcategory}`);
    showMegaMenu = false;
  }
</script>

<svelte:head>
  <title>{translateCategoryName(category.name)} - Driplo</title>
  <meta name="description" content={category.description || ''} />
</svelte:head>

<div class="min-h-screen bg-gray-50">

  <!-- Breadcrumb -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Breadcrumb items={[
        { label: i18n.category_home(), href: '/' },
        { label: translateCategoryName(category.name) }
      ]} />
    </div>
  </div>

  <!-- Clean Category Section -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Category Header -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{translateCategoryName(category.name)}</h1>
        <p class="text-gray-600">{category.description || ''}</p>
      </div>

      <!-- Top Sellers -->
      {#if sellers.length > 0}
        <div class="flex justify-center items-center gap-3 overflow-x-auto scrollbar-hide pb-6">
          {#each sellers.slice(0, 15) as seller}
            <button
              onclick={() => openSellerModal(seller)}
              class="flex flex-col items-center group shrink-0 hover:scale-105 transition-transform cursor-pointer"
              title="{seller.username} - {seller.itemCount} {i18n.category_itemsCount()}"
            >
              <div class="relative">
                <img 
                  src={seller.avatar_url} 
                  alt={seller.username} 
                  class="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-gray-300 shadow-sm transition-all" 
                />
                {#if seller.itemCount === 1}
                  <span class="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-white">{i18n.condition_new().toUpperCase()}</span>
                {/if}
              </div>
              <span class="text-xs mt-1 font-medium text-gray-700 group-hover:text-gray-900">{seller.username}</span>
              <span class="text-[10px] text-gray-500">{seller.itemCount} {i18n.category_itemsCount()}</span>
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Search Bar with Power Variant -->
      <div class="pb-4">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <SearchBar 
              bind:value={searchQuery}
              onSearch={handleSearch}
              onFilter={handleMegaMenuToggle}
              placeholder={i18n.category_searchPlaceholder()}
              showCategoriesButton={true}
              categoriesText={i18n.category_categories()}
              class="w-full"
            />
            
            <!-- Category Mega Menu -->
            {#if showMegaMenu}
              <!-- Backdrop -->
              <button 
                class="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-default"
                onclick={() => showMegaMenu = false}
                aria-label="Close menu"
                tabindex="-1"
              ></button>

              <!-- Menu -->
              <div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2">
                <div class="p-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {#each subcategories as subcategory}
                      <button
                        onclick={() => handleSubcategoryFromMega(subcategory.slug)}
                        class="text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <span class="text-sm font-medium text-gray-900">
                          {translateSubcategoryName(subcategory.name)}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
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
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            >
              {i18n.category_all()}
            </button>
            {#each subcategories as subcat}
              <button
                onclick={() => selectedSubcategory = subcat.id}
                class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
                  {selectedSubcategory === subcat.id
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                {translateSubcategoryName(subcat.name)}
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
        {filteredProducts.length} {i18n.category_itemsCount()}
      </p>
      <div class="flex items-center space-x-2">
        <select 
          bind:value={sortBy}
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="popular">{i18n.filter_mostPopular()}</option>
          <option value="newest">{i18n.filter_newest()}</option>
          <option value="price-low">{i18n.filter_priceLowToHigh()}</option>
          <option value="price-high">{i18n.filter_priceHighToLow()}</option>
        </select>
        <!-- Filter Toggle -->
        <Button 
          variant={showFilters ? "primary" : "outline"} 
          size="sm"
          onclick={() => showFilters = !showFilters}
          class="flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="hidden sm:inline">{i18n.category_filters()}</span>
          <span class="sm:hidden">{i18n.category_filters()}</span>
          {#if selectedSizes.length > 0 || selectedBrands.length > 0 || selectedConditions.length > 0}
            <span class="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedSizes.length + selectedBrands.length + selectedConditions.length}
            </span>
          {/if}
        </Button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Desktop Filters Sidebar -->
      {#if showFilters}
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="bg-white rounded-lg p-4 sticky top-24 shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">{i18n.search_filters()}</h3>
              <button onclick={clearFilters} class="text-sm text-gray-500 hover:text-gray-700">
                {i18n.category_clearAll()}
              </button>
            </div>
            
            <!-- Sizes -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3">{i18n.filter_size()}</h4>
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
              <h4 class="font-medium text-sm mb-3">{i18n.filter_condition()}</h4>
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
              <h4 class="font-medium text-sm mb-3">{i18n.filter_priceRange()}</h4>
              <div class="flex items-center space-x-2">
                <input 
                  type="number" 
                  bind:value={priceRange.min}
                  placeholder="{i18n.search_min()}"
                  class="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm"
                />
                <span class="text-gray-500">-</span>
                <input 
                  type="number" 
                  bind:value={priceRange.max}
                  placeholder="{i18n.search_max()}"
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
                formatPrice: (price: number) => formatPrice(price),
                categoryTranslation: translateSubcategoryName
              }}
            />
          {/each}
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div class="text-center mt-8">
      <Button variant="outline" size="lg">
        {i18n.category_loadMore()}
      </Button>
    </div>
  </div>
</div>

<!-- Mobile Filter Drawer -->
{#if showFilters}
  <div class="lg:hidden fixed inset-0 z-50">
    <!-- Backdrop -->
    <button 
      class="fixed inset-0 bg-black bg-opacity-50"
      onclick={() => showFilters = false}
      aria-label="Close filters"
    ></button>
    
    <!-- Drawer -->
    <div class="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl h-[calc(90vh-4rem)] flex flex-col shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold">Filters</h2>
        <button onclick={() => showFilters = false} class="p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Sizes -->
        <div>
          <h4 class="font-medium text-sm mb-3">Size</h4>
          <div class="grid grid-cols-3 gap-2">
            {#each sizes as size}
              <button
                onclick={() => toggleSize(size)}
                class="px-3 py-2 text-sm border rounded-lg transition-all duration-200 font-medium
                  {selectedSizes.includes(size) 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                {size}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Condition -->
        <div>
          <h4 class="font-medium text-sm mb-3">Condition</h4>
          <div class="space-y-2">
            {#each conditions as condition}
              <button
                onclick={() => toggleCondition(condition.value)}
                class="w-full py-3 px-3 text-sm rounded-lg border text-left transition-all duration-200 font-medium
                  {selectedConditions.includes(condition.value)
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                {condition.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Price Range -->
        <div>
          <h4 class="font-medium text-sm mb-3">Price Range</h4>
          <div class="flex items-center space-x-2">
            <input 
              type="number" 
              bind:value={priceRange.min}
              placeholder="Min"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span class="text-gray-500">-</span>
            <input 
              type="number" 
              bind:value={priceRange.max}
              placeholder="Max"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      
      <!-- Footer Actions -->
      <div class="flex space-x-3 p-4 border-t border-gray-100">
        <Button onclick={clearFilters} variant="outline" class="flex-1">Clear All</Button>
        <Button onclick={() => showFilters = false} class="flex-1">Apply Filters</Button>
      </div>
    </div>
  </div>
{/if}

<!-- Seller Quick View Modal -->
{#if selectedSeller}
  <SellerQuickView
    seller={selectedSeller}
    bind:isOpen={showSellerModal}
    onClose={closeSellerModal}
    onViewProfile={(sellerId) => goto(`/profile/${sellerId}`)}
  />
{/if}

<!-- Bottom Navigation -->
<BottomNav 
  currentPath={$page.url.pathname}
  isNavigating={!!$navigating}
  navigatingTo={$navigating?.to?.url.pathname}
  unreadMessageCount={$unreadMessageCount}
/>

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