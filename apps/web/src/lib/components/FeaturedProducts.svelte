<script lang="ts">
  import { ProductCard, Button } from '@repo/ui';
  import { goto } from '$app/navigation';

  interface Props {
    products: any[];
    errors?: { products?: string };
    onProductClick: (product: any) => void;
    onFavorite: (product: any) => void;
  }

  let { products, errors, onProductClick, onFavorite }: Props = $props();
</script>

<!-- Product Grid -->
<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  
  <!-- Featured Products Grid -->
  {#if products.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {#each products as product}
        <ProductCard 
          {product}
          onclick={() => onProductClick(product)}
          onFavorite={() => onFavorite(product)}
          favorited={false}
        />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by listing your first item!</p>
      <div class="mt-6">
        <Button 
          variant="primary" 
          onclick={() => goto('/sell')}
        >
          List an item
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
        Browse all items
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