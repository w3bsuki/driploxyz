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

<div class="w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
  <!-- Trending Products -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-lg">🔥</span>
      <h3 class="font-semibold text-sm text-gray-900">{translations.trendingNow}</h3>
    </div>
    <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
      {#each trendingProducts.slice(0, 8) as product}
        <button
          onclick={() => onProductClick(product)}
          class="flex flex-col group shrink-0 w-24"
        >
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow relative">
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
            {/if}
          </div>
          <p class="text-xs truncate text-gray-700 group-hover:text-gray-900 mb-1 w-full">{product.title}</p>
          <p class="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Quick Filters -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {#each quickFilters as filter}
        <button
          onclick={() => onFilterClick(filter.value)}
          class="{getFilterButtonClasses(filter.style)} shrink-0"
        >
          {filter.label}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="p-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">⭐</span>
        <h3 class="font-semibold text-sm text-gray-900">{translations.topSellers}</h3>
      </div>
      <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {#each topSellers.slice(0, 8) as seller}
          <button
            onclick={() => onSellerClick(seller)}
            class="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group shrink-0 w-20"
          >
            <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {#if seller.avatar}
                <img src={seller.avatar} alt={seller.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {(seller.name || seller.username || 'U')?.[0]?.toUpperCase()}
                </div>
              {/if}
            </div>
            <div class="text-center w-full">
              <p class="text-xs font-medium truncate text-gray-900 group-hover:text-black w-full">{seller.name || seller.username}</p>
              <p class="text-[10px] text-gray-500">{seller.itemCount || 0}</p>
            </div>
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