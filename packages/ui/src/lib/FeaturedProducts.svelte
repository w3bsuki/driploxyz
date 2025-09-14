<script lang="ts">
  import ProductCard from './ProductCard.svelte';
  import Button from './Button.svelte';
  import { ProductCardSkeleton } from './skeleton/index';
  import type { Product } from './types/index';

  interface Translations {
    empty_noProducts: string;
    empty_startBrowsing: string;
    nav_sell: string;
    home_browseAll: string;
    home_itemCount: string;
    home_updatedMomentsAgo: string;
    product_size: string;
    trending_newSeller: string;
    seller_unknown: string;
    common_currency: string;
    product_addToFavorites: string;
    condition_brandNewWithTags?: string;
    condition_newWithoutTags?: string;
    condition_new: string;
    condition_likeNew: string;
    condition_good: string;
    condition_worn?: string;
    condition_fair: string;
    categoryTranslation?: (category: string) => string;
  }

  interface Props {
    products: Product[];
    errors?: { products?: string };
    loading?: boolean;
    onProductClick: (product: Product) => void;
    onFavorite: (productId: string) => void;
    onBrowseAll?: () => void;
    onSellClick?: () => void;
    formatPrice?: (price: number) => string;
    translations: Translations;
    sectionTitle?: string;
    favoritesState?: any;
    showQuickFilters?: boolean;
    onQuickFilter?: (condition: string) => void;
    showViewAllButton?: boolean;
    onViewAll?: () => void;
  }

  let { 
    products = [], 
    errors, 
    loading = false, 
    onProductClick, 
    onFavorite, 
    onBrowseAll,
    onSellClick,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
    translations,
    sectionTitle = 'Newest listings', // Will be overridden by parent with proper translation
    favoritesState,
    showQuickFilters = false,
    onQuickFilter,
    showViewAllButton = false,
    onViewAll
  }: Props = $props();
  
  // Derived states
  const hasProducts = $derived(products.length > 0);
  const hasErrors = $derived(!!errors?.products);
  const gridId = $derived(`product-grid-${Math.random().toString(36).substr(2, 9)}`);
</script>

<!-- Ultrathink: Product Grid Section with standardized spacing -->
<section
  class="px-2 sm:px-4 lg:px-6 py-3 mt-2 sm:mt-3"
  aria-label={sectionTitle}
