<script lang="ts">
  import { goto } from '$app/navigation';
  import TrendingDropdown from './TrendingDropdown.svelte';
  import type { Product } from './types';
  
  interface SearchResult {
    id: string;
    title: string;
    price: number;
    image: string | null;
  }

  interface Seller {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    itemCount: number;
  }

  interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
  }

  interface Props {
    value: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    trendingProducts?: Product[];
    topSellers?: Seller[];
    quickFilters?: QuickFilter[];
    onProductClick?: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice?: (price: number) => string;
    categoriesText?: string;
    translations: {
      trendingNow: string;
      topSellers: string;
      items: string;
      viewAllResults: string;
    };
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search products...',
    onSearch,
    trendingProducts = [],
    topSellers = [],
    quickFilters = [],
    onProductClick,
    onSellerClick,
    onFilterClick,
    formatPrice = (price: number) => `$${price}`,
    categoriesText = 'Categories',
    translations,
    class: className = ''
  }: Props = $props();

  let searchResults = $state<SearchResult[]>([]);
  let isLoading = $state(false);
  let showDropdown = $state(false);
  let selectedIndex = $state(-1);
  let searchTimeout: NodeJS.Timeout;
  let inputElement: HTMLInputElement;
  let isSearchMode = $state(false); // true when showing search results, false when showing trending
  
  async function performSearch(query: string) {
    if (!query.trim()) {
      searchResults = [];
      isSearchMode = false;
      showDropdown = trendingProducts.length > 0 || topSellers.length > 0;
      return;
    }

    isLoading = true;
    isSearchMode = true;
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      searchResults = data.products || [];
      showDropdown = true;
    } catch (error) {
      console.error('Search failed:', error);
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function handleInput() {
    clearTimeout(searchTimeout);
    if (value.trim()) {
      searchTimeout = setTimeout(() => performSearch(value), 300);
    } else {
      searchResults = [];
      isSearchMode = false;
      showDropdown = trendingProducts.length > 0 || topSellers.length > 0;
    }
  }
  
  function handleFocus() {
    if (!value.trim() && (trendingProducts.length > 0 || topSellers.length > 0)) {
      isSearchMode = false;
      showDropdown = true;
    }
  }

  function toggleDropdown() {
    if (!showDropdown && !value.trim() && (trendingProducts.length > 0 || topSellers.length > 0)) {
      isSearchMode = false;
      showDropdown = true;
    } else {
      showDropdown = !showDropdown;
    }
  }
  
  function clearSearch() {
    value = '';
    searchResults = [];
    isSearchMode = false;
    showDropdown = trendingProducts.length > 0 || topSellers.length > 0;
    inputElement?.focus();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!showDropdown || (!isSearchMode && !searchResults.length)) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          navigateToProduct(searchResults[selectedIndex]);
        } else if (value.trim()) {
          onSearch?.(value.trim());
          showDropdown = false;
        }
        break;
      case 'Escape':
        showDropdown = false;
        selectedIndex = -1;
        break;
    }
  }

  function navigateToProduct(product: SearchResult) {
    showDropdown = false;
    goto(`/product/${product.id}`);
  }

  function handleProductClick(product: Product) {
    showDropdown = false;
    onProductClick?.(product);
  }

  function handleSellerClick(seller: Seller) {
    showDropdown = false;
    onSellerClick?.(seller);
  }

  function handleFilterClick(filterValue: string) {
    showDropdown = false;
    onFilterClick?.(filterValue);
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.hero-search-container')) {
      showDropdown = false;
    }
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="hero-search-container relative {className}">
  <!-- Hero Search Bar with Nested Design -->
  <form 
    role="search"
    class="bg-white rounded-full border border-gray-200 p-1 shadow-sm hover:shadow-md focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-400/20 transition-all"
  >
    <div class="bg-gray-50 relative rounded-full overflow-hidden min-h-11 sm:min-h-12">
      <div class="relative flex items-center min-h-11 sm:min-h-12">
        <label for="hero-search-input" class="sr-only">{placeholder}</label>
        <div class="absolute left-3 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          id="hero-search-input"
          bind:this={inputElement}
          bind:value
          {placeholder}
          type="search"
          autocomplete="off"
          spellcheck="false"
          aria-label={placeholder}
          class="flex-1 bg-transparent text-sm sm:text-base placeholder-gray-500 focus:outline-none border-0 focus:ring-0 min-w-0 pl-10 pr-2 py-2.5 sm:py-3"
          oninput={handleInput}
          onfocus={handleFocus}
          onkeydown={handleKeyDown}
        />
        
        <div class="flex items-center pr-2 gap-1">
          {#if value}
            <button
              type="button"
              onclick={clearSearch}
              class="p-1.5 hover:bg-gray-200 rounded-full transition-colors mr-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Clear search query"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
          {#if isLoading}
            <div class="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
          {/if}
          
          <!-- Dropdown Toggle Button -->
          <button
            type="button"
            onclick={toggleDropdown}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-label="{categoriesText} filter"
            class="px-3 py-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1 ring-1 ring-gray-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <svg 
              class="w-4 h-4 text-gray-600 shrink-0 transition-transform {showDropdown ? 'rotate-180' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span class="text-xs font-medium text-gray-600 hidden sm:inline">{categoriesText}</span>
          </button>
        </div>
      </div>
    </div>
  </form>

  {#if showDropdown}
    <div class="absolute z-50 w-full mt-2">
      {#if isSearchMode && searchResults.length > 0}
        <!-- Search Results Mode -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          {#each searchResults as result, index}
            <button
              onclick={() => navigateToProduct(result)}
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedIndex === index ? 'bg-gray-50' : ''}"
            >
              {#if result.image}
                <img 
                  src={result.image} 
                  alt={result.title}
                  class="w-12 h-12 object-cover rounded-lg"
                />
              {:else}
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                <p class="text-sm text-gray-500">{formatPrice(result.price)}</p>
              </div>
            </button>
          {/each}
          
          <div class="border-t border-gray-100">
            <button
              onclick={() => onSearch?.(value.trim())}
              class="w-full px-4 py-3 text-sm text-center text-blue-600 hover:bg-gray-50 transition-colors font-medium"
            >
              {translations.viewAllResults} "{value}"
            </button>
          </div>
        </div>
      {:else if !isSearchMode}
        <!-- Trending Content Mode -->
        <TrendingDropdown
          {trendingProducts}
          {topSellers}
          {quickFilters}
          onProductClick={handleProductClick}
          onSellerClick={handleSellerClick}  
          onFilterClick={handleFilterClick}
          {formatPrice}
          {translations}
        />
      {/if}
    </div>
  {/if}
</div>