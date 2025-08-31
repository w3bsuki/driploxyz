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
    sectionTitle = 'Featured Products',
    favoritesState
  }: Props = $props();
  
  // Derived states
  const hasProducts = $derived(products.length > 0);
  const hasErrors = $derived(!!errors?.products);
  const gridId = $derived(`product-grid-${Math.random().toString(36).substr(2, 9)}`);
</script>

<!-- Product Grid Section -->
<section 
  class="px-4 sm:px-6 lg:px-8 py-4"
  aria-label={sectionTitle}
  role="region"
>
  <!-- Section Header -->
  <div class="mb-4">
    <h2 class="text-lg font-semibold text-gray-900">{sectionTitle}</h2>
  </div>
  
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
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
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
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{translations.empty_noProducts}</h3>
      <p class="mt-1 text-sm text-gray-500">{translations.empty_startBrowsing}</p>
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
        class="text-gray-600"
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
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md"
      role="alert"
      aria-live="assertive"
    >
      <p class="text-sm text-red-800">
        <span class="sr-only">Error: </span>
        {errors.products}
      </p>
    </div>
  {/if}
</section>