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
  /* Clean, minimal styles */
</style>

<!-- Promoted Listings / Highlights -->
<section 
  class="bg-white border-b border-gray-200"
  aria-label={translations.trending_promoted}
  role="region"
>
  <div class="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
    <!-- Promoted header with improved a11y and typography -->
    <header class="flex items-center justify-between mb-3">
      <h2 class="flex items-center">
        <!-- PROMOTED badge compact with subtle border - clean, no extra text -->
        <span class="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
          <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="uppercase tracking-wider">{translations.trending_promoted}</span>
        </span>
        {#if hasProducts}
          <span class="sr-only">{promotedProducts.length} promoted products available</span>
        {:else if hasSellers}
          <span class="sr-only">{sellers.length} premium sellers available</span>
        {/if}
      </h2>
      <!-- Elegant scroll indicator -->
      <div class="hidden sm:flex items-center gap-1.5 text-xs text-gray-500" role="status" aria-live="polite">
        <span class="hidden lg:inline">{translations.ui_scroll || 'Scroll'}</span>
        <div class="flex gap-0.5">
          <span class="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
          <span class="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></span>
          <span class="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></span>
        </div>
      </div>
      <!-- Mobile scroll indicator - minimal dots -->
      <div class="sm:hidden flex gap-0.5" aria-hidden="true">
        <span class="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
        <span class="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
        <span class="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
      </div>
    </header>
    <nav 
      role="navigation"
      aria-label="Promoted products carousel"
      class="overflow-x-auto scrollbar-hide"
      onkeydown={handleKeyNavigation}
    >
      <div 
        class="flex flex-nowrap gap-2.5 sm:gap-3 -mx-3 px-3 sm:mx-0 sm:px-0"
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
