<script lang="ts">
  import { onMount } from 'svelte';
  import { VirtualProductGrid } from '@repo/ui';
  import type { Product } from './types/index.js';
  
  interface Props {
    searchQuery?: string;
    filters?: any;
    onProductClick: (product: Product) => void;
    onFavorite: (product: Product) => void;
    searchFunction: (params: any) => Promise<{ products: Product[]; totalCount: number; totalPages: number }>;
    translations?: Record<string, any>;
    loadComponent?: (importFn: () => Promise<{ default: any }>) => Promise<any>;
    createLazyLoader?: (callback: () => void, options?: IntersectionObserverInit) => (node: Element) => any;
    class?: string;
  }
  
  let { 
    searchQuery = '', 
    filters = {},
    onProductClick, 
    onFavorite,
    searchFunction,
    translations = {},
    loadComponent,
    createLazyLoader,
    class: className = ''
  }: Props = $props();
  
  let container: HTMLElement;
  let ProductGrid: any;
  let isLoaded = $state(false);
  let products = $state<Product[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let totalCount = $state(0);
  let currentPage = $state(1);
  let hasMore = $state(true);
  
  // Lazy load components when they're needed
  async function loadComponents() {
    if (isLoaded) return;
    
    try {
      if (loadComponent) {
        // Use provided loadComponent function for dynamic imports
        ProductGrid = await loadComponent(() => import('./ProductCard.svelte'));
      }
      
      isLoaded = true;
      
      // Load initial data
      await loadSearchResults();
    } catch (err) {
      console.error('Failed to load search components:', err);
      error = 'Failed to load search interface';
    }
  }
  
  // Search function using provided search function
  async function loadSearchResults(page = 1, append = false) {
    if (loading) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await searchFunction({
        query: searchQuery,
        page,
        limit: 20,
        ...filters
      });
      
      if (append) {
        products = [...products, ...result.products];
      } else {
        products = result.products;
      }
      
      totalCount = result.totalCount;
      currentPage = page;
      hasMore = page < result.totalPages;
      
    } catch (err) {
      console.error('Search failed:', err);
      error = err instanceof Error ? err.message : 'Search failed';
    } finally {
      loading = false;
    }
  }
  
  // Load more products for infinite scroll
  async function loadMore() {
    if (hasMore && !loading) {
      await loadSearchResults(currentPage + 1, true);
    }
  }
  
  // Intersection observer for infinite scroll
  function createInfiniteScroll(node: Element) {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      });
    }, {
      rootMargin: '200px'
    });
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
  
  // Watch for search query changes
  $effect(() => {
    if (searchQuery && isLoaded) {
      currentPage = 1;
      loadSearchResults();
    }
  });
  
  // Watch for filter changes
  $effect(() => {
    if (filters && isLoaded) {
      currentPage = 1;
      loadSearchResults();
    }
  });
  
  onMount(() => {
    if (createLazyLoader) {
      // Use provided lazy loader
      const lazyLoader = createLazyLoader(loadComponents, { rootMargin: '100px' });
      return lazyLoader(container);
    } else {
      // Fallback - load immediately
      loadComponents();
    }
  });
</script>

<div bind:this={container} class="lazy-search-results {className}">
  {#if !isLoaded}
    <!-- Loading placeholder -->
    <div class="flex items-center justify-center h-64">
      <div class="animate-pulse space-y-4 w-full">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {#each Array(10) as _}
            <div class="bg-gray-200 rounded-lg aspect-square"></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if error}
    <!-- Error state -->
    <div class="text-center py-12">
      <div class="text-red-500 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
      <p class="text-gray-600 mb-4">{error}</p>
      <button 
        onclick={() => loadSearchResults()}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  {:else if products.length === 0 && !loading}
    <!-- Empty state -->
    <div class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p class="text-gray-600">Try adjusting your search or filters</p>
    </div>
  {:else}
    <!-- Results -->
    <div class="space-y-4">
      <!-- Results count -->
      <div class="text-sm text-gray-600">
        {totalCount} {totalCount === 1 ? 'product' : 'products'} found
      </div>
      
      <!-- Use virtual scrolling for large result sets -->
      {#if products.length > 50}
        <VirtualProductGrid 
          items={products}
          {onProductClick}
          {onFavorite}
          {translations}
          itemHeight={320}
          containerHeight={600}
        />
      {:else}
        <!-- Regular grid for smaller result sets -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {#each products as product}
            <div class="product-item">
              <!-- Product card will be rendered here -->
              <div class="bg-white rounded-lg shadow-sm border p-3">
                <div class="aspect-square bg-gray-100 rounded-lg mb-3">
                  <enhanced:img
                    src={product.images?.[0] || '/placeholder-product.svg'}
                    alt={product.title}
                    class="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <p class="text-lg font-semibold text-gray-900">
                  ${product.price}
                </p>
                {#if product.brand}
                  <p class="text-xs text-gray-500 mt-1">{product.brand}</p>
                {/if}
                <button
                  onclick={() => onProductClick(product)}
                  class="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      
      <!-- Load more trigger for infinite scroll -->
      {#if hasMore}
        <div use:createInfiniteScroll class="text-center py-8">
          {#if loading}
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          {:else}
            <button 
              onclick={loadMore}
              class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Load More
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .lazy-search-results {
    contain: layout style;
  }
  
  .product-item {
    contain: layout style paint;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>