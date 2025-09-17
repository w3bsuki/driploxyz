<script lang="ts">
  import Avatar from './Avatar.svelte';
  import ProductHighlight from './ProductHighlight.svelte';
  import HighlightQuickView from './HighlightQuickView.svelte';
  import type { Product } from './types/product';
  import type { Seller } from './types/index';

  interface Translations {
    seller_premiumSeller: string;
    seller_premiumSellerDescription: string;
    trending_promoted: string;
    trending_featured: string;
    common_currency: string;
    ui_scroll?: string;
    promoted_hotPicks?: string;
    promoted_premiumSellers?: string;
    categoryTranslation?: (category: string) => string;
  }

  interface FavoriteState {
    isLoading: boolean;
    error: string | null;
    favorites: Record<string, boolean>;
    favoriteCounts: Record<string, number>;
  }

  interface Partner {
    id: string;
    name: string;
    logo: string;
    website?: string;
    instagram?: string;
    description?: string;
  }

  interface Props {
    promotedProducts: Product[];
    sellers: Seller[];
    partners?: Partner[];
    onSellerSelect: (seller: Seller) => void;
    onSellerClick: (seller: Seller) => void;
    onPartnerClick?: (partner: Partner) => void;
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
    partners = [],
    onSellerSelect, 
    onSellerClick,
    onPartnerClick,
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
    const items = container?.querySelectorAll<HTMLElement>('[data-highlight-item]');
    items?.[currentFocusIndex]?.focus();
  }

  // Generate avatar colors based on account type
  function getAvatarColors(accountType: string): string {
    const colors = {
      'brand': 'from-purple-500 to-purple-700',
      'pro': 'from-blue-500 to-blue-700',
      'personal': 'from-gray-500 to-gray-700',
      'new': 'from-green-500 to-green-700'
    };
    return colors[accountType as keyof typeof colors] || colors.personal;
  }

  // Simple scroll functions for chevrons
  function scrollLeft() {
    const container = document.querySelector('[data-highlights-container]');
    if (container) {
      container.scrollBy({ left: -280, behavior: 'smooth' });
    }
  }

  function scrollRight() {
    const container = document.querySelector('[data-highlights-container]');
    if (container) {
      container.scrollBy({ left: 280, behavior: 'smooth' });
    }
  }

</script>

<style>
  .scroll-snap-x { scroll-snap-type: x mandatory; }
  .snap-start { scroll-snap-align: start; }
</style>

<!-- Promoted Listings / Highlights -->
<section 
  class="border-y border-[color:var(--border-subtle)] bg-[color:var(--surface-subtle)] overflow-hidden"
  aria-label={translations.trending_promoted}
  role="region"