>
  <!-- Enhanced Section Header - Mobile-First -->
  <div class="mb-4 sm:mb-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h2 class="text-base font-normal text-gray-900 tracking-tight leading-tight">
          {sectionTitle}
        </h2>
        {#if hasProducts}
          <p class="text-xs sm:text-sm text-gray-500 font-normal" style="letter-spacing: -0.01em;">
            {products.length} {translations.home_itemCount} • {translations.home_updatedMomentsAgo}
          </p>
        {/if}
      </div>
      
      <!-- Ultrathink: Clean ViewAll button - 44px touch target, pixel-perfect -->
      {#if showViewAllButton && hasProducts}
        <button
          onclick={onViewAll}
          class="min-h-[44px] px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900
                 rounded-lg border border-gray-200 hover:border-gray-300
                 font-medium text-sm transition-all duration-200
                 flex items-center gap-2 touch-manipulation
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>View All</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
  
  <!-- Quick Filter Pills - Mobile-First -->
  {#if showQuickFilters && hasProducts}
    <div class="mb-4 sm:mb-5">
      <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button
          onclick={() => onQuickFilter?.('new')}
          class="min-h-[36px] shrink-0 px-3 py-1.5 
                 rounded-full text-xs font-semibold transition-all duration-200
                 bg-[color:var(--success-subtle)] text-[color:var(--success-text)]
                 border border-[color:var(--success-border)]
                 hover:bg-[color:var(--success-muted)] active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--success)]/20"
        >
          <span class="mr-1" role="img" aria-hidden="true">✨</span>
          {translations.condition_new}
        </button>
        
        <button
          onclick={() => onQuickFilter?.('like-new')}
          class="min-h-[36px] shrink-0 px-3 py-1.5 
                 rounded-full text-xs font-semibold transition-all duration-200
                 bg-[color:var(--info-subtle)] text-[color:var(--info-text)]
                 border border-[color:var(--info-border)]
                 hover:bg-[color:var(--info-muted)] active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--info)]/20"
        >
          <span class="mr-1" role="img" aria-hidden="true">💎</span>
          {translations.condition_likeNew}
        </button>
        
        <button
          onclick={() => onQuickFilter?.('good')}
          class="min-h-[36px] shrink-0 px-3 py-1.5 
                 rounded-full text-xs font-semibold transition-all duration-200
                 bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]
                 border border-[color:var(--border-subtle)]
                 hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--text-primary)]
                 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20"
        >
          <span class="mr-1" role="img" aria-hidden="true">👍</span>
          {translations.condition_good}
        </button>
        
        <button
          onclick={() => onQuickFilter?.('fair')}
          class="min-h-[36px] shrink-0 px-3 py-1.5 
                 rounded-full text-xs font-semibold transition-all duration-200
                 bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]
                 border border-[color:var(--border-subtle)]
                 hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--text-primary)]
                 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20"
        >
          <span class="mr-1" role="img" aria-hidden="true">👌</span>
          {translations.condition_fair}
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Loading State -->
  {#if loading}
    <div 
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading products"
    >
      {#each Array(10) as _, i}
        <ProductCardSkeleton aria-label="Loading product {i + 1}" />
      {/each}
      <span class="sr-only">Loading products, please wait...</span>
    </div>
  <!-- Featured Products Grid - Mobile-First Responsive -->
  {:else if hasProducts}
    <div 
      id={gridId}
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
      role="list"
      aria-label="Product grid with {products.length} items"
    >
      {#each products as product, index}
        <article
          role="listitem"
          aria-setsize={products.length}
          aria-posinset={index + 1}
        >
          <ProductCard 
            {product}
            onclick={() => onProductClick(product)}
            onFavorite={() => onFavorite(product.id)}
            favorited={favoritesState?.favorites[product.id] || false}
            {favoritesState}
            priority={index < 6}
            {index}
            totalCount={products.length}
            translations={{
              size: translations.product_size,
              newSeller: translations.trending_newSeller,
              unknownSeller: translations.seller_unknown,
              currency: translations.common_currency,
              addToFavorites: translations.product_addToFavorites,
              brandNewWithTags: translations.condition_brandNewWithTags,
              newWithoutTags: translations.condition_newWithoutTags,
              new: translations.condition_new,
              likeNew: translations.condition_likeNew,
              good: translations.condition_good,
              worn: translations.condition_worn,
              fair: translations.condition_fair,
              formatPrice: formatPrice,
              categoryTranslation: translations.categoryTranslation
            }}
          />
        </article>
      {/each}
    </div>
  {:else}
    <div 
      class="text-center py-12"
      role="status"
      aria-label="No products available"
    >
      <svg class="mx-auto h-12 w-12 text-[color:var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{translations.empty_noProducts}</h3>
      <p class="mt-1 text-sm text-[color:var(--text-secondary)]">{translations.empty_startBrowsing}</p>
      <div class="mt-6">
        <Button 
          variant="primary" 
          onclick={onSellClick}
        >
          {translations.nav_sell}
        </Button>
      </div>
    </div>
  {/if}

  <!-- Load More -->
  {#if hasProducts}
    <nav class="text-center mt-4 sm:mt-6" aria-label="Load more products">
      <Button 
        variant="ghost" 
        size="lg" 
        class="text-[color:var(--text-secondary)]"
        onclick={onBrowseAll}
        aria-label="Browse all products"
      >
        {translations.home_browseAll}
      </Button>
    </nav>
  {/if}
  
  <!-- Error Messages -->
  {#if hasErrors}
    <div 
      class="mt-4 p-4 rounded-md bg-[color:var(--status-error-bg)] border border-[color:var(--status-error-border)]"
      role="alert"
      aria-live="assertive"
    >
      <p class="text-sm" style="color: var(--status-error-text)">
        <span class="sr-only">Error: </span>
        {errors.products}
      </p>
    </div>
  {/if}
</section>
