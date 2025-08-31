<script lang="ts">
  import Avatar from './Avatar.svelte';
  import ProductHighlight from './ProductHighlight.svelte';
  import HighlightQuickView from './HighlightQuickView.svelte';
  import type { Product, Seller } from './types/index';

  interface Translations {
    seller_premiumSeller: string;
    seller_premiumSellerDescription: string;
    trending_promoted: string;
    trending_featured: string;
    common_currency: string;
    ui_scroll?: string;
    promoted_hotPicks?: string;
    promoted_premiumSellers?: string;
  }

  interface FavoriteState {
    isLoading: boolean;
    error: string | null;
    favorites: Record<string, boolean>;
    favoriteCounts: Record<string, number>;
  }

  interface Props {
    promotedProducts: Product[];
    sellers: Seller[];
    onSellerSelect: (seller: Seller) => void;
    onSellerClick: (seller: Seller) => void;
    onProductClick?: (product: Product) => void;
    onProductBuy?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    favoritesState?: FavoriteState;
    translations: Translations;
    formatPrice?: (price: number) => string;
  }

  let { 
    promotedProducts = [], 
    sellers = [], 
    onSellerSelect, 
    onSellerClick,
    onProductClick,
    onProductBuy,
    onToggleFavorite,
    favoritesState,
    translations, 
    formatPrice = (price: number) => `${price.toFixed(2)}`
  }: Props = $props();

  let selectedProduct = $state<Product | null>(null);
  let showQuickView = $state(false);
  let currentFocusIndex = $state(-1);

  // Derived states
  const hasProducts = $derived(promotedProducts.length > 0);
  const hasSellers = $derived(sellers.length > 0);
  const showSellers = $derived(!hasProducts && hasSellers);
  const totalItems = $derived(hasProducts ? promotedProducts.length : sellers.length);

  function handleProductClick(product: Product) {
    selectedProduct = product;
    showQuickView = true;
    // Don't call onProductClick here - it navigates to the product page
  }

  function handleCloseModal() {
    showQuickView = false;
    setTimeout(() => selectedProduct = null, 300);
  }

  function handleBuy(productId: string, selectedSize?: string) {
    onProductBuy?.(productId, selectedSize);
    handleCloseModal();
  }

  function getFavoriteData(productId: string) {
    return {
      isFavorited: favoritesState?.favorites[productId] ?? false,
      isLoading: favoritesState?.isLoading ?? false
    };
  }

  function handleFavoriteToggle(productId: string) {
    onToggleFavorite?.(productId);
  }

  function handleKeyNavigation(e: KeyboardEvent) {
    if (!hasProducts && !hasSellers) return;
    
    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        currentFocusIndex = Math.min(currentFocusIndex + 1, totalItems - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        currentFocusIndex = Math.max(currentFocusIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        currentFocusIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        currentFocusIndex = totalItems - 1;
        break;
    }

    const container = document.querySelector('[data-highlights-container]');
    const items = container?.querySelectorAll('[data-highlight-item]');
    items?.[currentFocusIndex]?.focus();
  }
</script>

<style>
  /* Hide scrollbars for a cleaner look */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scroll-snap-x { scroll-snap-type: x mandatory; }
  .snap-start { scroll-snap-align: start; }
</style>

<!-- Promoted Listings / Highlights -->
<section 
  class="border-y"
  style="background-color: oklch(0.98 0.005 270); border-color: oklch(0.87 0.01 270 / 0.3);"
  aria-label={translations.trending_promoted}
  role="region"
>
  
  <!-- Section Header -->
  <div class="px-4 sm:px-6 pt-4 pb-3">
    <div class="flex items-center gap-2">
      <h2 class="text-sm font-semibold" style="color: oklch(0.15 0.015 270);">
        {hasProducts ? (translations.promoted_hotPicks || 'Горещи предложения') : (translations.promoted_premiumSellers || 'Премиум продавачи')}
      </h2>
      <div class="text-xs font-medium px-2 py-0.5 rounded" style="background-color: oklch(0.94 0.04 85); color: oklch(0.28 0.12 85);">
        Спонсорирано
      </div>
    </div>
  </div>
  
  <div class="px-4 sm:px-6 pb-4">
    <!-- Screen reader only announcements for accessibility -->
    {#if hasProducts}
      <span class="sr-only">{promotedProducts.length} featured products available</span>
    {:else if hasSellers}
      <span class="sr-only">{sellers.length} premium sellers available</span>
    {/if}
    <nav 
      role="navigation"
      aria-label="Promoted products carousel"
      class="relative overflow-x-auto scrollbar-hide pb-2"
      onkeydown={handleKeyNavigation}
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <div 
        class="flex flex-nowrap gap-3 sm:gap-4 scroll-snap-x"
        data-highlights-container
        role="list"
      >
        <!-- Promoted Products -->
        {#if hasProducts}
          {#each promotedProducts as product, index}
            <div role="listitem" data-highlight-item class="snap-start">
              <ProductHighlight 
                {product} 
                currency={translations.common_currency}
                {formatPrice}
                onProductClick={handleProductClick}
                onBuy={(productId, selectedSize) => onProductBuy?.(productId, selectedSize)}
                onToggleFavorite={handleFavoriteToggle}
                isFavorite={getFavoriteData(product.id).isFavorited}
                isLoadingFavorite={getFavoriteData(product.id).isLoading}
                {index}
                totalCount={promotedProducts.length}
              />
            </div>
          {/each}
        {/if}

        <!-- Premium Sellers (fallback) -->
        {#if showSellers}
          {#each sellers as seller, index}
            <div 
              role="listitem" 
              data-highlight-item
              class="relative shrink-0 snap-start"
            >
              <button
                onclick={() => onSellerClick(seller)}
                class="group relative block focus:outline-none focus:ring-2 focus:ring-purple-400/40 rounded-2xl transition-all duration-200"
                aria-label="View {seller.name}'s profile{seller.premium ? ' - Premium seller' : ''}"
                tabindex={currentFocusIndex === index ? 0 : -1}
              >
                <!-- Premium Seller Card -->
                <div class="relative w-44 sm:w-52 md:w-56">
                  <div class="bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 border border-gray-200 overflow-hidden p-4">
                    
                    <!-- Premium Badge -->
                    {#if seller.premium}
                      <div class="absolute top-2 right-2 z-10">
                        <div class="bg-purple-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                          PRO
                        </div>
                      </div>
                    {/if}
                    
                    <!-- Seller Avatar -->
                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-3">
                        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow">
                          {#if seller.avatar}
                            <img 
                              src={seller.avatar} 
                              alt="{seller.name}'s profile picture"
                              class="w-full h-full object-cover"
                            />
                          {:else}
                            <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                              {seller.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          {/if}
                        </div>
                        
                        <!-- Premium Star -->
                        {#if seller.premium}
                          <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full border-2 border-white shadow flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                        {/if}
                      </div>
                      
                      <!-- Seller Info -->
                      <h3 class="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                        {seller.name}
                      </h3>
                      
                      <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        {#if seller.itemCount}
                          <span>{seller.itemCount} items</span>
                        {/if}
                        {#if seller.followers}
                          <span>•</span>
                          <span>{seller.followers} followers</span>
                        {/if}
                      </div>
                      
                      <!-- Rating -->
                      {#if seller.rating}
                        <div class="flex items-center gap-1 mb-2">
                          <div class="flex">
                            {#each Array(5) as _, i}
                              <svg class="w-3 h-3 {i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            {/each}
                          </div>
                          <span class="text-xs text-gray-600 ml-1">{seller.rating.toFixed(1)}</span>
                        </div>
                      {/if}
                      
                      <!-- View Profile Button -->
                      <div class="w-full">
                        <div class="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors">
                          View Profile
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </nav>
  </div>
</section>

<!-- Modal rendered at the end -->
{#if showQuickView && selectedProduct}
  <HighlightQuickView 
    product={selectedProduct}
    onClose={handleCloseModal}
    onAddToCart={handleBuy}
    onToggleFavorite={handleFavoriteToggle}
    isFavorited={getFavoriteData(selectedProduct.id).isFavorited}
    isLoadingFavorite={getFavoriteData(selectedProduct.id).isLoading}
  />
{/if}
