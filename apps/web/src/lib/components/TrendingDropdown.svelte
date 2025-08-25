<script lang="ts">
  import type { Product } from '@repo/ui/types';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    trendingProducts: Product[];
    recentPriceDrops?: Product[];
    topSellers?: any[];
    onProductClick: (product: Product) => void;
    onSellerClick?: (seller: any) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice: (price: number) => string;
  }
  
  let { 
    trendingProducts, 
    recentPriceDrops = [],
    topSellers = [],
    onProductClick,
    onSellerClick = () => {},
    onFilterClick = () => {},
    formatPrice
  }: Props = $props();
  
  const quickFilters = [
    { label: 'Под 20лв', value: 'price_under_20' },
    { label: 'Нови днес', value: 'new_today' },
    { label: 'Намалени', value: 'on_sale' },
    { label: 'Размер S', value: 'size_s' },
    { label: 'Размер M', value: 'size_m' }
  ];
</script>

<div class="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
  <!-- Trending Products -->
  {#if trendingProducts.length > 0}
    <div class="border-b border-gray-100">
      <div class="px-4 py-3 flex items-center gap-2">
        <span class="text-red-500">🔥</span>
        <h3 class="font-semibold text-sm text-gray-900">Популярни сега</h3>
      </div>
      <div class="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {#each trendingProducts.slice(0, 6) as product}
          <button
            onclick={() => onProductClick(product)}
            class="flex-shrink-0 group"
          >
            <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mb-2">
              {#if product.images?.[0]}
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
            </div>
            <p class="text-xs text-gray-600 truncate w-24">{product.title}</p>
            <p class="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Price Drops -->
  {#if recentPriceDrops.length > 0}
    <div class="border-b border-gray-100">
      <div class="px-4 py-3 flex items-center gap-2">
        <span class="text-green-500">💰</span>
        <h3 class="font-semibold text-sm text-gray-900">Намалени цени</h3>
      </div>
      <div class="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {#each recentPriceDrops.slice(0, 4) as product}
          <button
            onclick={() => onProductClick(product)}
            class="flex-shrink-0 group"
          >
            <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
              {#if product.images?.[0]}
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              {/if}
              <span class="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                -20%
              </span>
            </div>
            <p class="text-xs text-gray-600 truncate w-24">{product.title}</p>
            <div class="flex items-center gap-1">
              <p class="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
              <p class="text-xs text-gray-400 line-through">{formatPrice(product.price * 1.2)}</p>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="border-b border-gray-100">
      <div class="px-4 py-3 flex items-center gap-2">
        <span class="text-yellow-500">⭐</span>
        <h3 class="font-semibold text-sm text-gray-900">Топ продавачи</h3>
      </div>
      <div class="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {#each topSellers.slice(0, 5) as seller}
          <button
            onclick={() => onSellerClick(seller)}
            class="flex-shrink-0 flex flex-col items-center group"
          >
            <div class="w-14 h-14 rounded-full bg-gray-200 overflow-hidden mb-1 ring-2 ring-transparent group-hover:ring-gray-300 transition-all">
              {#if seller.avatar}
                <img src={seller.avatar} alt={seller.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                  {seller.name?.[0]?.toUpperCase()}
                </div>
              {/if}
            </div>
            <p class="text-xs font-medium text-gray-900">{seller.name}</p>
            <p class="text-[10px] text-gray-500">{seller.itemCount} артикула</p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Quick Filters -->
  <div class="px-4 py-3">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      {#each quickFilters as filter}
        <button
          onclick={() => onFilterClick(filter.value)}
          class="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
        >
          {filter.label}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>