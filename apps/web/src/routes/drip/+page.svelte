<script lang="ts">
  import { 
    ProductCard, 
    Button, 
    LoadingSpinner, 
    Breadcrumb,
    FilterPill,
    FilterPillGroup,
    FeaturedSellers,
    SellerQuickView,
    IntegratedSearchBar,
    CategoryBottomSheet,
    BottomNav,
    Badge,
    PremiumBadge,
    VirtualProductGrid
  } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { page, navigating } from '$app/stores';
  import * as i18n from '@repo/i18n';
  import { favoritesActions, favoritesStore } from '$lib/stores/favorites-store';
  import { authPopupActions } from '$lib/stores/auth-popup-store';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
  import type { PageData } from './$types';
  import type { Product } from '@repo/ui/types';

  let { data }: { data: PageData } = $props();

  // Filter state with better naming
  let selectedCategory = $state(data.category || '');
  let selectedSort = $state(data.sortBy || 'quality');
  let selectedPriceRange = $state(data.priceRange || '');
  let selectedQualityRange = $state({ min: 8, max: 10 });
  let showVerifiedOnly = $state(false);
  let loading = $state(false);
  
  // UI state
  let showFilters = $state(false);
  let searchQuery = $state('');
  let showMegaMenu = $state(false);
  
  // Seller modal state
  let selectedSeller = $state<any>(null);
  let showSellerModal = $state(false);

  // Transform server data to Product type with drip-specific enhancements
  const products = $derived<Product[]>(
    (data.products || []).map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: i18n.common_currency(),
      images: (product.product_images || [])
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(img => img.image_url)
        .filter(Boolean),
      condition: product.condition as Product['condition'],
      seller_id: product.seller_id,
      category_id: product.categories?.id || '',
      size: product.size,
      brand: product.brand,
      description: product.description,
      created_at: product.created_at,
      updated_at: product.updated_at,
      sold: false,
      favorite_count: 0,
      views_count: 0,
      category_name: product.categories?.name,
      seller_name: product.profiles?.username || product.profiles?.full_name,
      seller_avatar: product.profiles?.avatar_url,
      seller_rating: 0,
      slug: product.slug,
      // Enhanced drip-specific properties
      is_promoted: true, // All drip products are promoted
      is_drip: true, // Drip collection flag
      drip_quality_score: product.drip_quality_score,
      drip_approved_at: product.drip_approved_at,
      // Additional computed properties for premium display
      quality_tier: product.drip_quality_score >= 9 ? 'exceptional' : 
                    product.drip_quality_score >= 8 ? 'premium' : 'quality'
    }))
  );
  
  // Breadcrumb navigation
  const breadcrumbs = [
    { label: i18n.nav_home(), href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: 'Drip Collection', href: '/drip' }
  ];

  function formatPrice(price: number): string {
    const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2);
    return `${formatted}${i18n.common_currency()}`;
  }

  function handleProductClick(product: Product) {
    if (!product.slug || !product.seller_name) {
      goto(`/product/${product.id}`);
      return;
    }
    goto(getProductUrl(product));
  }

  async function handleFavorite(productId: string) {
    if (!data.user) {
      authPopupActions.showForFavorite();
      return;
    }
    await favoritesActions.toggleFavorite(productId);
  }

  function getFavoriteData(productId: string) {
    return {
      isFavorited: data.userFavorites[productId] || $favoritesStore.favorites[productId] || false,
      isLoading: $favoritesStore.isLoading
    };
  }

  async function applyFilters() {
    loading = true;
    const url = new URL($page.url);
    
    // Update search params
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }
    
    if (selectedSort && selectedSort !== 'quality') {
      url.searchParams.set('sort', selectedSort);
    } else {
      url.searchParams.delete('sort');
    }

    if (selectedPriceRange) {
      url.searchParams.set('price', selectedPriceRange);
    } else {
      url.searchParams.delete('price');
    }
    
    // Reset to page 1 when filtering
    url.searchParams.delete('page');
    
    await goto(url.pathname + url.search, { invalidateAll: true });
    loading = false;
  }

  function clearFilters() {
    selectedCategory = '';
    selectedSort = 'quality';
    selectedPriceRange = '';
    applyFilters();
  }

  function translateCategory(categorySlug: string): string {
    const categoryMap: Record<string, string> = {
      'women': i18n.category_women?.() || 'Women',
      'men': i18n.category_men?.() || 'Men', 
      'kids': i18n.category_kids?.() || 'Kids'
    };
    return categoryMap[categorySlug] || categorySlug;
  }

  async function loadMore() {
    if (data.hasMore && !loading) {
      loading = true;
      const url = new URL($page.url);
      url.searchParams.set('page', String(data.currentPage + 1));
      await goto(url.pathname + url.search, { invalidateAll: true });
      loading = false;
    }
  }

  function getQualityStars(score: number): string {
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 === 1;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
  
  function getQualityBadgeVariant(score: number): 'exceptional' | 'premium' | 'quality' {
    if (score >= 9) return 'exceptional';
    if (score >= 8) return 'premium';
    return 'quality';
  }
  
  function getQualityBadgeColor(tier: string): string {
    const colors = {
      exceptional: 'bg-gradient-to-r from-purple-500 to-pink-500',
      premium: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      quality: 'bg-gradient-to-r from-green-500 to-emerald-500'
    };
    return colors[tier as keyof typeof colors] || colors.quality;
  }
  
  // Filter pill data - with safe defaults and reactive updates
  let categoryPills = $derived((data?.availableCategories || []).map(cat => ({
    id: cat.slug,
    label: translateCategory(cat.slug),
    count: cat.productCount || 0,
    active: selectedCategory === cat.slug
  })));
  
  const sortPills = (data.availableSorts || []).map(sort => ({
    id: sort.key,
    label: sort.label,
    icon: sort.icon,
    active: selectedSort === sort.key
  }));
  
  // Filter helpers
  function handleCategoryPillClick(categorySlug: string) {
    selectedCategory = selectedCategory === categorySlug ? '' : categorySlug;
    applyFilters();
  }
  
  function handleSortPillClick(sortKey: string) {
    selectedSort = sortKey;
    applyFilters();
  }
  
  function toggleVerifiedFilter() {
    showVerifiedOnly = !showVerifiedOnly;
    applyFilters();
  }

  async function handleSearch(query: string) {
    if (query.trim()) {
      await goto(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  function handleMegaMenuToggle() {
    showMegaMenu = !showMegaMenu;
  }

  function openSellerModal(seller: any) {
    selectedSeller = seller;
    showSellerModal = true;
  }

  function closeSellerModal() {
    showSellerModal = false;
    selectedSeller = null;
  }
</script>

<svelte:head>
  <title>Drip Collection - Driplo</title>
  <meta name="description" content="Discover premium curated fashion items - the highest quality products on Driplo" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Loading overlay when navigating -->
  {#if $navigating}
    <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black mx-auto mb-2"></div>
        <p class="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  {/if}

  <!-- Breadcrumb -->
  <div class="bg-white">
    <div class="px-2 sm:px-4 lg:px-6 py-3">
      <Breadcrumb items={breadcrumbs} />
    </div>
  </div>

  <!-- Premium Hero Section -->
  <div class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
      <div class="text-center">
        <!-- Premium Icon -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6 shadow-lg">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div class="absolute -top-1 -right-1">
              <Badge variant="secondary" class="text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
                DRIP
              </Badge>
            </div>
          </div>
        </div>
        
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          The Drip Collection
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Handpicked premium fashion items that meet our highest quality standards. 
          Every piece is carefully curated by our expert team for exceptional style and quality.
        </p>
        
        <!-- Enhanced Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="text-3xl font-bold text-purple-600 mb-2">{data.dripStats.totalItems}</div>
            <div class="text-sm font-medium text-gray-600">Curated Items</div>
            <div class="text-xs text-gray-500 mt-1">Premium Selection</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="text-3xl font-bold text-blue-600 mb-2">{data.dripStats.averageQuality}/10</div>
            <div class="text-sm font-medium text-gray-600">Avg Quality</div>
            <div class="text-xs text-gray-500 mt-1">Expert Rated</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="text-3xl font-bold text-indigo-600 mb-2">{data.dripStats.uniqueBrands}</div>
            <div class="text-sm font-medium text-gray-600">Premium Brands</div>
            <div class="text-xs text-gray-500 mt-1">Luxury & Designer</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="text-3xl font-bold text-green-600 mb-2">{data.dripStats.verifiedSellers}</div>
            <div class="text-sm font-medium text-gray-600">Verified Sellers</div>
            <div class="text-xs text-gray-500 mt-1">Trusted Partners</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation & Search Section -->
  <div class="bg-white border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      
      <!-- Featured Sellers Row -->
      {#if data.featuredSellers && data.featuredSellers.length > 0}
        <div class="mb-6">
          <FeaturedSellers 
            sellers={data.featuredSellers}
            title="Top Drip Sellers"
            onSellerClick={openSellerModal}
          />
        </div>
      {/if}
      
      <!-- Search Bar with Integrated Design -->
      <div class="mb-6">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <IntegratedSearchBar
              bind:searchValue={searchQuery}
              onSearch={handleSearch}
              placeholder="Search drip collection..."
              class="w-full"
            >
              {#snippet leftSection()}
                <button
                  onclick={handleMegaMenuToggle}
                  class="h-12 px-3 rounded-l-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
                  aria-label="Categories"
                >
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span class="text-sm text-gray-600 hidden sm:inline">Categories</span>
                </button>
              {/snippet}
            </IntegratedSearchBar>
            
            <!-- Category Mega Menu -->
            {#if showMegaMenu}
              <!-- Backdrop -->
              <button 
                class="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-default"
                onclick={() => showMegaMenu = false}
                aria-label="Close menu"
                tabindex="-1"
              ></button>

              <!-- Dropdown Menu -->
              <div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2">
                <div class="p-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {#each (data.availableCategories || []) as cat}
                      <button
                        onclick={() => { selectedCategory = cat.slug; showMegaMenu = false; applyFilters(); }}
                        class="text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors block"
                      >
                        <span class="text-sm font-medium text-gray-900">
                          {translateCategory(cat.slug)}
                        </span>
                        {#if cat.productCount}
                          <span class="text-xs text-gray-500 block">({cat.productCount})</span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Filter Pills Section -->
      <div class="space-y-4">
        <!-- Category Pills -->
        {#if (categoryPills || []).length > 0}
          <div class="flex justify-center">
            <div class="flex overflow-x-auto scrollbar-hide gap-2 px-4">
              <FilterPillGroup>
                {#each (categoryPills || []).slice(0, 8) as pill}
                  <FilterPill 
                    variant={pill.active ? "primary" : "secondary"}
                    onClick={() => handleCategoryPillClick(pill.id)}
                  >
                    {#snippet children()}
                      {pill.label}
                      {#if pill.count > 0}
                        <span class="text-xs opacity-75">({pill.count})</span>
                      {/if}
                    {/snippet}
                  </FilterPill>
                {/each}
              </FilterPillGroup>
            </div>
          </div>
        {/if}
        
        <!-- Sort Pills -->
        <div class="flex justify-center">
          <div class="flex overflow-x-auto scrollbar-hide gap-2 px-4">
            <FilterPillGroup>
              {#each sortPills as pill}
                <FilterPill 
                  variant={pill.active ? "primary" : "secondary"}
                  onClick={() => handleSortPillClick(pill.id)}
                >
                  {#snippet children()}
                    {pill.icon} {pill.label}
                  {/snippet}
                </FilterPill>
              {/each}
              
              <!-- Verified Filter Pill -->
              <FilterPill 
                variant={showVerifiedOnly ? "primary" : "secondary"}
                onClick={toggleVerifiedFilter}
              >
                {#snippet children()}
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Verified Only
                {/snippet}
              </FilterPill>
            </FilterPillGroup>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content Header -->
  <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-600">
            {data.totalCount} premium drip items
          </p>
          
          <!-- Quality Filter Range Display -->
          {#if selectedQualityRange.min !== 8 || selectedQualityRange.max !== 10}
            <Badge variant="outline" class="text-xs">
              Quality: {selectedQualityRange.min}-{selectedQualityRange.max}/10
            </Badge>
          {/if}
        </div>
        
        <!-- Desktop Filter Toggle -->
        <div class="hidden sm:flex items-center gap-2">
          {#if selectedCategory || selectedPriceRange || selectedSort !== 'quality' || showVerifiedOnly}
            <Button variant="ghost" size="sm" onclick={clearFilters}>
              Clear All Filters
            </Button>
          {/if}
          
          <Button 
            variant={showFilters ? "primary" : "outline"} 
            size="sm"
            onclick={() => showFilters = !showFilters}
            class="flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Advanced Filters
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="px-2 sm:px-4 lg:px-6 py-6">
    <div class="flex gap-6">
      <!-- Desktop Advanced Filters Sidebar -->
      {#if showFilters}
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="bg-white rounded-xl p-6 sticky top-24 shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-semibold text-lg">Advanced Filters</h3>
              <button onclick={() => showFilters = false} class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Quality Score Range -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3 text-gray-700">Quality Score</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Minimum: {selectedQualityRange.min}/10</span>
                  <input 
                    type="range" 
                    min="8" 
                    max="10" 
                    step="0.1"
                    bind:value={selectedQualityRange.min}
                    onchange={applyFilters}
                    class="w-20"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Maximum: {selectedQualityRange.max}/10</span>
                  <input 
                    type="range" 
                    min="8" 
                    max="10" 
                    step="0.1"
                    bind:value={selectedQualityRange.max}
                    onchange={applyFilters}
                    class="w-20"
                  />
                </div>
              </div>
            </div>
            
            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3 text-gray-700">Price Range</h4>
              <div class="space-y-2">
                {#each (data.priceRanges || []) as range}
                  <button
                    onclick={() => { selectedPriceRange = selectedPriceRange === range.key ? '' : range.key; applyFilters(); }}
                    class="w-full text-left py-2 px-3 text-sm rounded-lg border transition-colors
                      {selectedPriceRange === range.key
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}"
                  >
                    {range.label}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Verified Sellers -->
            <div class="mb-6">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={showVerifiedOnly}
                  onchange={applyFilters}
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span class="text-sm font-medium text-gray-700">Verified sellers only</span>
              </label>
            </div>
            
            <!-- Clear Filters -->
            <Button onclick={clearFilters} variant="outline" class="w-full">
              Clear All Filters
            </Button>
          </div>
        </aside>
      {/if}
      
      <!-- Products Grid -->
      <div class="flex-1">
        <div class="max-w-7xl mx-auto">
          {#if loading}
            <div class="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          {:else if products.length > 0}
            <!-- Enhanced Product Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 {showFilters ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} xl:grid-cols-5 gap-4 sm:gap-6">
              {#each products as product}
                <div class="relative group">
                  <!-- Premium Drip Badge -->
                  <div class="absolute top-3 right-3 z-10">
                    <PremiumBadge 
                      tier={product.quality_tier}
                      class="shadow-lg"
                    />
                  </div>
                  
                  <!-- Quality Score Badge (shown on hover) -->
                  {#if product.drip_quality_score}
                    <div class="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Badge 
                        variant="secondary" 
                        class="bg-black/75 text-white text-xs backdrop-blur-sm"
                      >
                        <span class="text-yellow-300 mr-1">{getQualityStars(product.drip_quality_score)}</span>
                        {product.drip_quality_score}/10
                      </Badge>
                    </div>
                  {/if}
                  
                  <!-- Verified Seller Badge -->
                  {#if product.seller_verified}
                    <div class="absolute bottom-3 left-3 z-10">
                      <Badge variant="success" class="text-xs">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Verified
                      </Badge>
                    </div>
                  {/if}
                  
                  <ProductCard
                    {product}
                    currency={i18n.common_currency()}
                    onProductClick={handleProductClick}
                    onToggleFavorite={handleFavorite}
                    isFavorite={getFavoriteData(product.id).isFavorited}
                    isLoadingFavorite={getFavoriteData(product.id).isLoading}
                    {formatPrice}
                    showQuickActions={true}
                    class="group-hover:shadow-lg transition-shadow duration-200"
                  />
                </div>
              {/each}
            </div>
            
            <!-- Load More Section -->
            {#if data.hasMore}
              <div class="text-center mt-12">
                <Button
                  onclick={loadMore}
                  disabled={loading}
                  size="lg"
                  class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Loading More...' : 'Discover More Drip'}
                </Button>
              </div>
            {/if}
            
            <!-- Pagination Info -->
            <div class="text-center mt-8 text-sm text-gray-500">
              <span class="bg-white px-3 py-1 rounded-full border border-gray-200">
                Page {data.currentPage} of {data.totalPages} • {data.totalCount} premium drip items
              </span>
            </div>
            
          {:else}
            <!-- Enhanced Empty State -->
            <div class="text-center py-20">
              <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg class="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 mb-4">No drip items found</h3>
              <p class="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                {selectedCategory || selectedPriceRange || selectedSort !== 'quality' || showVerifiedOnly ? 
                  'Try adjusting your filters to discover more premium items from our curated collection.' : 
                  'Our expert-curated drip collection is constantly growing. Check back soon for more exceptional pieces.'}
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                {#if selectedCategory || selectedPriceRange || selectedSort !== 'quality' || showVerifiedOnly}
                  <Button onclick={clearFilters} variant="outline" size="lg">
                    Clear All Filters
                  </Button>
                {/if}
                
                <Button onclick={() => goto('/search')} variant="primary" size="lg">
                  Browse All Products
                </Button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Mobile Filter Bottom Sheet -->
{#if showFilters}
  <CategoryBottomSheet 
    bind:isOpen={showFilters}
    title="Drip Filters"
  >
    {#snippet content()}
      <div class="space-y-6 p-4">
        <!-- Quality Score Range -->
        <div>
          <h4 class="font-medium text-sm mb-4 text-gray-700">Quality Score</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-gray-600 mb-2">Minimum: {selectedQualityRange.min}/10</label>
              <input 
                type="range" 
                min="8" 
                max="10" 
                step="0.1"
                bind:value={selectedQualityRange.min}
                onchange={applyFilters}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-2">Maximum: {selectedQualityRange.max}/10</label>
              <input 
                type="range" 
                min="8" 
                max="10" 
                step="0.1"
                bind:value={selectedQualityRange.max}
                onchange={applyFilters}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <!-- Price Range -->
        <div>
          <h4 class="font-medium text-sm mb-4 text-gray-700">Price Range</h4>
          <div class="grid grid-cols-1 gap-2">
            {#each (data.priceRanges || []) as range}
              <button
                onclick={() => { selectedPriceRange = selectedPriceRange === range.key ? '' : range.key; applyFilters(); }}
                class="text-left py-3 px-4 text-sm rounded-xl border transition-colors font-medium
                  {selectedPriceRange === range.key
                    ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}"
              >
                {range.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Verified Sellers -->
        <div>
          <label class="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-xl">
            <span class="text-sm font-medium text-gray-700">Verified sellers only</span>
            <input 
              type="checkbox" 
              bind:checked={showVerifiedOnly}
              onchange={applyFilters}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
            />
          </label>
        </div>
        
        <!-- Clear Filters -->
        <Button onclick={clearFilters} variant="outline" class="w-full py-3">
          Clear All Filters
        </Button>
      </div>
    {/snippet}
  </CategoryBottomSheet>
{/if}

<!-- Seller Quick View Modal -->
{#if selectedSeller && showSellerModal}
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
  profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
  labels={{
    home: i18n.nav_home(),
    search: i18n.nav_search(),
    sell: i18n.nav_sell(),
    profile: i18n.nav_profile(),
    messages: i18n.nav_messages()
  }}
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
  
  /* Custom range slider styling for mobile */
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  input[type="range"]::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>