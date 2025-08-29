<script lang="ts">
  import type { Product } from './types';
  
  interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  }
  
  interface Seller {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    rating?: number;
    premium?: boolean;
  }
  
  interface Props {
    categories?: Category[];
    products?: Product[];
    sellers?: Seller[];
    onCategorySelect?: (category: Category) => void;
    onProductClick?: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onClose?: () => void;
    translations?: {
      newItems?: string;
      topSellers?: string;
      categories?: string;
      viewAll?: string;
      new?: string;
    };
    formatPrice?: (price: number, currency?: string) => string;
  }
  
  let {
    categories = [],
    products = [],
    sellers = [],
    onCategorySelect,
    onProductClick,
    onSellerClick,
    onClose,
    translations = {},
    formatPrice = (price: number) => `$${price}`
  }: Props = $props();
  
  const t = {
    newItems: translations.newItems || 'New Items',
    topSellers: translations.topSellers || 'Top Sellers',
    categories: translations.categories || 'Categories',
    viewAll: translations.viewAll || 'View All',
    new: translations.new || 'NEW'
  };
</script>

<div class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/60 overflow-hidden z-50 max-w-4xl mx-auto">
  <!-- Header with Close -->
  <div class="flex items-center justify-between p-4 border-b border-gray-100">
    <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
      <span class="text-xl">🛍️</span>
      Discover Amazing Finds
    </h2>
    <button 
      onclick={onClose}
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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

  <!-- Categories Section - Enhanced -->
  {#if categories.length > 0}
    <div class="p-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        Shop by Category
      </h3>
      
      <div class="grid grid-cols-4 gap-3">
        {#each categories as category}
          <button
            onclick={() => onCategorySelect?.(category)}
            class="p-4 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:border-blue-200 border border-gray-200 transition-all text-center group hover:shadow-md"
          >
            {#if category.icon}
              <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</div>
            {/if}
            <p class="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              {category.name}
            </p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- New Items Section -->
  {#if products.length > 0}
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          {t.newItems}
        </h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {products.length}
        </span>
      </div>
      
      <div class="grid grid-cols-3 gap-3">
        {#each products.slice(0, 3) as product}
          <button
            onclick={() => onProductClick?.(product)}
            class="text-left group"
          >
            <div class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
              {#if product.images?.[0]}
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              {/if}
              <div class="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                {t.new}
              </div>
            </div>
            <p class="text-xs font-medium text-gray-900 truncate mb-1">{product.title}</p>
            <p class="text-xs font-semibold text-black">{formatPrice(product.price, product.currency)}</p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Top Sellers Section -->
  {#if sellers.length > 0}
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          {t.topSellers}
        </h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {sellers.length}
        </span>
      </div>
      
      <div class="grid grid-cols-3 gap-3">
        {#each sellers.slice(0, 3) as seller}
          <button
            onclick={() => onSellerClick?.(seller)}
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
            {#if seller.rating}
              <div class="flex items-center justify-center gap-1 mt-1">
                <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-xs text-gray-600">{seller.rating.toFixed(1)}</span>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Clean transitions */
  button {
    transition: all 0.2s ease;
  }
</style>