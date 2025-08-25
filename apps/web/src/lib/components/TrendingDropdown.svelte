<script lang="ts">
  import type { Product } from '@repo/ui/types';
  
  interface Props {
    trendingProducts: Product[];
    topSellers?: any[];
    onProductClick: (product: Product) => void;
    onSellerClick?: (seller: any) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice: (price: number) => string;
  }
  
  let { 
    trendingProducts, 
    topSellers = [],
    onProductClick,
    onSellerClick = () => {},
    onFilterClick = () => {},
    formatPrice
  }: Props = $props();
  
  const quickFilters = [
    { label: 'Под 20лв', value: 'price_under_20' },
    { label: 'Нови', value: 'new_today' },
    { label: 'S', value: 'size_s' },
    { label: 'M', value: 'size_m' }
  ];
</script>

<div class="w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
  <!-- Trending Products -->
  <div class="p-3 border-b border-gray-100">
    <div class="flex items-center gap-2 mb-3">
      <span>🔥</span>
      <h3 class="font-semibold text-sm">Популярни сега</h3>
    </div>
    <div class="grid grid-cols-4 gap-2">
      {#each trendingProducts.slice(0, 4) as product}
        <button
          onclick={() => onProductClick(product)}
          class="flex flex-col"
        >
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1">
            {#if product.images?.[0]}
              <img 
                src={product.images[0]} 
                alt={product.title}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full bg-gray-200"></div>
            {/if}
          </div>
          <p class="text-xs truncate">{product.title}</p>
          <p class="text-sm font-bold">{formatPrice(product.price)}</p>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Quick Filters -->
  <div class="p-3 border-b border-gray-100">
    <div class="flex gap-2 flex-wrap">
      {#each quickFilters as filter}
        <button
          onclick={() => onFilterClick(filter.value)}
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium"
        >
          {filter.label}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="p-3">
      <div class="flex items-center gap-2 mb-2">
        <span>⭐</span>
        <h3 class="font-semibold text-sm">Топ продавачи</h3>
      </div>
      <div class="grid grid-cols-2 gap-2">
        {#each topSellers.slice(0, 4) as seller}
          <button
            onclick={() => onSellerClick(seller)}
            class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
          >
            <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {#if seller.avatar}
                <img src={seller.avatar} alt={seller.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {seller.name?.[0]?.toUpperCase()}
                </div>
              {/if}
            </div>
            <div class="text-left flex-1 min-w-0">
              <p class="text-xs font-medium truncate">{seller.name}</p>
              <p class="text-[10px] text-gray-500">{seller.itemCount || 0} артикула</p>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>