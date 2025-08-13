<script lang="ts">
  import { Avatar } from '@repo/ui';

  interface Props {
    promotedProducts: any[];
    sellers: any[];
    onSellerSelect: (seller: any) => void;
    onSellerClick: (seller: any) => void;
  }

  let { promotedProducts, sellers, onSellerSelect, onSellerClick }: Props = $props();
</script>

<!-- Promoted Listings / Highlights -->
<div class="bg-white border-b border-gray-200">
  <div class="px-4 sm:px-6 lg:px-8 py-4">
    <div class="overflow-x-auto scrollbar-hide">
      <div class="flex space-x-3">
        <!-- Your Story -->
        <a 
          href="/sell"
          class="relative flex-shrink-0 group"
        >
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="block text-xs text-center mt-1 font-medium">Sell</span>
        </a>

        <!-- Promoted Products -->
        {#if promotedProducts && promotedProducts.length > 0}
          {#each promotedProducts as product}
            <button 
              onclick={() => onSellerSelect({
                id: product.seller_id || `seller-${product.id}`,
                name: product.seller_name || 'Premium Seller',
                avatar: null,
                premium: true,
                rating: 4.8,
                itemCount: 15,
                followers: 250,
                description: 'Premium seller with exclusive items'
              })}
              class="relative flex-shrink-0 group"
            >
              <div class="relative">
                <!-- Promoted badge -->
                <div class="absolute top-0 right-0 z-10 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <!-- Product image -->
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 group-hover:scale-105 transition-transform">
                  <img 
                    src={product.images[0]?.image_url || '/placeholder-product.svg'} 
                    alt={product.title}
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span class="block text-xs text-center mt-1 font-medium truncate max-w-[64px] sm:max-w-[80px]">
                ${product.price}
              </span>
            </button>
          {/each}
        {/if}

        <!-- Top Sellers (if no promoted products) -->
        {#if (!promotedProducts || promotedProducts.length === 0) && sellers.length > 0}
          {#each sellers as seller}
            <div class="relative flex-shrink-0">
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