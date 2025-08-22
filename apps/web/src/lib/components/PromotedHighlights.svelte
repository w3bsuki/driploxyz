<script lang="ts">
  import { Avatar, ProductHighlight } from '@repo/ui';
  import * as i18n from '@repo/i18n';

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
    <!-- Promoted header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-900 uppercase tracking-wide">Promoted</span>
        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Featured</span>
      </div>
      <div class="flex items-center gap-1 text-gray-400">
        <span class="text-xs">Scroll</span>
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
              onProductClick={() => onSellerSelect({
                id: product.seller_id || `seller-${product.id}`,
                name: product.seller_name || i18n.seller_premiumSeller(),
                avatar: null,
                premium: true,
                rating: 4.8,
                itemCount: 15,
                followers: 250,
                description: i18n.seller_premiumSellerDescription()
              })}
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
