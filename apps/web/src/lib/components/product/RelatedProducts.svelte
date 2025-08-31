<script lang="ts">
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

<!-- Related Products -->
{#if similarProducts.length > 0}
  <div class="border-t border-gray-200 pt-4 px-4 mb-4">
    <h3 class="text-sm font-medium text-gray-900 mb-3">You might also like</h3>
    <div class="flex gap-2 overflow-x-auto">
      {#each similarProducts.slice(0, 8) as product}
        <a href="/product/{product.id}" class="flex-shrink-0">
          <div class="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden mb-1 bg-gray-50">
            <img 
              src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
              alt={product.title}
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <p class="text-xs text-gray-900 text-center w-20 truncate">{formatPrice(product.price)}</p>
        </a>
      {/each}
    </div>
  </div>
{/if}

<!-- More from Seller -->
{#if sellerProducts.length > 0}
  <div class="border-t border-gray-200 pt-4 px-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-900">More from {sellerName}</h3>
      <a href="/profile/{sellerUsername || sellerId}" class="text-xs text-blue-600 hover:text-blue-700">
        View all
      </a>
    </div>
    <div class="flex gap-2 overflow-x-auto">
      {#each sellerProducts.slice(0, 8) as product}
        <a href="/product/{product.id}" class="flex-shrink-0">
          <div class="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden mb-1 bg-gray-50">
            <img 
              src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
              alt={product.title}
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <p class="text-xs text-gray-900 text-center w-20 truncate">{formatPrice(product.price)}</p>
        </a>
      {/each}
    </div>
  </div>
{/if}