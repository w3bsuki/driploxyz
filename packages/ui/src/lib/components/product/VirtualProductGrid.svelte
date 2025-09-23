<script lang="ts">
  import { isBrowser } from '../../utils/runtime.js';
  import ProductCard from '../cards/ProductCard.svelte';
  import ProductCardSkeleton from '../skeleton/ProductCardSkeleton.svelte';
  import type { Product } from '../../types/product';
  // Simple throttle implementation
  function throttle<T extends unknown[]>(fn: (...args: T) => void, limit: number) {
    let inThrottle: boolean;
    return function(...args: T) {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
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
  let sentinelElement = $state<HTMLDivElement>();
  let scrollTop = $state(0);
  let containerWidth = $state(0);
  let mounted = $state(false);
  let viewportHeightState = $state(containerHeight);
  
  // Pre-DOM measurement state
  let previousScrollHeight = $state(0);
  let previousViewportHeight = $state(0);
  let previousContainerWidth = $state(0);
  
  // Simple performance monitoring (optional)
  type PerformanceTimers = {
    startTiming: (label: string) => void;
    endTiming: (label: string) => void;
  };

  const perf: PerformanceTimers | null = null;

  // Calculate responsive items per row
  const responsiveItemsPerRow = $derived(() => {
    if (!mounted) return itemsPerRow;
    
    const width = containerWidth || (isBrowser ? window.innerWidth : 768);
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
    })) as (Product & { virtualIndex: number })[];
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
    if (scrollParent === 'self') {
      const target = event.target as HTMLDivElement;
      scrollTop = target.scrollTop;
    } else {
      updateScrollTopFromWindow();
    }
  }, 16); // ~60fps

  function handleResize() {
    if (containerElement) {
      containerWidth = containerElement.clientWidth;
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

  // $effect.pre() for DOM measurements before updates
  $effect.pre(() => {
    // Capture dimensions before any DOM changes from reactive updates
    if (containerElement) {
      previousScrollHeight = containerElement.scrollHeight;
      previousContainerWidth = containerElement.clientWidth;
    }
    
    // Capture viewport height before window resize effects
    if (isBrowser && scrollParent === 'window') {
      previousViewportHeight = window.innerHeight;
    }
  });

  // Use $effect for lifecycle management
  $effect(() => {
    if (!isBrowser || !containerElement) return;
    mounted = true;
    
    // Check if we need to preserve scroll position after layout changes
    if (previousScrollHeight > 0 && containerElement.scrollHeight !== previousScrollHeight) {
      // Maintain relative scroll position when content height changes
      const scrollRatio = scrollTop / previousScrollHeight;
      const newScrollTop = scrollRatio * containerElement.scrollHeight;
      if (Math.abs(newScrollTop - scrollTop) > 10) { // Only adjust if significant change
        requestAnimationFrame(() => {
          if (containerElement) {
            containerElement.scrollTop = newScrollTop;
            scrollTop = newScrollTop;
          }
        });
      }
    }
    
    handleResize();
    const resizeObserver = new ResizeObserver(throttle(handleResize, 100));
    resizeObserver.observe(containerElement);

    const onWindowResize = throttle(() => {
      if (scrollParent === 'window') {
        // Compute viewport height minus offsets
        viewportHeightState = Math.max(0, window.innerHeight - topOffset - bottomOffset);
        updateScrollTopFromWindow();
      }
    }, 16);


    if (scrollParent === 'window') {
      viewportHeightState = Math.max(0, window.innerHeight - topOffset - bottomOffset);
      updateScrollTopFromWindow();
      window.addEventListener('resize', onWindowResize);
    }

    return () => {
      resizeObserver.disconnect();
      if (scrollParent === 'window') {
        window.removeEventListener('resize', onWindowResize as any);
      }
    };
  });

  // IntersectionObserver for end-reached detection
  $effect(() => {
    if (!isBrowser || !sentinelElement || !onEndReached || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onEndReached();
        }
      },
      {
        root: scrollParent === 'self' ? containerElement : null,
        rootMargin: `0px 0px ${endThreshold}px 0px`,
        threshold: 0
      }
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
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

{#snippet loadingState()}
  <div class="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
    {#each Array(20) as _}
      <ProductCardSkeleton />
    {/each}
  </div>
{/snippet}

{#snippet visibleItemsGrid()}
  <div 
    class="absolute w-full"
    style="transform: translateY({offsetY}px);"
  >
    {#each visibleItems() as item (item.id)}
      {@render virtualizedProductItem(item)}
    {/each}
  </div>
{/snippet}

{#snippet virtualizedProductItem(item: Product & { virtualIndex: number })}
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
{/snippet}

{#snippet emptyState()}
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p class="text-gray-500">Try adjusting your search or filters</p>
    </div>
  </div>
{/snippet}

<div 
  bind:this={containerElement}
  class="virtual-grid-container {className}"
  style={scrollParent === 'self' ? `height: ${containerHeight}px; overflow-y:auto;` : `min-height: ${viewportHeightState}px; overflow: visible;`}
  onscroll={scrollParent === 'self' ? handleScroll : undefined}
>
  <!-- Total height spacer -->
  <div style="height: {totalHeight}px; position: relative;">
    
    <!-- Grid Content States -->
    {#if loading}
      {@render loadingState()}
    {:else if visibleItems().length > 0}
      {@render visibleItemsGrid()}
    {:else}
      {@render emptyState()}
    {/if}
    
    <!-- Sentinel element for end-reached detection -->
    {#if items.length > 0 && onEndReached}
      <div
        bind:this={sentinelElement}
        class="absolute bottom-0 left-0 w-full h-px"
        style="transform: translateY(-{endThreshold}px);"
        aria-hidden="true"
      ></div>
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

  /* Performance optimizations - container-level containment only */

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .virtual-grid-container {
      scroll-behavior: auto;
    }
  }
</style>
