<!--
  Performance Optimization Example
  Demonstrates how to use the new SvelteKit 2 streaming and performance features
-->

<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import VirtualProductGrid from '$lib/components/VirtualProductGrid.svelte';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import { CacheManager, cacheKeys, cacheTags } from '$lib/cache';
  import { getPerformanceSummary, performanceMonitor } from '$lib/monitoring/performance';

  // Example of how to use streaming data from the load function
  let { data } = $props();

  // Performance monitoring state
  let performanceMetrics = $state(null);
  let showPerformancePanel = $state(false);

  // Cache status
  let cacheStats = $state(null);

  // Example products for virtual scrolling demo
  let products = $state([]);
  let loadingMore = $state(false);
  let hasMore = $state(true);
  let cursor = $state<string | undefined>();

  // Load performance metrics
  onMount(() => {
    // Get initial performance data
    updatePerformanceMetrics();

    // Update metrics every 10 seconds
    const interval = setInterval(updatePerformanceMetrics, 10000);

    return () => clearInterval(interval);
  });

  const updatePerformanceMetrics = () => {
    performanceMetrics = getPerformanceSummary();
    cacheStats = CacheManager.getStats();
  };

  // Example of using cache with streaming
  const loadProductsWithCache = async (categoryId: string) => {
    const cacheKey = cacheKeys.categoryProducts(categoryId, 'streamed');

    const cachedProducts = await CacheManager.get(
      cacheKey,
      async () => {
        // This would normally be a fetch to your API
        const response = await fetch(`/api/products?category=${categoryId}&cursor=${cursor || ''}`);
        return response.json();
      },
      {
        key: cacheKey,
        ttl: 300, // 5 minutes
        tags: [cacheTags.products, cacheTags.categories],
        priority: 'high',
        staleWhileRevalidate: 600 // Serve stale for 10 minutes while revalidating
      }
    );

    return cachedProducts;
  };

  // Example of virtual scrolling load more
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    loadingMore = true;

    try {
      // Track performance of the load more operation
      const startTime = Date.now();

      const result = await loadProductsWithCache('electronics');

      // Track the streaming load time
      performanceMonitor.recordStreamingData(
        'loadMore',
        Date.now() - startTime,
        result.data?.length || 0,
        '/products'
      );

      if (result.data) {
        products = [...products, ...result.data];
        cursor = result.nextCursor;
        hasMore = result.hasMore;
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      loadingMore = false;
    }
  };

  // Example of cache invalidation
  const invalidateProductCache = () => {
    CacheManager.invalidateByTags([cacheTags.products]);
    console.log('Product cache invalidated');
  };

  // Format performance grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
</script>

