<script lang="ts">
  import { goto } from '$app/navigation';
  
  interface SearchResult {
    id: string;
    title: string;
    price: number;
    image: string | null;
  }

  interface CategorySuggestion {
    id: string;
    name: string;
    level: number;
    path: string;
    icon?: string;
  }

  interface Props {
    value: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onCategorySelect?: (categoryId: string, categoryName: string) => void;
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search products...',
    onSearch,
    onCategorySelect,
    class: className = ''
  }: Props = $props();

  let searchResults = $state<SearchResult[]>([]);
  let categorySuggestions = $state<CategorySuggestion[]>([]);
  let isLoading = $state(false);
  let showDropdown = $state(false);
  let showInitialSuggestions = $state(false);
  let selectedIndex = $state(-1);
  let searchTimeout: NodeJS.Timeout;
  let inputElement: HTMLInputElement;
  
  // Popular search suggestions and quick filters
  const quickSearches = [
    { label: 'Under 20лв', value: '?max_price=20', icon: '💰' },
    { label: 'New today', value: '?sort=newest', icon: '🆕' },
    { label: 'Nike', value: '?brand=Nike', icon: '' },
    { label: 'Zara', value: '?brand=Zara', icon: '' },
    { label: 'Size M', value: '?size=M', icon: '📏' },
    { label: 'Size L', value: '?size=L', icon: '📏' }
  ];

  async function performSearch(query: string) {
    if (!query.trim()) {
      searchResults = [];
      categorySuggestions = []; // Don't show categories when empty - we have pills for that
      showDropdown = false;
      showInitialSuggestions = false;
      return;
    }

    isLoading = true;
    showInitialSuggestions = false;
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5&include_categories=true`);
      const data = await response.json();
      searchResults = data.products || [];
      categorySuggestions = data.categories || [];
      showDropdown = true;
    } catch (error) {
      console.error('Search failed:', error);
      searchResults = [];
      categorySuggestions = [];
    } finally {
      isLoading = false;
    }
  }

  function handleInput() {
    clearTimeout(searchTimeout);
    if (value.trim()) {
      searchTimeout = setTimeout(() => performSearch(value), 300);
    } else {
      // Don't show anything when input is cleared
      searchResults = [];
      categorySuggestions = [];
      showDropdown = false;
      showInitialSuggestions = false;
    }
  }

  function handleFocus() {
    if (!value.trim()) {
      // Show quick searches on empty focus
      showInitialSuggestions = true;
      showDropdown = true;
    } else if (searchResults.length > 0 || categorySuggestions.length > 0) {
      showDropdown = true;
    }
  }
  
  function clearSearch() {
    value = '';
    searchResults = [];
    categorySuggestions = [];
    showDropdown = false;
    showInitialSuggestions = false;
    inputElement?.focus();
  }
  
  function handleSuggestionClick(suggestion: string) {
    value = suggestion;
    performSearch(suggestion);
  }
  
  function handleQuickSearchClick(quickSearch: { label: string; value: string; icon: string }) {
    showDropdown = false;
    // Navigate to search with the quick filter
    goto(`/search${quickSearch.value}`);
  }

  function handleCategoryClick(category: CategorySuggestion) {
    showDropdown = false;
    if (onCategorySelect) {
      onCategorySelect(category.id, category.name);
    } else {
      // Navigate to search with category filter
      goto(`/search?category=${category.id}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!showDropdown) return;

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
        if (selectedIndex >= 0) {
          navigateToProduct(searchResults[selectedIndex]);
        } else if (value.trim()) {
          onSearch?.(value.trim());
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

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-dropdown-container')) {
      showDropdown = false;
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="search-dropdown-container relative {className}">
  <!-- Nested visual style -->
  <search 
    role="search"
    class="bg-white rounded-full border border-gray-200 p-1 shadow-sm hover:shadow-md focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-400/20 transition-all"
  >
    <div class="bg-gray-50 relative rounded-full overflow-hidden min-h-[44px] sm:min-h-[46px]">
      <div class="relative flex items-center min-h-[44px] sm:min-h-[46px]">
        <label for="search-input" class="sr-only">{placeholder}</label>
        <div class="absolute left-3 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          id="search-input"
          bind:this={inputElement}
          bind:value
          {placeholder}
          type="search"
          autocomplete="off"
          spellcheck="false"
          aria-label={placeholder}
          class="flex-1 bg-transparent text-[15px] sm:text-base placeholder-gray-500 focus:outline-none border-0 focus:ring-0 min-w-0 pl-10 pr-2 py-2.5 sm:py-3"
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
        </div>
      </div>
    </div>
  </search>

  {#if showDropdown}
    <div class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
      {#if showInitialSuggestions && !value.trim()}
        <!-- Quick searches when focused but no input -->
        <div class="p-2">
          <div class="text-xs font-medium text-gray-500 px-2 py-1 mb-2">Quick searches</div>
          <div class="grid grid-cols-2 gap-2">
            {#each quickSearches as quickSearch}
              <button
                onclick={() => handleQuickSearchClick(quickSearch)}
                class="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span class="text-base">{quickSearch.icon}</span>
                <span class="text-gray-700">{quickSearch.label}</span>
              </button>
            {/each}
          </div>
        </div>
      {:else if searchResults.length > 0}
        <!-- Search results -->
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
              <p class="text-sm text-gray-500">${formatPrice(result.price)}</p>
            </div>
          </button>
        {/each}
      {:else if value.trim() && !isLoading}
        <!-- No results found -->
        <div class="px-4 py-3 text-sm text-gray-500 text-center">
          No products found for "{value}"
        </div>
      {/if}
      
      {#if value.trim()}
        <div class="border-t border-gray-100">
          <button
            onclick={() => onSearch?.(value.trim())}
            class="w-full px-4 py-3 text-sm text-center text-blue-600 hover:bg-gray-50 transition-colors font-medium"
          >
            View all results for "{value}"
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>