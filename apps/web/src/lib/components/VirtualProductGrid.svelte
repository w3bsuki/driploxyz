<script lang="ts">
  import { onMount } from 'svelte';
  import { ProductCard } from '@repo/ui';
  import { VirtualList, throttle } from '$lib/utils/performance';
  
  interface Props {
    products: any[];
    onProductClick: (product: any) => void;
    onFavorite: (product: any) => void;
    itemHeight?: number;
    visibleCount?: number;
    translations?: Record<string, any>;
    class?: string;
  }
  
  let { 
    products, 
    onProductClick, 
    onFavorite,
    itemHeight = 300,
    visibleCount = 20,
    translations = {},
    class: className = ''
  }: Props = $props();
  
  let container: HTMLElement;
  let virtualList: VirtualList;
  let visibleItems = $state<any[]>([]);
  let offsetY = $state(0);
  let totalHeight = $state(0);
  
  // Throttled scroll handler for performance
  const handleScroll = throttle((event: Event) => {
    if (virtualList) {
      virtualList.onScroll(event);
      visibleItems = virtualList.getVisibleItems();
      offsetY = virtualList.getOffsetY();
    }
  }, 16); // ~60fps
  
  onMount(() => {
    if (container && products.length > visibleCount) {
      virtualList = new VirtualList(container, products, itemHeight, visibleCount);
      visibleItems = virtualList.getVisibleItems();
      totalHeight = virtualList.getTotalHeight();
      offsetY = 0;
    } else {
      // For smaller lists, show all items
      visibleItems = products;
      totalHeight = products.length * itemHeight;
    }
  });
  
  // Update when products change
  $effect(() => {
    if (virtualList && products) {
      virtualList = new VirtualList(container, products, itemHeight, visibleCount);
      visibleItems = virtualList.getVisibleItems();
      totalHeight = virtualList.getTotalHeight();
      offsetY = virtualList.getOffsetY();
    } else if (products) {
      visibleItems = products;
      totalHeight = products.length * itemHeight;
    }
  });
</script>

<div 
  bind:this={container}
  class="virtual-scroll-container overflow-auto {className}"
  onscroll={handleScroll}
  style="height: 100%; max-height: 80vh;"
>
  <!-- Virtual scroll content -->
  <div class="relative" style="height: {totalHeight}px;">
    <div 
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
      style="transform: translateY({offsetY}px);"
    >
      {#each visibleItems as product, index}
        <div style="height: {itemHeight}px;" class="flex flex-col">
          <ProductCard 
            {product}
            onclick={() => onProductClick(product)}
            onFavorite={() => onFavorite(product)}
            favorited={false}
            {translations}
            class="h-full"
          />
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Loading indicator for bottom of list -->
  {#if visibleItems.length === 0}
    <div class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {/if}
</div>

<style>
  .virtual-scroll-container {
    contain: layout style paint;
  }
  
  .virtual-scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .virtual-scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .virtual-scroll-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>