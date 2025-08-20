<script lang="ts">
  import { ProductCard, Button, ProductCardSkeleton } from '@repo/ui';
  import { goto } from '$app/navigation';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';

  interface Props {
    products: any[];
    errors?: { products?: string };
    loading?: boolean;
    onProductClick: (product: any) => void;
    onFavorite: (product: any) => void;
  }

  let { products, errors, loading = false, onProductClick, onFavorite }: Props = $props();
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
      {#each products as product}
        <ProductCard 
          {product}
          onclick={() => onProductClick(product)}
          onFavorite={() => onFavorite(product)}
          favorited={false}
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
            formatPrice: (price: number) => formatPrice(price)
          }}
        />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{i18n.empty_noProducts()}</h3>
      <p class="mt-1 text-sm text-gray-500">{i18n.empty_startBrowsing()}</p>
      <div class="mt-6">
        <Button 
          variant="primary" 
          onclick={() => goto('/sell')}
        >
          {i18n.nav_sell()}
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
        onclick={() => goto('/search')}
      >
        {i18n.home_browseAll()}
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