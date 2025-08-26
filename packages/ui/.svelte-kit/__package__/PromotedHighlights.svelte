<script lang="ts">
  import Avatar from './Avatar.svelte';
  import ProductHighlight from './ProductHighlight.svelte';
  import HighlightQuickView from './HighlightQuickView.svelte';
  import type { Product, Seller } from './types/index.js';

  interface Translations {
    seller_premiumSeller: string;
    seller_premiumSellerDescription: string;
    trending_promoted: string;
    trending_featured: string;
    common_currency: string;
    ui_scroll?: string;
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
  @keyframes bounce-x {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(3px);
    }
  }
  
  .animate-bounce-x {
    animation: bounce-x 1.5s ease-in-out infinite;
  }
</style>

<!-- Promoted Listings / Highlights -->
<section 
  class="bg-white border-b border-gray-200"
  aria-label={translations.trending_promoted}
  role="region"
>
  <div class="px-4 sm:px-6 lg:px-8 py-4">
    <!-- Promoted header with improved a11y and typography -->
    <header class="flex items-center justify-between mb-4">
      <h2 class="flex items-center gap-3">
        <!-- PROMOTED badge - exactly like LIVE badge styling -->
        <span class="flex items-center gap-1.5 px-2.5 py-1 bg-white text-black rounded-full">
          <span class="relative flex h-2 w-2">
            <span class="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-yellow-400 to-amber-500"></span>
          </span>
          <span class="text-black font-medium text-[11px] uppercase tracking-widest">{translations.trending_promoted}</span>
        </span>
        {#if hasProducts}
          <span class="sr-only">
            {promotedProducts.length} promoted products available
          </span>
        {:else if hasSellers}
          <span class="sr-only">
            {sellers.length} premium sellers available
          </span>
        {/if}
      </h2>
      <!-- Improved scroll indicator with better visibility -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full" role="status" aria-live="polite">
        <span class="text-sm font-medium text-gray-700">{translations.ui_scroll || 'Scroll'}</span>
        <svg class="w-5 h-5 text-gray-600 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </div>
      <!-- Mobile scroll indicator - more subtle -->
      <div class="sm:hidden flex items-center" aria-hidden="true">
        <svg class="w-6 h-6 text-gray-400 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </header>
    <nav 
      role="navigation"
      aria-label="Promoted products carousel"
      class="overflow-x-auto scrollbar-hide"
      onkeydown={handleKeyNavigation}
    >
      <div 
        class="flex flex-nowrap space-x-3 -mx-4 px-4 sm:mx-0 sm:px-0"
        data-highlights-container
        role="list"
      >
        <!-- Promoted Products -->
        {#if hasProducts}
          {#each promotedProducts as product, index}
            <div role="listitem" data-highlight-item>
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

        <!-- Top Sellers (fallback) -->
        {#if showSellers}
          {#each sellers as seller, index}
            <div 
              role="listitem" 
              data-highlight-item
              class="relative shrink-0"
            >
              <button
                onclick={() => onSellerClick(seller)}
                class="relative block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 rounded-lg"
                aria-label="View {seller.name}'s profile{seller.premium ? ' - Premium seller' : ''}"
                tabindex={currentFocusIndex === index ? 0 : -1}
              >
                <Avatar 
                  size="lg" 
                  name={seller.name} 
                  src={seller.avatar}
                  premium={seller.premium}
                  variant="square"
                />
                {#if seller.premium}
                  <div 
                    class="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full border border-white shadow-lg flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                {/if}
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
