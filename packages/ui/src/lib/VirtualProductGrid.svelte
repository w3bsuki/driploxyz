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
    onEndReached?: () => void;
    endThreshold?: number;
    scrollParent?: 'self' | 'window';
    topOffset?: number;
    bottomOffset?: number;
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
    translations = {},
    onEndReached,
    endThreshold = 200,
    scrollParent = 'self',
    topOffset = 0,
    bottomOffset = 0
  }: Props = $props();

  let containerElement: HTMLDivElement;
  let scrollTop = $state(0);
  let containerWidth = $state(0);
  let mounted = $state(false);
  let viewportHeightState = $state(containerHeight);
  
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
    const vpHeight = scrollParent === 'self' ? containerHeight : viewportHeightState;

    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      totalRows - 1,
      startRow + Math.ceil(vpHeight / rowHeight) + 1 // Buffer
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
    perf?.startTiming('virtual-scroll');
    if (scrollParent === 'self') {
      const target = event.target as HTMLDivElement;
      scrollTop = target.scrollTop;
    } else {
      updateScrollTopFromWindow();
    }
    perf?.endTiming('virtual-scroll');
    maybeReachEnd();
  }, 16); // ~60fps

  function handleResize() {
    if (containerElement) {
      containerWidth = containerElement.clientWidth;
    }
    maybeReachEnd();
  }

  function maybeReachEnd() {
    if (!containerElement || !onEndReached) return;
    if (loading) return;
    if (scrollParent === 'self') {
      const nearEnd = containerElement.scrollTop + containerElement.clientHeight >= (containerElement.scrollHeight - endThreshold);
      if (nearEnd) onEndReached?.();
    } else {
      const rect = containerElement.getBoundingClientRect();
      const containerTop = rect.top + window.scrollY;
      const totalH = totalHeight();
      const viewportBottom = window.scrollY + window.innerHeight - bottomOffset;
      if (viewportBottom >= (containerTop + totalH - endThreshold)) onEndReached?.();
    }
  }

  function updateScrollTopFromWindow() {
    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const viewportStart = topOffset; // px from viewport top where content is visible
    const y = (viewportStart - rect.top);
    // scrollTop within container space
    scrollTop = Math.max(0, y);
  }

  // Use $effect for lifecycle management
  $effect(() => {
    if (!browser || !containerElement) return;
    mounted = true;
    handleResize();
    const resizeObserver = new ResizeObserver(throttle(handleResize, 100));
    resizeObserver.observe(containerElement);

    const onWindowScroll = throttle(() => {
      if (scrollParent === 'window') {
        // Compute viewport height minus offsets
        viewportHeightState = Math.max(0, window.innerHeight - topOffset - bottomOffset);
        updateScrollTopFromWindow();
        maybeReachEnd();
      }
    }, 16);

    if (scrollParent === 'window') {
      viewportHeightState = Math.max(0, window.innerHeight - topOffset - bottomOffset);
      updateScrollTopFromWindow();
      window.addEventListener('scroll', onWindowScroll, { passive: true });
      window.addEventListener('resize', onWindowScroll);
      window.addEventListener('orientationchange', onWindowScroll);
    }

    return () => {
      resizeObserver.disconnect();
      if (scrollParent === 'window') {
        window.removeEventListener('scroll', onWindowScroll as any);
        window.removeEventListener('resize', onWindowScroll as any);
        window.removeEventListener('orientationchange', onWindowScroll as any);
      }
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
  style={scrollParent === 'self' ? `height: ${containerHeight}px; overflow-y:auto;` : `min-height: ${viewportHeightState}px; overflow: visible;`}
  onscroll={scrollParent === 'self' ? handleScroll : undefined}
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
  .virtual-grid-container { position: relative; contain: strict; overflow-anchor: none; }

  /* Smooth scrolling */
  .virtual-grid-container { scroll-behavior: auto; scrollbar-width: thin; scrollbar-color: #cbd5e0 #f7fafc; }

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
