<script lang="ts">
  import type { Database } from '@repo/database';

  // Define ProductWithImages type locally
  type Product = Database['public']['Tables']['products']['Row'];
  type ProductImage = Database['public']['Tables']['product_images']['Row'];

  export interface ProductWithImages extends Product {
    images: ProductImage[];
    category_name?: string;
    seller_name?: string;
    seller_username?: string;
    seller_rating?: number;
  }

  interface Props {
    placeholder?: string;
    onSearch?: (query: string) => void;
    onClose?: () => void;
    searchFunction?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
    onNavigateToSearch?: (query: string) => void;
    onNavigateToProduct?: (productId: string) => void;
    class?: string;
  }

  let {
    placeholder = 'Search for items...',
    onSearch,
    onClose,
    searchFunction,
    onNavigateToSearch,
    onNavigateToProduct,
    class: className = ''
  }: Props = $props();

  let searchValue = $state('');
  let inputElement: HTMLInputElement;
  let isSearching = $state(false);
  let quickResults = $state<ProductWithImages[]>([]);
  let showResults = $derived(searchValue.trim().length > 0 && quickResults.length > 0);

  // Debounce search to avoid too many API calls
  let searchTimeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (searchValue.trim().length > 1 && searchFunction) {
      if (searchTimeout) clearTimeout(searchTimeout);

      searchTimeout = setTimeout(async () => {
        isSearching = true;
        try {
          const result = await searchFunction(searchValue.trim());
          if (result.data) {
            quickResults = result.data.slice(0, 4); // Show max 4 quick results
          }
        } catch (error) {
          console.error('Search error:', error);
          quickResults = [];
        } finally {
          isSearching = false;
        }
      }, 300);
    } else {
      quickResults = [];
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  });

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchValue = value;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    executeSearch();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  }

  function executeSearch() {
    if (!searchValue.trim()) return;

    const query = searchValue.trim();

    if (onSearch) {
      onSearch(query);
    } else if (onNavigateToSearch) {
      onNavigateToSearch(query);
    }

    // Close the mobile menu after search
    if (onClose) {
      onClose();
    }
  }

  function handleProductSelect(product: ProductWithImages) {
    if (onNavigateToProduct) {
      onNavigateToProduct(product.id);
    }
    if (onClose) {
      onClose();
    }
  }

  function clearSearch() {
    searchValue = '';
    quickResults = [];
    inputElement?.focus();
  }

  // Format price for display
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

<div class="mobile-menu-search {className}">
  <!-- Search Form -->
  <form onsubmit={handleSubmit} class="mb-4">
    <div class="relative">
      <input
        bind:this={inputElement}
        type="search"
        value={searchValue}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        {placeholder}
        class="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-base placeholder-gray-500 focus:bg-white focus:border-gray-400 focus:ring-0 focus:outline-none transition-all duration-200 touch-manipulation"
        autocomplete="off"
        spellcheck="false"
        aria-label={placeholder}
      />

      <!-- Search Icon -->
      <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <!-- Clear Button -->
      {#if searchValue}
        <button
          type="button"
          onclick={clearSearch}
          class="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 rounded-md touch-manipulation"
          aria-label="Clear search"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}

      <!-- Loading Indicator -->
      {#if isSearching}
        <div class="absolute right-3 top-3.5">
          <svg class="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {/if}
    </div>
  </form>

  <!-- Quick Search Results -->
  {#if showResults}
    <div class="quick-results bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div class="p-3 border-b border-gray-100">
        <h3 class="text-sm font-medium text-gray-900">Quick Results</h3>
      </div>

      <div class="max-h-64 overflow-y-auto">
        {#each quickResults as product}
          <button
            onclick={() => handleProductSelect(product)}
            class="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <!-- Product Image -->
            <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              {#if product.images && product.images[0]?.image_url}
                <img
                  src={product.images[0].image_url}
                  alt={product.title}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Product Details -->
            <div class="flex-1 min-w-0 text-left">
              <div class="font-medium text-gray-900 text-sm truncate">
                {product.title}
              </div>
              <div class="text-sm text-gray-500 truncate">
                {product.category_name || 'Category'}
              </div>
            </div>

            <!-- Price -->
            <div class="flex-shrink-0 text-sm font-semibold text-gray-900">
              {formatPrice(product.price)}
            </div>
          </button>
        {/each}
      </div>

      <!-- View All Results -->
      <div class="p-3 border-t border-gray-100">
        <button
          onclick={executeSearch}
          class="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
        >
          View all results for "{searchValue}"
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .mobile-menu-search {
    /* Ensure proper touch scrolling on mobile */
    -webkit-overflow-scrolling: touch;
  }

  .quick-results {
    /* Ensure dropdown doesn't interfere with mobile navigation */
    z-index: 10;
  }

  /* iOS Safari specific fixes */
  @supports (-webkit-touch-callout: none) {
    .mobile-menu-search input[type="search"] {
      -webkit-appearance: none;
      appearance: none;
    }
  }
</style>