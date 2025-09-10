<script lang="ts">
  import type { Database } from '@repo/database';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Define ProductWithImages type locally since it might not be exported from database
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
    query: string;
    onSearch?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
    onSelect?: (product: ProductWithImages) => void;
    maxResults?: number;
    showCategories?: boolean;
    class?: string;
  }

  let {
    query,
    onSearch,
    onSelect,
    maxResults = 5,
    showCategories = true,
    class: className = ''
  }: Props = $props();

  let results: ProductWithImages[] = $state([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let searchTimeout: NodeJS.Timeout;
  let dropdownVisible = $state(true);
  let selectedIndex = $state(-1);

  // Popular search suggestions when no query
  const popularSearches = [
    'sneakers', 'dresses', 'jeans', 'jackets', 'bags', 'vintage', 'designer'
  ];

  const recentSearches = $state<string[]>([]);

  // Load recent searches from localStorage
  onMount(() => {
    if (browser) {
      try {
        const saved = localStorage.getItem('driplo_recent_searches');
        if (saved) {
          const parsed = JSON.parse(saved);
          recentSearches.splice(0, recentSearches.length, ...parsed.slice(0, 5));
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  });

  function saveRecentSearch(searchQuery: string) {
    if (!browser || !searchQuery.trim()) return;
    
    try {
      const trimmed = searchQuery.trim();
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
      recentSearches.splice(0, recentSearches.length, ...updated);
      localStorage.setItem('driplo_recent_searches', JSON.stringify(updated));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Perform search when query changes
  $effect(() => {
    if (!query.trim()) {
      results = [];
      dropdownVisible = true; // Show suggestions even with empty query
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (!onSearch) return;

      loading = true;
      error = null;
      dropdownVisible = true;

      try {
        const response = await onSearch(query);
        if (response.error) {
          error = response.error;
          results = [];
        } else {
          results = response.data.slice(0, maxResults);
        }
      } catch (e) {
        error = 'Search failed';
        results = [];
      } finally {
        loading = false;
      }
    }, 300);
  });

  function handleProductSelect(product: ProductWithImages) {
    if (onSelect) {
      onSelect(product);
    } else {
      // Default behavior - navigate to product page
      goto(`/product/${product.id}`);
    }
    dropdownVisible = false;
    selectedIndex = -1;
  }

  function handleSearchSelect(searchQuery: string) {
    saveRecentSearch(searchQuery);
    goto(`/search?q=${encodeURIComponent(searchQuery)}`);
    dropdownVisible = false;
    selectedIndex = -1;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!dropdownVisible) return;

    const totalItems = results.length + (query.trim() ? 0 : Math.min(recentSearches.length + popularSearches.length, 8));

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, totalItems - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          if (query.trim() && selectedIndex < results.length) {
            handleProductSelect(results[selectedIndex]);
          } else if (!query.trim()) {
            const suggestionIndex = selectedIndex;
            const allSuggestions = [...recentSearches, ...popularSearches].slice(0, 8);
            if (suggestionIndex < allSuggestions.length) {
              handleSearchSelect(allSuggestions[suggestionIndex]);
            }
          }
        } else if (query.trim()) {
          handleSearchSelect(query);
        }
        break;
      case 'Escape':
        dropdownVisible = false;
        selectedIndex = -1;
        break;
    }
  }

  function formatPrice(price: number) {
    if (browser) {
      return new Intl.NumberFormat('en-BG', {
        style: 'currency',
        currency: 'BGN',
        minimumFractionDigits: 0
      }).format(price);
    }
    return `${price} лв`; // Fallback for SSR
  }

  // Close dropdown when clicking outside
  function handleClickOutside() {
    dropdownVisible = false;
    selectedIndex = -1;
  }
</script>

<svelte:document on:keydown={handleKeyDown} on:click={handleClickOutside} />

{#if dropdownVisible}
  <div 
    class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-[99999] max-h-96 overflow-y-auto {className}"
    on:click|stopPropagation
  >
    {#if query.trim()}
      <!-- Search Results -->
      {#if loading}
        <div class="p-4 text-center text-gray-500">
          <div class="inline-flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </div>
        </div>
      {:else if error}
        <div class="p-4 text-center text-red-500">
          {error}
        </div>
      {:else if results.length > 0}
        <div class="py-2">
          <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            Products
          </div>
          {#each results as product, index}
            <button
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors {selectedIndex === index ? 'bg-blue-50' : ''}"
              on:click={() => handleProductSelect(product)}
            >
              {#if product.images?.[0]?.image_url}
                <img 
                  src={product.images[0].image_url} 
                  alt={product.title}
                  class="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                />
              {:else}
                <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">{product.title}</div>
                <div class="text-sm text-gray-500 flex items-center gap-2">
                  <span>{formatPrice(product.price)}</span>
                  {#if product.category_name}
                    <span>•</span>
                    <span>{product.category_name}</span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
          
          {#if results.length >= maxResults}
            <button
              class="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
              on:click={() => handleSearchSelect(query)}
            >
              View all results for "{query}"
            </button>
          {/if}
        </div>
      {:else}
        <div class="p-4 text-center text-gray-500">
          <div class="mb-2">No products found</div>
          <button
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            on:click={() => handleSearchSelect(query)}
          >
            Search for "{query}" anyway
          </button>
        </div>
      {/if}
    {:else}
      <!-- Suggestions when no query -->
      <div class="py-2">
        {#if recentSearches.length > 0}
          <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Recent
          </div>
          {#each recentSearches.slice(0, 4) as search, index}
            <button
              class="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors {selectedIndex === index ? 'bg-blue-50' : ''}"
              on:click={() => handleSearchSelect(search)}
            >
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-700">{search}</span>
            </button>
          {/each}
        {/if}

        <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider {recentSearches.length > 0 ? 'border-t border-gray-100 mt-2' : ''}">
          Popular
        </div>
        {#each popularSearches.slice(0, 4) as search, index}
          {@const adjustedIndex = recentSearches.length + index}
          <button
            class="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors {selectedIndex === adjustedIndex ? 'bg-blue-50' : ''}"
            on:click={() => handleSearchSelect(search)}
          >
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="text-gray-700">{search}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}