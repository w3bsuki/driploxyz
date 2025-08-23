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
    promotedProducts, 
    sellers, 
    onSellerSelect, 
    onSellerClick,
    onProductClick,
    onProductBuy,
    onToggleFavorite,
    favoritesState,
    translations, 
    formatPrice 
  }: Props = $props();

  let selectedProduct = $state<Product | null>(null);
  let showQuickView = $state(false);

  function handleProductClick(product: Product) {
    selectedProduct = product;
    showQuickView = true;
  }

  function handleCloseModal() {
    showQuickView = false;
    selectedProduct = null;
  }

  function handleBuy(productId: string, selectedSize?: string) {
    onProductBuy?.(productId, selectedSize);
    handleCloseModal();
  }

  function handleFavoriteToggle(productId: string) {
    onToggleFavorite?.(productId);
  }

  // Get favorite status and loading state for a product
  function getFavoriteData(productId: string) {
    const isFavorited = favoritesState?.favorites[productId] || false;
    const isLoading = favoritesState?.isLoading || false;
    return { isFavorited, isLoading };
  }
</script>

<!-- Promoted Listings / Highlights -->
<div class="bg-white border-b border-gray-200">
  <div class="px-4 sm:px-6 lg:px-8 py-4">
    <!-- Promoted header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-900 uppercase tracking-wide">{translations.trending_promoted}</span>
        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">{translations.trending_featured}</span>
      </div>
      <div class="flex items-center gap-1 text-gray-400">
        <span class="text-xs">{translations.ui_scroll || 'Scroll'}</span>
        <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
    <div class="overflow-x-auto scrollbar-hide">
      <div class="flex space-x-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <!-- Promoted Products -->
        {#if promotedProducts && promotedProducts.length > 0}
          {#each promotedProducts as product}
            <ProductHighlight 
              {product} 
              currency={translations.common_currency}
              {formatPrice}
              onProductClick={handleProductClick}
              onBuy={(productId, selectedSize) => onProductBuy?.(productId, selectedSize)}
              onToggleFavorite={(productId) => onToggleFavorite?.(productId)}
              isFavorite={getFavoriteData(product.id).isFavorited}
              isLoadingFavorite={getFavoriteData(product.id).isLoading}
            />
          {/each}
        {/if}

        <!-- Top Sellers (fallback) -->
        {#if (!promotedProducts || promotedProducts.length === 0) && sellers.length > 0}
          {#each sellers as seller}
            <div class="relative shrink-0">
              <Avatar 
                size="lg" 
                name={seller.name} 
                src={seller.avatar}
                premium={seller.premium}
                variant="square"
                onclick={() => onSellerClick(seller)}
              />
              {#if seller.premium}
                <div class="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full border border-white shadow-lg flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

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
