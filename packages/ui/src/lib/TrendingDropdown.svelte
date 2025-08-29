<script lang="ts">
  import type { Product } from './types';
  
  interface Seller {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    itemCount: number;
  }

  interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
  }
  
  interface Props {
    trendingProducts: Product[];
    topSellers?: Seller[];
    quickFilters?: QuickFilter[];
    onProductClick: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice: (price: number) => string;
    translations: {
      trendingNow: string;
      topSellers: string;
      items: string;
    };
  }
  
  let { 
    trendingProducts, 
    topSellers = [],
    quickFilters = [
      { label: 'Under $20', value: 'price_under_20', style: 'price' },
      { label: 'New Today', value: 'new_today', style: 'new' },
      { label: 'Size S', value: 'size_s', style: 'size' },
      { label: 'Size M', value: 'size_m', style: 'size' }
    ],
    onProductClick,
    onSellerClick = () => {},
    onFilterClick = () => {},
    formatPrice,
    translations
  }: Props = $props();

  function getFilterButtonClasses(style: string = 'default'): string {
    const baseClasses = 'px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105';
    
    switch(style) {
      case 'price':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'condition':
        return `${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`;
      case 'brand':
      case 'size':
        return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    }
  }
</script>

<div class="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/60 overflow-hidden max-w-4xl mx-auto">
  <!-- Header with Close -->
  <div class="flex items-center justify-between p-4 border-b border-gray-100">
    <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
      <span class="text-xl">🛍️</span>
      Discover Amazing Finds
    </h2>
  </div>

  <!-- Quick Actions Row -->
  <div class="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
    <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide">
      <button class="shrink-0 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
        <span>🔥</span>
        <span>Hot Deals</span>
      </button>
      <button class="shrink-0 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
        <span>✨</span>
        <span>New Today</span>
      </button>
      <button class="shrink-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
        <span>💎</span>
        <span>Designer</span>
      </button>
      <button class="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
        <span>💰</span>
        <span>Under $25</span>
      </button>
      <button class="shrink-0 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
        <span>🚚</span>
        <span>Free Ship</span>
      </button>
    </div>
  </div>

  <!-- Trending Products -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        {translations.trendingNow}
      </h3>
      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {trendingProducts.length}
      </span>
    </div>
    <div class="grid grid-cols-3 gap-3">
      {#each trendingProducts.slice(0, 3) as product}
        <button
          onclick={() => onProductClick(product)}
          class="text-left group"
        >
          <div class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
            {#if product.images?.[0]}
              <img 
                src={product.images[0]} 
                alt={product.title}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            {:else}
              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}
            
            <!-- Promoted Crown Badge -->
            {#if product.is_promoted}
              <div class="absolute top-1 right-1 bg-yellow-400 rounded-full p-0.5 shadow-sm border border-yellow-500">
                <span class="text-[10px] leading-none">👑</span>
              </div>
            {:else}
              <div class="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                🔥
              </div>
            {/if}
          </div>
          <p class="text-xs font-medium text-gray-900 truncate mb-1">{product.title}</p>
          <p class="text-xs font-semibold text-black">{formatPrice(product.price)}</p>
        </button>
      {/each}
    </div>
  </div>
  
  
  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          {translations.topSellers}
        </h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {topSellers.length}
        </span>
      </div>
      
      <div class="grid grid-cols-3 gap-3">
        {#each topSellers.slice(0, 3) as seller}
          <button
            onclick={() => onSellerClick(seller)}
            class="text-center group"
          >
            <div class="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden">
              {#if seller.avatar}
                <img 
                  src={seller.avatar} 
                  alt={seller.name || seller.username}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                  {(seller.name || seller.username || '?')[0].toUpperCase()}
                </div>
              {/if}
            </div>
            <p class="text-xs font-medium text-gray-900 truncate">
              {seller.name || seller.username}
            </p>
            <p class="text-xs text-gray-600">{seller.itemCount || 0} {translations.items}</p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Add scrollbar hiding styles */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>