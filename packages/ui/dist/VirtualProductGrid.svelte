<script lang="ts">
  import { browser } from '$app/environment';
  import ProductCard from './ProductCard.svelte';
  import { ProductCardSkeleton } from './skeleton/index.js';
  // Simple throttle implementation
  function throttle(fn: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    brand?: string;
    size?: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    category: string;
    sellerId: string;
    sellerName: string;
    sellerRating?: number;
    sellerAvatar?: string;
    createdAt: string;
    location: string;
  }

  interface Props {
    items: Product[];
    itemHeight?: number;
    containerHeight?: number;
    gap?: number;
    itemsPerRow?: number;
    onProductClick?: (product: Product) => void;
    onFavorite?: (product: Product) => void;
    class?: string;
    loading?: boolean;
    translations?: Record<string, any>;
  }

  let {
    items,
    itemHeight = 300,
    containerHeight = 600,
    gap = 16,
    itemsPerRow = 2, // Default for mobile
    onProductClick,
    onFavorite,
    class: className = '',
    loading = false,
    translations = {}
  }: Props = $props();

  let containerElement: HTMLDivElement;
  let scrollTop = $state(0);
  let containerWidth = $state(0);
  let mounted = $state(false);
  
  // Simple performance monitoring (optional)
  const perf = null;

  // Calculate responsive items per row
  const responsiveItemsPerRow = $derived(() => {
    if (!mounted) return itemsPerRow;
    
    const width = containerWidth || (browser ? window.innerWidth : 768);
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 4; // lg
    if (width >= 768) return 3;  // md
    if (width >= 640) return 2;  // sm
    return 2; // mobile
  });

  // Calculate visible range
  const visibleRange = $derived(() => {
    const itemsInRow = responsiveItemsPerRow();
    const totalRows = Math.ceil(items.length / itemsInRow);
    const rowHeight = itemHeight + gap;
    
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      totalRows - 1,
      startRow + Math.ceil(containerHeight / rowHeight) + 1 // Buffer
    );

    const startIndex = startRow * itemsInRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * itemsInRow - 1);

    return {
      startIndex: Math.max(0, startIndex),
      endIndex: Math.max(0, endIndex),
      startRow,
      endRow,
      totalRows,
      rowHeight
    };
  });

  // Get visible items
  const visibleItems = $derived(() => {
    const { startIndex, endIndex } = visibleRange();
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index
    }));
  });

  // Calculate total height
  const totalHeight = $derived(() => {
    const { totalRows, rowHeight } = visibleRange();
    return totalRows * rowHeight;
  });

  // Calculate offset for visible items
  const offsetY = $derived(() => {
    const { startRow, rowHeight } = visibleRange();
    return startRow * rowHeight;
  });

  // Throttled scroll handler for better performance
  const handleScroll = throttle((event: Event) => {
    const target = event.target as HTMLDivElement;
    perf?.startTiming('virtual-scroll');
    scrollTop = target.scrollTop;
    perf?.endTiming('virtual-scroll');
  }, 16); // ~60fps

  function handleResize() {
    if (containerElement) {
      containerWidth = containerElement.clientWidth;
    }
  }

  // Use $effect for lifecycle management
  $effect(() => {
    if (!browser || !containerElement) return;
    
    mounted = true;
    handleResize();
    
    // Setup resize observer
    const resizeObserver = new ResizeObserver(throttle(handleResize, 100));
    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Grid positioning for items
  function getItemPosition(index: number) {
    const itemsInRow = responsiveItemsPerRow();
    const row = Math.floor(index / itemsInRow);
    const col = index % itemsInRow;
    const itemWidth = (containerWidth - (itemsInRow - 1) * gap) / itemsInRow;
    
    return {
      x: col * (itemWidth + gap),
      y: row * (itemHeight + gap),
      width: itemWidth
    };
  }
</script>

<div 
  bind:this={containerElement}
  class="virtual-grid-container {className}"
  style="height: {containerHeight}px; overflow-y: auto;"
  onscroll={handleScroll}
>
  <!-- Total height spacer -->
  <div style="height: {totalHeight}px; position: relative;">
    
    <!-- Loading state -->
    {#if loading}
      <div class="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {#each Array(20) as _}
          <ProductCardSkeleton />
        {/each}
      </div>
    
    <!-- Visible items -->
    {:else if visibleItems.length > 0}
      <div 
        class="absolute w-full"
        style="transform: translateY({offsetY}px);"
      >
        {#each visibleItems as item (item.id)}
          {@const position = getItemPosition(item.virtualIndex % responsiveItemsPerRow())}
          <div
            class="absolute"
            style="
              left: {position.x}px;
              top: {(Math.floor(item.virtualIndex / responsiveItemsPerRow()) - visibleRange().startRow) * (itemHeight + gap)}px;
              width: {position.width}px;
              height: {itemHeight}px;
            "
          >
            <ProductCard
              product={item}
              onclick={() => onProductClick?.(item)}
              onFavorite={() => onFavorite?.(item)}
              {translations}
              class="h-full"
            />
          </div>
        {/each}
      </div>
    
    <!-- Empty state -->
    {:else}
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p class="text-gray-600">Try adjusting your search or filters</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .virtual-grid-container {
    position: relative;
    contain: strict;
    overflow-anchor: none; /* Prevent scroll anchoring */
  }

  /* Smooth scrolling */
  .virtual-grid-container {
    scroll-behavior: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .virtual-grid-container::-webkit-scrollbar {
    width: 6px;
  }

  .virtual-grid-container::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  .virtual-grid-container::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .virtual-grid-container::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  /* Performance optimizations */
  .virtual-grid-container * {
    contain: layout style paint;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .virtual-grid-container {
      scroll-behavior: auto;
    }
  }
</style>