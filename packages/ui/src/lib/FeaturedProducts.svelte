<script lang="ts">
  import ProductCard from './ProductCard.svelte';
  import Button from './Button.svelte';
  import { ProductCardSkeleton } from './skeleton/index.js';
  import type { Product } from './types/index.js';

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
    condition_new: string;
    condition_likeNew: string;
    condition_good: string;
    condition_fair: string;
  }

  interface Props {
    products: Product[];
    errors?: { products?: string };
    loading?: boolean;
    onProductClick: (product: Product) => void;
    onFavorite: (product: Product) => void;
    onBrowseAll?: () => void;
    onSellClick?: () => void;
    formatPrice?: (price: number) => string;
    translations: Translations;
  }

  let { 
    products, 
    errors, 
    loading = false, 
    onProductClick, 
    onFavorite, 
    onBrowseAll,
    onSellClick,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
    translations
  }: Props = $props();
</script>

<!-- Product Grid -->
<div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
  
  <!-- Loading State -->
  {#if loading}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3 lg:gap-4">
      {#each Array(10) as _}
        <ProductCardSkeleton />
      {/each}
    </div>
  <!-- Featured Products Grid - Mobile-First Responsive -->
  {:else if products.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3 lg:gap-4">
      {#each products as product, index}
        <ProductCard 
          {product}
          onclick={() => onProductClick(product)}
          onFavorite={() => onFavorite(product)}
          favorited={false}
          priority={index < 6}
          translations={{
            size: translations.product_size,
            newSeller: translations.trending_newSeller,
            unknownSeller: translations.seller_unknown,
            currency: translations.common_currency,
            addToFavorites: translations.product_addToFavorites,
            new: translations.condition_new,
            likeNew: translations.condition_likeNew,
            good: translations.condition_good,
            fair: translations.condition_fair,
            formatPrice: formatPrice,
            categoryTranslation: translations.categoryTranslation
          }}
        />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  {#if products.length > 0}
    <div class="text-center mt-8">
      <Button 
        variant="ghost" 
        size="lg" 
        class="text-gray-600"
        onclick={onBrowseAll}
      >
        {translations.home_browseAll}
      </Button>
    </div>
  {/if}
  
  <!-- Error Messages -->
  {#if errors?.products}
    <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-800">
        {errors.products}
      </p>
    </div>
  {/if}
</div>