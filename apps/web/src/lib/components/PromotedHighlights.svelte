<script lang="ts">
  import { Avatar } from '@repo/ui';
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
  <div class="px-4 sm:px-6 lg:px-8 pt-4 pb-6">
    <div class="overflow-x-auto scrollbar-hide">
      <div class="flex space-x-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <!-- Promoted Products -->
        {#if promotedProducts && promotedProducts.length > 0}
          {#each promotedProducts as product}
            <div class="relative shrink-0 group pt-3">
              <button 
                onclick={() => onSellerSelect({
                  id: product.seller_id || `seller-${product.id}`,
                  name: product.seller_name || i18n.seller_premiumSeller(),
                  avatar: null,
                  premium: true,
                  rating: 4.8,
                  itemCount: 15,
                  followers: 250,
                  description: i18n.seller_premiumSellerDescription()
                })}
                class="block"
              >
              <!-- Glass morphism container with subtle border for promoted items -->
              <div class="bg-white rounded-2xl border border-gray-900/20 p-1 shadow-md backdrop-blur-xl group-hover:scale-105 transition-transform ring-1 ring-gray-900/5">
                <!-- Premium badge - refined dark design -->
                <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md tracking-wide">
                  {i18n.trending_promoted()}
                </div>
                <!-- Inner glass frame -->
                <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                  <div 
                    aria-hidden="true"
                    class="absolute inset-x-0 top-0 h-32 rounded-[inherit]"
                    style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
                  />
                  <!-- Product image -->
                  <div class="w-32 h-32 sm:w-40 sm:h-40 relative">
                    <img 
                      src={product.images[0]?.image_url || '/placeholder-product.svg'} 
                      alt={product.title}
                      class="w-full h-full object-cover"
                    />
                    <!-- Seller avatar -->
                    <div class="absolute bottom-2 left-2 w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                        {product.seller_name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    </div>
                    <!-- Price badge -->
                    <div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 shadow-xs">
                      {i18n.common_currency()}{product.price}
                    </div>
                  </div>
                </div>
              </div>
            </button>
            </div>
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