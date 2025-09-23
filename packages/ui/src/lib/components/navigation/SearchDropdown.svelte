<script lang="ts">
  // Note: goto function should be passed as prop when used in SvelteKit apps
  import { isBrowser } from '../../utils/runtime.js';
  import type {
    ProductWithImages,
    CategoryWithChildren,
    SearchSeller,
    Collection,
    SearchContext,
    SearchDropdownProps
  } from './search/types';

  let {
    query,
    context = 'search',
    categoryContext = null,
    onSearch,
    onSelect,
    onClose,
    maxResults = 5,
    showCategories = true,
    class: className = '',
    visible = false,
    listboxId = 'search-dropdown-listbox',
    categories = [],
    sellers = [],
    collections = [],
    onCategorySelect,
    onSellerSelect,
    onCollectionSelect,
    translations = {}
  }: SearchDropdownProps = $props();

  let results: ProductWithImages[] = $state([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let searchTimeout: NodeJS.Timeout;
  let dropdownVisible = $derived(visible);
  let selectedIndex = $state(-1);
  let activeTab = $state<'categories' | 'collections' | 'sellers'>('categories');
  let navigationStack = $state<{ categories: CategoryWithChildren[], level: number }>({ categories: [], level: 1 });

  const recentSearches = $state<string[]>([]);

  // Default translations
  const defaultTranslations = {
    categories: 'Categories',
    collections: 'Collections',
    sellers: 'Sellers',
    products: 'Products',
    searching: 'Searching...',
    viewAllResults: 'View all results for',
    ...translations
  };

  // Context-aware tab configuration
  const availableTabs = $derived(() => {
    const tabs: Array<{ key: 'categories' | 'collections' | 'sellers', label: string }> = [];

    // Categories tab - always available but content varies by context
    tabs.push({ key: 'categories', label: defaultTranslations.categories });

    // Collections tab - available in main and search contexts
    if (context === 'main' || context === 'search') {
      tabs.push({ key: 'collections', label: defaultTranslations.collections });
    }

    // Sellers tab - available in main and search contexts
    if (context === 'main' || context === 'search') {
      tabs.push({ key: 'sellers', label: defaultTranslations.sellers });
    }

    return tabs;
  });

  // Context-aware categories display
  const displayCategories = $derived(() => {
    if (navigationStack.categories.length > 0) {
      return navigationStack.categories;
    }

    switch (context) {
      case 'category':
        // For category pages, show subcategories specific to current category
        // Filter out level 1 categories if we're already in a specific category
        if (categoryContext && typeof categoryContext === 'string') {
          // If we're in a specific category like 'men', show only men's subcategories
          return categories.filter(cat => {
            // Show level 2+ categories that belong to current category context
            return cat.level && cat.level > 1 &&
                   (cat.parent_id === categoryContext || cat.slug.startsWith(`${categoryContext}-`));
          });
        } else if (categoryContext && typeof categoryContext === 'object' && categoryContext.children) {
          return categoryContext.children.filter(cat => (cat.product_count || 0) > 0);
        }
        // Fallback: show level 2 categories only (no level 1 since we're in a category page)
        return categories.filter(cat => cat.level === 2).slice(0, 8);

      case 'main':
        // For main page, show level 1 categories + popular level 2 subcategories
        const level1 = categories.filter(cat => cat.level === 1 || !cat.level).slice(0, 4);
        const level2Popular = categories.filter(cat => cat.level === 2 && (cat.product_count || 0) > 10).slice(0, 4);
        return [...level1, ...level2Popular];

      case 'search':
      default:
        // For search, show all categories (current behavior)
        return categories.filter(cat => cat.level === 1 || !cat.level).slice(0, 8);
    }
  });

  // Filtered collections based on context
  const displayCollections = $derived(() => {
    if (context === 'category' && categoryContext) {
      // For category pages, show collections relevant to that category
      const contextSlug = typeof categoryContext === 'string' ? categoryContext : categoryContext.slug;
      return collections.filter(collection =>
        collection.key.includes(contextSlug) ||
        !collection.key.includes('women') && !collection.key.includes('men') && !collection.key.includes('kids')
      );
    }
    return collections;
  });

  // Top sellers with product counts
  const displaySellers = $derived(() => {
    return sellers.slice(0, 5); // Show top 5 sellers
  });

  // Load recent searches from localStorage
  $effect(() => {
    if (isBrowser) {
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
    if (!isBrowser || !searchQuery || !searchQuery.trim()) return;
    
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
    if (!query || !query.trim()) {
      results = [];
      // Don't override visibility when parent controls it
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (!onSearch) return;

      loading = true;
      error = null;

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
      // Default behavior - navigate to product page (via parent)
      if (isBrowser) {
        window.location.href = `/product/${product.id}`;
      }
    }
    if (onClose) onClose();
    selectedIndex = -1;
  }

  function handleSearchSelect(searchQuery: string) {
    saveRecentSearch(searchQuery);
    if (isBrowser) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
    if (onClose) onClose();
    selectedIndex = -1;
  }

  function handleCategorySelect(category: CategoryWithChildren) {
    if (onCategorySelect) {
      onCategorySelect(category);
      if (onClose) onClose();
    } else if (category.children && category.children.length > 0 && context === 'main') {
      // For hierarchical navigation in main context, drill down
      navigationStack = {
        categories: category.children.filter(cat => (cat.product_count || 0) > 0),
        level: navigationStack.level + 1
      };
    } else {
      // Navigate to category page
      if (isBrowser) {
        window.location.href = `/category/${category.slug}`;
      }
      if (onClose) onClose();
      selectedIndex = -1;
    }
  }

  function handleCollectionSelect(collection: Collection) {
    if (onCollectionSelect) {
      onCollectionSelect(collection);
      if (onClose) onClose();
    } else {
      if (isBrowser) {
        window.location.href = `/collection/${collection.key}`;
      }
      if (onClose) onClose();
      selectedIndex = -1;
    }
  }

  function handleSellerSelect(seller: SearchSeller) {
    if (onSellerSelect) {
      onSellerSelect(seller);
      if (onClose) onClose();
    } else {
      if (isBrowser) {
        window.location.href = `/profile/${seller.username}`;
      }
      if (onClose) onClose();
      selectedIndex = -1;
    }
  }

  function handleBackNavigation() {
    // Reset navigation stack to go back to top level
    navigationStack = { categories: [], level: 1 };
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!dropdownVisible) return;

    const totalItems = results.length;

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
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleProductSelect(results[selectedIndex]);
        } else if (query && query.trim()) {
          handleSearchSelect(query);
        }
        break;
      case 'Escape':
        if (onClose) onClose();
        selectedIndex = -1;
        break;
    }
  }

  function formatPrice(price: number) {
    if (isBrowser) {
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
    if (onClose) {
      onClose();
    }
    selectedIndex = -1;
  }
</script>

<svelte:document onkeydown={handleKeyDown} onclick={handleClickOutside} />

{#if dropdownVisible}
  <div
    class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-[var(--input-radius)] shadow-lg z-50 {className}"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => { if (e.key === 'Escape') handleClickOutside(); }}
    role="dialog"
    aria-label="Search results and browse options"
  >
    {#if query && query.trim()}
      <!-- Search Results Section -->
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
        <div class="border-b border-gray-100" role="listbox" id={listboxId} aria-label={defaultTranslations.products}>
          <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Products
          </div>
          {#each results as product, index}
            <button
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors {selectedIndex === index ? 'bg-blue-50' : ''}"
              onclick={() => handleProductSelect(product)}
              role="option"
              aria-selected={selectedIndex === index}
              id={`${listboxId}-option-${index}`}
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
              class="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors border-t border-gray-100"
              onclick={() => handleSearchSelect(query)}
            >
              View all results for "{query}"
            </button>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- Context-Aware Tabbed Browse Section -->
    <div class="p-4">
      <!-- Tab Headers - Dynamic based on context -->
      <div class="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {#each availableTabs() as tab}
          <button
            class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
            onclick={() => activeTab = tab.key}
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Tab Content with Smooth Transitions -->
      <div class="relative min-h-[120px]">
        {#key activeTab}
          <div class="animate-in fade-in-0 duration-200">
            {#if activeTab === 'categories'}
              <!-- Hierarchical Navigation Header -->
              {#if navigationStack.level > 1}
                <div class="mb-4">
                  <button
                    onclick={handleBackNavigation}
                    class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Categories
                  </button>
                </div>
              {/if}

              <!-- Categories Grid -->
              <div class="grid grid-cols-2 gap-3">
                {#each displayCategories() as category}
                  <button
                    class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                    onclick={() => handleCategorySelect(category)}
                  >
                    <span class="text-2xl">{category.emoji || '📁'}</span>
                    <div class="flex-1 min-w-0">
                      <span class="font-medium text-gray-900 group-hover:text-blue-600 truncate block">{category.name}</span>
                      {#if category.product_count}
                        <span class="text-xs text-gray-500">({category.product_count})</span>
                      {/if}
                    </div>
                    {#if category.children && category.children.length > 0 && context === 'main'}
                      <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    {/if}
                  </button>
                {/each}
              </div>

              <!-- Empty state for categories -->
              {#if displayCategories().length === 0}
                <div class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p class="text-sm">No categories available</p>
                </div>
              {/if}

            {:else if activeTab === 'collections'}
              <div class="grid grid-cols-2 gap-3">
                {#each displayCollections() as collection}
                  <button
                    class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                    onclick={() => handleCollectionSelect(collection)}
                  >
                    <span class="text-2xl">{collection.emoji}</span>
                    <div class="flex-1 min-w-0">
                      <span class="font-medium text-gray-900 group-hover:text-blue-600 truncate block">{collection.label}</span>
                      {#if collection.product_count}
                        <span class="text-xs text-gray-500">({collection.product_count})</span>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>

            {:else if activeTab === 'sellers'}
              <div class="space-y-3">
                {#each displaySellers() as seller}
                  <button
                    class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                    onclick={() => handleSellerSelect(seller)}
                  >
                    {#if seller.avatar_url}
                      <img
                        src={seller.avatar_url}
                        alt={seller.username}
                        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    {:else}
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-semibold text-sm">{seller.username.charAt(0).toUpperCase()}</span>
                      </div>
                    {/if}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-900 group-hover:text-blue-600 truncate">{seller.username}</span>
                        {#if seller.is_verified}
                          <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-500">
                        <span>{seller.total_products} items</span>
                        {#if seller.rating}
                          <span>•</span>
                          <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{seller.rating.toFixed(1)}</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </button>
                {/each}

                <!-- View More Sellers Button -->
                {#if sellers.length > 5}
                  <button
                    onclick={() => { if (isBrowser) window.location.href = '/sellers'; }}
                    class="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors border-t border-gray-100 rounded-lg"
                  >
                    View All Sellers ({sellers.length})
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/key}
      </div>
    </div>
  </div>
{/if}