<div class="performance-example">
  <!-- Performance Panel Toggle -->
  <div class="performance-toggle">
    <button
      onclick={() => showPerformancePanel = !showPerformancePanel}
      class="toggle-button"
    >
      {showPerformancePanel ? 'Hide' : 'Show'} Performance Metrics
    </button>
  </div>

  <!-- Performance Metrics Panel -->
  {#if showPerformancePanel && performanceMetrics}
    <div class="performance-panel">
      <h3>SvelteKit 2 Performance Metrics</h3>

      <!-- Core Web Vitals -->
      <div class="metrics-section">
        <h4>Core Web Vitals</h4>
        <div class="metrics-grid">
          {#if performanceMetrics.webVitals.lcp}
            <div class="metric">
              <span class="metric-label">LCP</span>
              <span class="metric-value">{Math.round(performanceMetrics.webVitals.lcp)}ms</span>
            </div>
          {/if}
          {#if performanceMetrics.webVitals.fid}
            <div class="metric">
              <span class="metric-label">FID</span>
              <span class="metric-value">{Math.round(performanceMetrics.webVitals.fid)}ms</span>
            </div>
          {/if}
          {#if performanceMetrics.webVitals.cls}
            <div class="metric">
              <span class="metric-label">CLS</span>
              <span class="metric-value">{performanceMetrics.webVitals.cls.toFixed(3)}</span>
            </div>
          {/if}
          <div class="metric">
            <span class="metric-label">Grade</span>
            <span class="performance-grade {getGradeColor(performanceMetrics.performanceGrade)}">
              {performanceMetrics.performanceGrade}
            </span>
          </div>
        </div>
      </div>

      <!-- Cache Performance -->
      <div class="metrics-section">
        <h4>Cache Performance</h4>
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Hit Rate</span>
            <span class="metric-value">{(performanceMetrics.cache.hitRate * 100).toFixed(1)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Cache Size</span>
            <span class="metric-value">{performanceMetrics.cache.size} items</span>
          </div>
        </div>
      </div>

      <!-- Streaming Performance -->
      {#if performanceMetrics.streaming}
        <div class="metrics-section">
          <h4>Streaming Performance</h4>
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Avg Chunk Time</span>
              <span class="metric-value">{performanceMetrics.streaming.averageChunkTime}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Total Chunks</span>
              <span class="metric-value">{performanceMetrics.streaming.totalChunks}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="metrics-actions">
        <button onclick={invalidateProductCache} class="action-button">
          Clear Product Cache
        </button>
        <button onclick={updatePerformanceMetrics} class="action-button">
          Refresh Metrics
        </button>
      </div>
    </div>
  {/if}

  <!-- Streaming Data Example -->
  <div class="streaming-example">
    <h3>SvelteKit 2 Streaming Example</h3>
    <p>This page demonstrates streaming data loading with proper fallbacks:</p>

    <!-- Critical data loads immediately -->
    <div class="critical-section">
      <h4>Critical Data (Loads Immediately)</h4>
      <p>Country: {data.country}</p>
      <p>Categories: {data.categories?.length || 0}</p>
    </div>

    <!-- Streamed data with loading states -->
    <div class="streamed-section">
      <h4>Streamed Data (Progressive Loading)</h4>

      {#await data.featuredProducts}
        <div class="loading-placeholder">
          <div class="skeleton skeleton-product"></div>
          <div class="skeleton skeleton-product"></div>
          <div class="skeleton skeleton-product"></div>
        </div>
      {:then featuredProducts}
        <div class="products-preview">
          <p>Featured Products: {featuredProducts?.length || 0} loaded</p>
          {#if featuredProducts?.slice(0, 3)}
            <div class="product-grid">
              {#each featuredProducts.slice(0, 3) as product}
                <div class="product-card">
                  <OptimizedImage
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.title}
                    width={200}
                    height={200}
                    class="product-image"
                  />
                  <h5>{product.title}</h5>
                  <p>€{product.price}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:catch error}
        <div class="error-state">
          <p>Failed to load featured products: {error.message}</p>
        </div>
      {/await}
    </div>
  </div>

  <!-- Virtual Scrolling Example -->
  <div class="virtual-scroll-example">
    <h3>Virtual Scrolling Example</h3>
    <p>High-performance rendering of large product lists:</p>

    {#if products.length > 0}
      <VirtualProductGrid
        products={products}
        gridColumns={3}
        containerHeight={400}
        hasMore={hasMore}
        loading={loadingMore}
        onLoadMore={handleLoadMore}
        onItemClick={(product) => console.log('Product clicked:', product.id)}
      />
    {:else}
      <button onclick={handleLoadMore} class="load-button">
        Load Products Example
      </button>
    {/if}
  </div>

  <!-- Image Optimization Example -->
  <div class="image-optimization-example">
    <h3>Image Optimization Example</h3>
    <p>Responsive images with lazy loading and blur-up effect:</p>

    <div class="image-examples">
      <!-- Priority image (above fold) -->
      <div class="image-example">
        <h4>Priority Image (Above Fold)</h4>
        <OptimizedImage
          src="https://example.com/hero-image.jpg"
          alt="Hero image"
          width={400}
          height={300}
          priority={true}
          class="example-image"
        />
      </div>

      <!-- Lazy loaded image -->
      <div class="image-example">
        <h4>Lazy Loaded Image</h4>
        <OptimizedImage
          src="https://example.com/product-image.jpg"
          alt="Product image"
          width={300}
          height={300}
          loading="lazy"
          class="example-image"
        />
      </div>
    </div>
  </div>
</div>

<style>
  .performance-example {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .performance-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
  }

  .toggle-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .toggle-button:hover {
    background: #2563eb;
  }

  .performance-panel {
    position: fixed;
    top: 4rem;
    right: 1rem;
    width: 320px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 999;
    max-height: 70vh;
    overflow-y: auto;
  }

  .performance-panel h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .performance-panel h4 {
    margin: 1rem 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .metrics-section {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .metric {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 0.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .metric-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }

  .performance-grade {
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
  }

  .metrics-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .action-button {
    flex: 1;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .action-button:hover {
    background: #e5e7eb;
  }

  .streaming-example,
  .virtual-scroll-example,
  .image-optimization-example {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.5rem;
  }

  .critical-section,
  .streamed-section {
    margin: 1rem 0;
    padding: 1rem;
    background: white;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }

  .loading-placeholder {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 0.375rem;
  }

  .skeleton-product {
    height: 200px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .products-preview .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .product-card {
    background: white;
    padding: 1rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    text-align: center;
  }

  .product-card h5 {
    margin: 0.5rem 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .product-card p {
    margin: 0;
    font-weight: 600;
    color: #059669;
  }

  .load-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
  }

  .load-button:hover {
    background: #2563eb;
  }

  .image-examples {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 1rem;
  }

  .image-example {
    background: white;
    padding: 1rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }

  .image-example h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 500;
  }

  .error-state {
    padding: 1rem;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    color: #991b1b;
  }

  @media (max-width: 768px) {
    .performance-panel {
      position: relative;
      top: auto;
      right: auto;
      width: 100%;
      margin: 1rem 0;
    }

    .performance-toggle {
      position: relative;
      top: auto;
      right: auto;
      margin-bottom: 1rem;
    }

    .products-preview .product-grid,
    .loading-placeholder {
      grid-template-columns: 1fr;
    }

    .image-examples {
      grid-template-columns: 1fr;
    }
  }
</style>