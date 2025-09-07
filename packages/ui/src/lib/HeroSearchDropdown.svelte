<script lang="ts">
  import { goto } from '$app/navigation';
  import TrendingDropdown from './TrendingDropdown.svelte';
  import type { Product } from './types';
  
  interface SearchResult {
    id: string;
    title: string;
    price: number;
    slug?: string | null;
    images?: string[];
    profiles?: {
      username: string;
    };
    categories?: {
      slug: string;
    };
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
    onSearchResultClick?: (product: SearchResult) => void;
    onSellerClick?: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice?: (price: number) => string;
    categoriesText?: string;
    translations: {
      quickShop: string;
      shopByCondition: string;
      shopByPrice: string;
      quickAccess: string;
      topSellers: string;
      newWithTags: string;
      likeNew: string;
      good: string;
      fair: string;
      under25: string;
      cheapest: string;
      newest: string;
      premium: string;
      myFavorites: string;
      browseAll: string;
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
    onSearchResultClick,
    onSellerClick,
    onFilterClick,
    formatPrice = (price: number) => `$${price}`,
    categoriesText = 'Categories', // Will be overridden by parent component
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
  let currentController: AbortController | null = null; // cancel in-flight requests
  
  async function performSearch(query: string) {
    if (!query.trim()) {
      searchResults = [];
      isSearchMode = false;
      showDropdown = trendingProducts.length > 0 || topSellers.length > 0;
      selectedIndex = -1;
      return;
    }

    isLoading = true;
    isSearchMode = true;
    try {
      // Cancel prior request if still in flight
      if (currentController) currentController.abort();
      currentController = new AbortController();
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`, { signal: currentController.signal });
      const data = await response.json();
      searchResults = data.products || [];
      showDropdown = true;
      // Reset selection to first item if available for keyboard users
      selectedIndex = searchResults.length > 0 ? 0 : -1;
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Search failed:', error);
        searchResults = [];
        selectedIndex = -1;
      }
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
      selectedIndex = -1;
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
        if (selectedIndex < 0) selectedIndex = 0; else selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Home':
        e.preventDefault();
        selectedIndex = searchResults.length > 0 ? 0 : -1;
        break;
      case 'End':
        e.preventDefault();
        selectedIndex = searchResults.length > 0 ? searchResults.length - 1 : -1;
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          navigateToProduct(searchResults[selectedIndex]);
        } else if (value.trim()) {
          onSearch?.(value.trim());
          showDropdown = false;
          selectedIndex = -1;
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
    if (onSearchResultClick) {
      onSearchResultClick(product);
    } else {
      // Fallback to old URL format if no callback provided
      goto(`/product/${product.id}`);
    }
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
    class="bg-[color:var(--surface)] rounded-lg border border-[color:var(--border-default)] p-0.5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[color:var(--state-focus)] focus-within:border-[color:var(--border-focus)] transition-all duration-200"
  >
    <div class="bg-[color:var(--surface-subtle)] relative rounded-lg overflow-hidden min-h-[var(--touch-standard)] sm:min-h-12">
      <div class="relative flex items-center min-h-[var(--touch-standard)] sm:min-h-12">
        <label for="hero-search-input" class="sr-only">{placeholder}</label>
        <div class="absolute left-3 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <svg class="w-5 h-5 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          aria-controls="hero-results"
          aria-activedescendant={selectedIndex >= 0 ? `hero-option-${selectedIndex}` : undefined}
          class="flex-1 bg-transparent text-sm sm:text-base placeholder-[color:var(--text-placeholder)] text-[color:var(--text-primary)] focus:outline-none border-0 focus:ring-0 min-w-0 pl-10 pr-2 py-2 sm:py-2.5"
          oninput={handleInput}
          onfocus={handleFocus}
          onkeydown={handleKeyDown}
        />
        
        <div class="flex items-center pr-2 gap-1">
          {#if value}
            <button
              type="button"
              onclick={clearSearch}
              class="p-1.5 hover:bg-[color:var(--surface-muted)] rounded-full transition-colors mr-1 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)]"
              aria-label="Clear search query"
            >
              <svg class="w-4 h-4 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
          {#if isLoading}
            <div class="w-4 h-4 border-2 border-[color:var(--border-subtle)] border-t-[color:var(--text-secondary)] rounded-full animate-spin mr-2"></div>
          {/if}
          
          <!-- Dropdown Toggle Button -->
          <button
            type="button"
            onclick={toggleDropdown}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-label="{categoriesText} filter"
            aria-controls="hero-results"
            class="px-2 py-1 bg-[color:var(--surface)] rounded-md hover:bg-[color:var(--surface-muted)] transition-colors flex items-center gap-1 border border-[color:var(--border-default)] whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--state-focus)]"
          >
            <svg 
              class="w-4 h-4 text-[color:var(--text-secondary)] shrink-0 transition-transform duration-200 {showDropdown ? 'rotate-180' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span class="text-xs font-medium text-[color:var(--text-secondary)] hidden sm:inline">{categoriesText}</span>
          </button>
        </div>
      </div>
    </div>
  </form>

  {#if showDropdown}
    <div class="absolute z-50 w-full mt-2">
      <!-- Live region for screen readers -->
      <div class="sr-only" role="status" aria-live="polite">
        {#if isLoading}
          Loading results...
        {:else if isSearchMode}
          {searchResults.length} results.
        {/if}
      </div>
      {#if isSearchMode && searchResults.length > 0}
        <!-- Search Results Mode -->
        <div id="hero-results" role="listbox" class="bg-[color:var(--surface)] border border-[color:var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] md:shadow-[var(--shadow-lg)] max-h-96 overflow-y-auto">
          {#each searchResults as result, index}
            <button
              onclick={() => navigateToProduct(result)}
              id={`hero-option-${index}`}
              role="option"
              aria-selected={selectedIndex === index}
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-[color:var(--surface-muted)] transition-colors min-h-[var(--touch-standard)] focus:outline-none focus:bg-[color:var(--surface-muted)] {selectedIndex === index ? 'bg-[color:var(--surface-muted)]' : ''}"
            >
              {#if result.image}
                <img 
                  src={result.image} 
                  alt={result.title}
                  class="w-12 h-12 object-cover rounded-[var(--radius-md)]"
                />
              {:else}
                <div class="w-12 h-12 bg-[color:var(--surface-subtle)] rounded-[var(--radius-md)] flex items-center justify-center">
                  <svg class="w-6 h-6 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-[color:var(--text-primary)] truncate">{result.title}</p>
                <p class="text-sm text-[color:var(--text-secondary)]">{formatPrice(result.price)}</p>
              </div>
            </button>
          {/each}
          
          <div class="border-t border-[color:var(--border-subtle)]">
            <button
              onclick={() => onSearch?.(value.trim())}
              class="w-full px-4 py-3 text-sm text-center text-[color:var(--primary)] hover:bg-[color:var(--surface-muted)] transition-colors font-medium min-h-[var(--touch-standard)] focus:outline-none focus:bg-[color:var(--surface-muted)]"
            >
              {translations.viewAllResults} "{value}"
            </button>
          </div>
        </div>
      {:else if isSearchMode && !isLoading && value.trim()}
        <!-- No results state -->
        <div id="hero-results" role="listbox" class="bg-[color:var(--surface)] border border-[color:var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] md:shadow-[var(--shadow-lg)]">
          <div role="option" aria-selected="false" class="px-4 py-3 text-sm text-[color:var(--text-secondary)] min-h-[var(--touch-standard)] flex items-center">
            No results for "{value}".
          </div>
          <div class="border-t border-[color:var(--border-subtle)]">
            <button
              onclick={() => onSearch?.(value.trim())}
              class="w-full px-4 py-3 text-sm text-center text-[color:var(--primary)] hover:bg-[color:var(--surface-muted)] transition-colors font-medium min-h-[var(--touch-standard)] focus:outline-none focus:bg-[color:var(--surface-muted)]"
            >
              {translations.viewAllResults} "{value}"
            </button>
          </div>
        </div>
      {:else if !isSearchMode}
        <!-- Trending Content Mode -->
        <TrendingDropdown
          {topSellers}
          {quickFilters}
          onSellerClick={handleSellerClick}  
          onFilterClick={handleFilterClick}
          {translations}
        />
      {/if}
    </div>
  {/if}
</div>