>
  
  <!-- Section Header with Navigation -->
  <div class="px-2 sm:px-4 lg:px-6 pt-3 pb-3">
    <!-- Show partners if available, otherwise show traditional header -->
    {#if partners.length > 0}
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Partners</span>
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {#each partners as partner}
            <button
              onclick={() => onPartnerClick?.(partner)}
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-[color:var(--surface-base)] border border-[color:var(--border-default)] rounded-full text-xs font-medium text-[color:var(--text-secondary)] hover:border-[color:var(--border-hover)] hover:bg-[color:var(--surface-muted)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1 shrink-0"
              title="{partner.name}{partner.description ? ` - ${partner.description}` : ''}"
            >
              <div class="w-4 h-4 rounded-full overflow-hidden bg-[color:var(--surface-muted)] flex-shrink-0">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  class="w-full h-full object-contain"
                />
              </div>
              <span>{partner.name}</span>
              {#if partner.instagram}
                <svg class="w-3 h-3 text-[color:var(--accent-emphasis)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.33 4.058.63c-.692.3-1.281.72-1.866 1.305-.585.585-1.006 1.174-1.305 1.866-.3.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.258 1.98.558 2.652.3.692.72 1.281 1.305 1.866.585.585 1.174 1.006 1.866 1.305.672.3 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.258 2.652-.558.692-.3 1.281-.72 1.866-1.305.585-.585 1.006-1.174 1.305-1.866.3-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.258-1.98-.558-2.652C21.36 2.437 20.94 1.848 20.355 1.263S18.462.632 17.77.33c-.672-.3-1.435-.499-2.652-.558C13.899.013 13.432 0 12.017 0zm0 2.167c3.555 0 3.977.012 5.378.07 1.297.059 2.001.277 2.47.46.62.24 1.062.527 1.527.992.465.465.752.907.992 1.527.183.469.401 1.173.46 2.47.058 1.401.07 1.823.07 5.378s-.012 3.977-.07 5.378c-.059 1.297-.277 2.001-.46 2.47-.24.62-.527 1.062-.992 1.527-.465.465-.907.752-1.527.992-.469.183-1.173.401-2.47.46-1.401.058-1.823.07-5.378.07s-3.977-.012-5.378-.07c-1.297-.059-2.001-.277-2.47-.46-.62-.24-1.062-.527-1.527-.992-.465-.465-.752-.907-.992-1.527-.183-.469-.401-1.173-.46-2.47C2.179 15.994 2.167 15.572 2.167 12.017s.012-3.977.07-5.378c.059-1.297.277-2.001.46-2.47.24-.62.527-1.062.992-1.527.465-.465.907-.752 1.527-.992.469-.183 1.173-.401 2.47-.46 1.401-.058 1.823-.07 5.378-.07z"/>
                  <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.191a4.012 4.012 0 110-8.024 4.012 4.012 0 010 8.024z"/>
                  <circle cx="18.406" cy="5.594" r="1.444"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Brands header with navigation -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <h2 class="text-sm font-semibold text-[color:var(--text-primary)]">
            {hasProducts ? (translations.promoted_hotPicks || 'Горещи предложения') : 'Explore brands'}
          </h2>
          {#if !hasProducts && hasSellers}
            <p class="text-xs text-[color:var(--text-secondary)] mt-0.5">
              Discover unique brands and their latest collections
            </p>
          {/if}
        </div>

        <!-- Navigation chevrons for brands -->
        {#if !hasProducts && hasSellers && sellers.length > 1}
          <div class="flex items-center gap-1">
            <button
              onclick={scrollLeft}
              class="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--surface-base)] border border-[color:var(--border-default)] hover:border-[color:var(--border-hover)] hover:bg-[color:var(--surface-muted)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)]"
              aria-label="Scroll left"
            >
              <svg class="w-4 h-4 text-[color:var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              onclick={scrollRight}
              class="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--surface-base)] border border-[color:var(--border-default)] hover:border-[color:var(--border-hover)] hover:bg-[color:var(--surface-muted)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)]"
              aria-label="Scroll right"
            >
              <svg class="w-4 h-4 text-[color:var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <div class="px-2 sm:px-4 lg:px-6 pb-3">
    <!-- Screen reader only announcements for accessibility -->
    {#if hasProducts}
      <span class="sr-only">{promotedProducts.length} featured products available</span>
    {:else if hasSellers}
      <span class="sr-only">{sellers.length} premium sellers available</span>
    {/if}
    <nav
      aria-label="Promoted products carousel"
      class="relative pb-2"
      onkeydown={handleKeyNavigation}
    >
      <div
        class="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
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
                categoryTranslation={translations.categoryTranslation || ((category: string) => category)}
              />
            </div>
          {/each}
        {/if}

        <!-- Brands (fallback) -->
        {#if showSellers}
          {#each sellers as seller, index}
            <div
              role="listitem"
              data-highlight-item
              class="relative flex-shrink-0 snap-start w-[calc(50%-0.5rem)]"
            >
              <button
                onclick={() => onSellerClick(seller)}
                class="group relative block w-full focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] rounded-2xl transition-all duration-200"
                aria-label="View {seller.name}'s profile{seller.account_type === 'pro' ? ' - Pro seller' : ''}"
                tabindex={currentFocusIndex === index ? 0 : -1}
              >
                <!-- Brand Card - Perfect grid layout -->
                <div class="relative w-full">
                  <div class="bg-[color:var(--surface-base)] rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 border border-[color:var(--border-default)] overflow-hidden p-4">
                    
                    
                    <!-- Seller Avatar -->
                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-3">
                        <div class="w-16 h-16 rounded-full overflow-hidden bg-[color:var(--surface-muted)] ring-2 ring-[color:var(--surface-base)] shadow">
                          {#if seller.avatar || seller.avatar_url}
                            <img
                              src={seller.avatar || seller.avatar_url}
                              alt="{seller.name}'s profile picture"
                              class="w-full h-full object-cover"
                              onerror={(e) => {
                                const target = e.currentTarget as HTMLImageElement | null;
                                if (!target) return;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <!-- Fallback avatar -->
                            <div class="w-full h-full bg-gradient-to-br {getAvatarColors(seller.account_type || 'personal')} flex items-center justify-center text-white font-semibold text-lg" style="display: none;">
                              {seller.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          {:else}
                            <!-- Default avatar with account type colors -->
                            <div class="w-full h-full bg-gradient-to-br {getAvatarColors(seller.account_type || 'personal')} flex items-center justify-center text-white font-semibold text-lg">
                              {seller.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          {/if}
                        </div>

                        <!-- Badge System -->
                        <div class="absolute -bottom-1 -right-1 flex items-center gap-1">
                          {#if seller.username === 'TinTin'}
                            <!-- Admin: Crown (special user) -->
                            <div class="w-7 h-7 bg-yellow-600 rounded-full border-2 border-[color:var(--surface-base)] shadow flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 16L3 5l6 4 3-4 3 4 6-4-2 11H5z"/>
                              </svg>
                            </div>
                          {:else if seller.account_type === 'brand'}
                            <!-- Brand: Black Star -->
                            <div class="w-7 h-7 bg-gray-800 rounded-full border-2 border-[color:var(--surface-base)] shadow flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                          {:else if seller.account_type === 'pro'}
                            <!-- PRO: Black Checkmark -->
                            <div class="w-7 h-7 bg-gray-800 rounded-full border-2 border-[color:var(--surface-base)] shadow flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                              </svg>
                            </div>
                          {/if}
                          <!-- Free accounts get no badge -->
                        </div>
                      </div>
                      
                      <!-- Seller Info -->
                      <h3 class="font-semibold text-[color:var(--text-primary)] text-sm mb-1.5 line-clamp-1">
                        {seller.display_name || seller.username}
                      </h3>

                      <div class="flex items-center gap-2 text-xs text-[color:var(--text-secondary)] mb-1.5">
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
                        <div class="flex items-center gap-1 mb-1.5">
                          <div class="flex">
                            {#each Array(5) as _, i}
                              <svg class="w-3 h-3 {i < Math.floor(seller.rating) ? 'text-[color:var(--accent-emphasis)]' : 'text-[color:var(--surface-emphasis)]'}" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            {/each}
                          </div>
                          <span class="text-xs text-[color:var(--text-secondary)] ml-1">{seller.rating.toFixed(1)}</span>
                        </div>
                      {/if}
                      
                      <!-- View Profile Button -->
                      <div class="w-full">
                        <div class="px-3 py-1.5 bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-[color:var(--primary-fg)] text-xs font-medium rounded-lg shadow-sm transition-colors">
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
