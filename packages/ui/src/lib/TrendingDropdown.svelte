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
    topSellers: Seller[];
    quickFilters?: QuickFilter[];
    onSellerClick: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    translations: {
      quickShop: string;
      shopByCondition: string;
      shopByPrice: string;
      quickAccess: string;
      topSellers: string;
      newWithTags: string;
      likeNew: string;
      good: string;
      fair: string;
      under25: string;
      cheapest: string;
      newest: string;
      premium: string;
      myFavorites: string;
      browseAll: string;
    };
  }
  
  let { 
    topSellers,
    quickFilters = [
      { label: 'Under $20', value: 'price_under_20', style: 'price' },
      { label: 'New Today', value: 'new_today', style: 'new' },
      { label: 'Size S', value: 'size_s', style: 'size' },
      { label: 'Size M', value: 'size_m', style: 'size' }
    ],
    onSellerClick,
    onFilterClick = () => {},
    translations
  }: Props = $props();


  function getFilterButtonClasses(style: string = 'default'): string {
    const baseClasses = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:scale-105';
    
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
        return `${baseClasses} bg-gray-100 text-gray-500 hover:bg-gray-200`;
    }
  }
</script>

<div class="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">

  <!-- Main Content -->
  <div class="p-6 space-y-6">
    
    <!-- Condition Filters -->
    <div class="space-y-3">
      <h3 class="text-xs uppercase tracking-wide font-semibold text-gray-500">{translations.shopByCondition}</h3>
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onclick={() => onFilterClick('condition=brand_new_with_tags')}
          class="shrink-0 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-800 hover:bg-green-100 hover:border-green-300 transition-colors min-h-[36px]"
        >
          🏷️ {translations.newWithTags}
        </button>
        <button 
          onclick={() => onFilterClick('condition=new_without_tags')}
          class="shrink-0 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-800 hover:bg-blue-100 hover:border-blue-300 transition-colors min-h-[36px]"
        >
          ✨ {translations.likeNew}
        </button>
        <button 
          onclick={() => onFilterClick('condition=like_new')}
          class="shrink-0 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-medium text-purple-800 hover:bg-purple-100 hover:border-purple-300 transition-colors min-h-[36px]"
        >
          👍 {translations.good}
        </button>
        <button 
          onclick={() => onFilterClick('condition=good')}
          class="shrink-0 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-medium text-orange-800 hover:bg-orange-100 hover:border-orange-300 transition-colors min-h-[36px]"
        >
          📦 {translations.fair}
        </button>
      </div>
    </div>

    <!-- Price & Sort Filters -->
    <div class="space-y-3">
      <h3 class="text-xs uppercase tracking-wide font-semibold text-gray-500">{translations.shopByPrice}</h3>
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onclick={() => onFilterClick('under25')}
          class="shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[36px]"
        >
          💰 {translations.under25}
        </button>
        <button 
          onclick={() => onFilterClick('price-low')}
          class="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[36px]"
        >
          💸 {translations.cheapest}
        </button>
        <button 
          onclick={() => onFilterClick('newest')}
          class="shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors min-h-[36px]"
        >
          📅 {translations.newest}
        </button>
        <button 
          onclick={() => onFilterClick('price-high')}
          class="shrink-0 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors min-h-[36px]"
        >
          🔥 {translations.premium}
        </button>
      </div>
    </div>

  </div>

  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="border-t border-gray-100 p-6 bg-gray-50">
      <div class="space-y-3">
        <h3 class="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
          <span class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          {translations.topSellers}
        </h3>
        <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {#each topSellers.slice(0, 6) as seller, index}
            <button
              onclick={() => onSellerClick(seller)}
              class="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 group min-w-[140px]"
            >
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                  {#if seller.avatar}
                    <img 
                      src={seller.avatar} 
                      alt={seller.name || seller.username}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                      {(seller.name || seller.username || '?')[0].toUpperCase()}
                    </div>
                  {/if}
                </div>
                {#if index < 3}
                  <div class="absolute -top-1 -right-1 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    <span class="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                {/if}
              </div>
              <div class="flex flex-col items-start min-w-0">
                <span class="text-sm font-semibold text-gray-900 truncate">
                  {(seller.name || seller.username || 'User').split(' ')[0]}
                </span>
                <span class="text-xs text-gray-500">
                  {seller.itemCount || 0} items
                </span>
              </div>
            </button>
          {/each}
        </div>
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