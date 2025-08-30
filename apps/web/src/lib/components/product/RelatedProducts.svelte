<script lang="ts">
  import { getProductUrl } from '$lib/utils/seo-urls';
  import { formatPrice } from '$lib/utils/price';

  interface Props {
    similarProducts?: any[];
    sellerProducts?: any[];
    sellerName: string;
    sellerUsername?: string;
    sellerId: string;
  }

  let { 
    similarProducts = [], 
    sellerProducts = [], 
    sellerName, 
    sellerUsername,
    sellerId 
  }: Props = $props();
</script>

<!-- Similar Products - Instagram Stories Style -->
{#if similarProducts.length > 0}
  <div class="bg-white mt-1 py-4 border-t border-gray-100">
    <div class="px-3 mb-3">
      <h3 class="font-semibold text-sm text-gray-900">You might also like</h3>
    </div>
    <div class="flex gap-4 overflow-x-auto scrollbar-hide px-3">
      {#each similarProducts.slice(0, 10) as product}
        <a href={getProductUrl(product)} class="shrink-0">
          <div class="w-20 h-20 rounded-2xl border-2 border-gray-200 overflow-hidden mb-2">
            <img 
              src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
              alt={product.title}
              class="w-full h-full object-cover"
            />
          </div>
          <p class="text-xs text-center text-gray-600 font-medium w-20 truncate">{formatPrice(product.price)}</p>
        </a>
      {/each}
    </div>
  </div>
{/if}

<!-- More from Seller - Instagram Stories Style -->
{#if sellerProducts.length > 0}
  <div class="bg-white mt-1 py-4 border-t border-gray-100">
    <div class="px-3 mb-3">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-sm text-gray-900">More from {sellerName}</h3>
        <a href="/profile/{sellerUsername || sellerId}" class="text-xs text-blue-600 font-medium">
          View all
        </a>
      </div>
    </div>
    <div class="flex gap-4 overflow-x-auto scrollbar-hide px-3">
      {#each sellerProducts.slice(0, 10) as product}
        <a href={getProductUrl(product)} class="shrink-0">
          <div class="w-20 h-20 rounded-2xl border-2 border-gray-200 overflow-hidden mb-2">
            <img 
              src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
              alt={product.title}
              class="w-full h-full object-cover"
            />
          </div>
          <p class="text-xs text-center text-gray-600 font-medium w-20 truncate">{formatPrice(product.price)}</p>
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>