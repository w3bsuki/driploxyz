<!--
  Virtual Scrolling Product Grid for High Performance
  Implements efficient rendering of large product lists using Svelte 5 runes
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_username?: string;
    slug?: string;
    condition?: string;
    [key: string]: unknown;
  }

  // interface VirtualScrollOptions {
  //   itemHeight: number;
  //   containerHeight: number;
  //   overscan: number; // Number of items to render outside visible area
  //   bufferSize: number; // Number of items to keep in memory
  // }

  // Props
  interface Props {
    products: Product[];
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
    bufferSize?: number;
    gridColumns?: number;
    onItemClick?: (product: Product) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loading?: boolean;
  }

  let {
    products = [],
    itemHeight = 320, // Height of each product card
    containerHeight = 600,
    overscan = 5,
    gridColumns = 3,
    onItemClick,
    onLoadMore,
    hasMore = false,
    loading = false
  }: Props = $props();

  // Reactive state using Svelte 5 runes
  let containerElement = $state<HTMLElement>();
  let scrollTop = $state(0);

  // Calculate virtual scrolling parameters
  const itemsPerRow = $derived(gridColumns);
  const totalRows = $derived(Math.ceil(products.length / itemsPerRow));
  const totalHeight = $derived(totalRows * itemHeight);

  // Calculate visible range
  const startRow = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));
  const endRow = $derived(Math.min(totalRows, startRow + Math.ceil(containerHeight / itemHeight) + overscan * 2));

  // Get visible products
  const visibleProducts = $derived.by(() => {
    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(products.length, endRow * itemsPerRow);
    return products.slice(startIndex, endIndex) as Product[];
  });

  // Calculate offsets for positioning
  const offsetY = $derived(startRow * itemHeight);

  // Intersection Observer for lazy loading
  let intersectionObserver: IntersectionObserver | null = null;

  // Scroll handler with throttling
  let scrollTimeout: number | undefined;
  const handleScroll = (event: Event) => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = (setTimeout(() => {
      const target = event.target as HTMLElement;
      scrollTop = target.scrollTop;

      // Trigger load more when near bottom
      if (hasMore && !loading && onLoadMore) {
        const scrollPercent = (scrollTop + containerHeight) / totalHeight;
        if (scrollPercent > 0.8) {
          onLoadMore();
        }
      }
  }, 16) as unknown) as number; // ~60fps
  };

  // Setup intersection observer for visibility tracking
  const setupIntersectionObserver = () => {
    if (!browser || !('IntersectionObserver' in window)) return;

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Track visibility for future optimization
          void entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    if (containerElement) {
      intersectionObserver.observe(containerElement);
    }
  };

  // Handle product card click
  const handleProductClick = (product: Product) => {
    if (onItemClick) {
      onItemClick(product);
    }
  };

  // Generate product URL
  const getProductUrl = (product: Product) => {
    if (product.seller_username && product.slug) {
      return `/product/${product.seller_username}/${product.slug}`;
    }
    return `/product/${product.id}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Component lifecycle
  onMount(() => {
    setupIntersectionObserver();
  });

  onDestroy(() => {
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });
</script>

<div
  bind:this={containerElement}
  class="virtual-scroll-container"
  style="height: {containerHeight}px; overflow-y: auto;"
  onscroll={handleScroll}
  role="grid"
  aria-label="Product grid"
>
  <!-- Virtual scroll spacer -->
  <div style="height: {totalHeight}px; position: relative;">
    <!-- Visible items container -->
    <div
      class="virtual-items"
      style="position: absolute; top: {offsetY}px; width: 100%;"
    >
      <div
        class="product-grid"
        style="display: grid; grid-template-columns: repeat({gridColumns}, 1fr); gap: 1rem;"
      >
  {#each visibleProducts as product_ (product_.id)}
    {@const product = product_ as Product}
          <div
            class="product-card"
            style="height: {itemHeight - 16}px;"
            onclick={() => handleProductClick(product)}
            role="gridcell"
            tabindex="0"
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProductClick(product);
              }
            }}
          >
            <a
              href={getProductUrl(product)}
              class="product-link"
              aria-label="View {product.title}"
            >
              <!-- Product Image -->
              <div class="product-image">
                {#if product.images?.[0]}
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                {:else}
                  <div class="placeholder-image">
                    <svg class="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                {/if}
              </div>

              <!-- Product Info -->
              <div class="product-info">
                <h3 class="product-title">{product.title}</h3>
                <p class="product-price">{formatPrice(product.price)}</p>

                {#if product.condition}
                  <span class="product-condition">{product.condition}</span>
                {/if}

                {#if product.seller_username}
                  <p class="product-seller">by {product.seller_username}</p>
                {/if}
              </div>
            </a>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Loading indicator -->
  {#if loading}
    <div class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading more products...</p>
    </div>
  {/if}

  <!-- End of results indicator -->
  {#if !hasMore && products.length > 0}
    <div class="end-indicator">
      <p>You've reached the end of the results</p>
    </div>
  {/if}
</div>

<style>
  .virtual-scroll-container {
    position: relative;
    will-change: scroll-position;
  }

  .virtual-items {
    will-change: transform;
  }

  .product-card {
    background: var(--surface-base);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .product-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .product-card:focus {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .product-link {
    display: block;
    text-decoration: none;
    color: inherit;
    height: 100%;
  }

  .product-image {
    position: relative;
    height: var(--space-48);
    background-color: var(--surface-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--surface-subtle);
    border-radius: var(--radius-lg);
  }

  .product-info {
    padding: var(--space-4);
  }

  .product-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-price {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-1) 0;
  }

  .product-condition {
    font-size: var(--text-xs);
    color: var(--text-subtle);
    background-color: var(--surface-subtle);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    display: inline-block;
    margin-bottom: var(--space-1);
  }

  .product-seller {
    font-size: var(--text-xs);
    color: var(--text-subtle);
    margin: 0;
  }

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    color: var(--text-subtle);
  }

  .loading-spinner {
    width: var(--space-8);
    height: var(--space-8);
    border: 2px solid var(--border-subtle);
    border-top: 2px solid var(--state-focus);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }

  .end-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    color: var(--text-subtle);
    font-size: var(--text-sm);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 480px) {
    .product-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>