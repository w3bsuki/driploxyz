<script lang="ts">
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
    translations = {},
    filterType = 'products'
  }: SearchDropdownProps = $props();

  let results = $state<ProductWithImages[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;
  let dropdownVisible = $derived(visible);
  let selectedIndex = $state(-1);
  let navigationStack = $state<{ categories: CategoryWithChildren[], level: number }>({ categories: [], level: 1 });
  let recentSearches = $state<string[]>([]);

  // Default translations
  const defaultTranslations = {
    categories: 'Categories',
    collections: 'Collections',
    sellers: 'Sellers',
    brands: 'Brands',
    products: 'Products',
    searching: 'Searching...',
    viewAllResults: 'View all results for',
    ...translations
  };

  // Context-aware categories display
  const displayCategories = $derived.by(() => {
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
  const displayCollections = $derived.by(() => {
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
  const displaySellers = $derived.by(() => {
    return sellers.slice(0, 5); // Show top 5 sellers
  });

  const dropdownContainerClass = 'search-dropdown-container bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-b-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-hidden absolute top-full left-0 right-0 z-[100] backdrop-blur-sm';

  const resultButtonBaseClass = 'w-full px-[var(--space-4)] py-[var(--space-3)] flex items-center gap-[var(--space-3)] text-left transition-all duration-[var(--duration-fast)] border-b border-[color:var(--border-subtle)] last:border-0 hover:bg-[color:var(--state-hover)]';
  
  const resultButtonActiveClass = 'bg-[color:var(--state-hover)] ring-1 ring-inset ring-[color:var(--state-focus)]';

  // Load recent searches from localStorage
  $effect(() => {
    if (isBrowser) {
      try {
        const saved = localStorage.getItem('driplo_recent_searches');
        if (saved) {
          const parsed = JSON.parse(saved);
          recentSearches = parsed.slice(0, 5);
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
      recentSearches = updated;
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
        if (Array.isArray(response)) {
          results = response.slice(0, maxResults);
        } else if (response && typeof response === 'object' && 'data' in response) {
          const r = response as { data: ProductWithImages[]; error: string | null };
          if (r.error) {
            error = r.error;
            results = [];
          } else {
            results = (r.data || []).slice(0, maxResults);
          }
        } else {
          // Fallback: unknown shape
          results = [];
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
  function handleClickOutside(event: MouseEvent) {
    // Only close if clicking outside the dropdown container
    const target = event.target as HTMLElement;
    if (!target.closest('.search-dropdown-container')) {
      if (onClose) {
        onClose();
      }
      selectedIndex = -1;
    }
  }

  // Set up document listeners only when dropdown is visible
  $effect(() => {
    if (dropdownVisible && typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  });
</script>

{#snippet emptyState(icon: string, message: string)}
  <div class="p-[var(--space-8)] text-center text-[color:var(--text-secondary)]">
    {@html icon}
    <p class="text-sm">{message}</p>
  </div>
{/snippet}

{#snippet loadingState()}
  <div class="p-[var(--space-8)] text-center text-[color:var(--text-secondary)]">
    <div class="inline-flex items-center gap-[var(--space-2)]">
      <div class="w-[var(--space-4)] h-[var(--space-4)] border-2 border-[color:var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
      {defaultTranslations.searching}
    </div>
  </div>
{/snippet}

{#snippet productImage(product: ProductWithImages)}
  {#if product.images?.[0]}
    {#if typeof product.images[0] === 'string'}
      <img
        src={product.images[0]}
        alt={product.title}
        class="w-[var(--space-12)] h-[var(--space-12)] object-cover rounded-[var(--radius-lg)] flex-shrink-0"
      />
    {:else if (typeof product.images[0] === 'object' && 'image_url' in product.images[0])}
      <img
        src={(product.images[0] as any).image_url}
        alt={product.title}
        class="w-[var(--space-12)] h-[var(--space-12)] object-cover rounded-[var(--radius-lg)] flex-shrink-0"
      />
    {/if}
  {:else}
    <div class="w-[var(--space-12)] h-[var(--space-12)] bg-[color:var(--surface-subtle)] rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0">
      <svg class="w-[var(--space-6)] h-[var(--space-6)] text-[color:var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  {/if}
{/snippet}

{#snippet sellerAvatar(seller: SearchSeller)}
  {#if seller.avatar_url}
    <img
      src={seller.avatar_url}
      alt={seller.username}
      class="w-[var(--space-12)] h-[var(--space-12)] rounded-full object-cover flex-shrink-0"
    />
  {:else}
    <div class="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-gradient-to-br from-[color:var(--brand-primary)] to-[color:var(--brand-secondary)] flex items-center justify-center flex-shrink-0">
      <span class="text-[color:var(--text-inverse)] font-semibold text-lg">{seller.username.charAt(0).toUpperCase()}</span>
    </div>
  {/if}
{/snippet}

{#if dropdownVisible}
  <div
    class="{dropdownContainerClass} {className}"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => { if (e.key === 'Escape') onClose?.(); }}
    role="dialog"
    tabindex="0"
    aria-label="Search results and browse options"
  >
    {#if query && query.trim()}
      <!-- Search Results Section -->
      <div class="max-h-[60vh] overflow-y-auto">
        {#if loading}
          {@render loadingState()}
        {:else if error}
          <div class="p-[var(--space-8)] text-center text-[color:var(--status-error-text)]">
            {error}
          </div>
        {:else}
          <!-- Products -->
          {#if filterType === 'products' && results.length > 0}
            <div role="listbox" id={listboxId} aria-label={defaultTranslations.products} class="py-[var(--space-1)]">
              {#each results as product, index (product.id)}
                <button
                  class="{resultButtonBaseClass} {selectedIndex === index ? resultButtonActiveClass : ''}"
                  onclick={() => handleProductSelect(product)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  id="{listboxId}-option-{index}"
                >
                  {@render productImage(product)}
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-[color:var(--text-primary)] truncate">{product.title}</div>
                    <div class="text-sm text-[color:var(--text-secondary)] flex items-center gap-[var(--space-2)]">
                      <span class="font-semibold text-[color:var(--brand-primary)]">{formatPrice(product.price)}</span>
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
                  class="w-full px-[var(--space-4)] py-[var(--space-3)] text-[color:var(--brand-primary)] hover:bg-[color:var(--state-hover)] text-sm font-medium transition-colors duration-[var(--duration-fast)] border-t border-[color:var(--border-subtle)]"
                  onclick={() => handleSearchSelect(query)}
                >
                  {defaultTranslations.viewAllResults} "{query}"
                </button>
              {/if}
            </div>
          {:else if filterType === 'products'}
            {@render emptyState(
              '<svg class="w-12 h-12 mx-auto mb-3 text-[color:var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
              `No products found for "${query}"`
            )}
          {/if}
          
          <!-- Categories/Brands -->
          {#if filterType === 'brands'}
            <div class="p-[var(--space-3)]">
              <div class="grid grid-cols-2 gap-[var(--space-2)]">
                {#each displayCategories as category (category.id || category.slug)}
                  <button
                    class="flex items-center gap-[var(--space-2)] p-[var(--space-3)] bg-[color:var(--surface-base)] hover:bg-[color:var(--state-hover)] rounded-[var(--radius-md)] border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-[var(--duration-fast)] text-left"
                    onclick={() => handleCategorySelect(category)}
                  >
                    <span class="text-xl">{category.emoji || '🏷️'}</span>
                    <div class="flex-1 min-w-0">
                      <span class="font-medium text-[color:var(--text-primary)] text-sm truncate block">{category.name}</span>
                      {#if category.product_count}
                        <span class="text-xs text-[color:var(--text-tertiary)]">({category.product_count})</span>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Sellers -->
          {#if filterType === 'sellers'}
            {#if displaySellers.length > 0}
              <div class="p-[var(--space-2)]">
                {#each displaySellers as seller (seller.username)}
                  <button
                    class="w-full flex items-center gap-[var(--space-3)] p-[var(--space-3)] hover:bg-[color:var(--state-hover)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-fast)] text-left"
                    onclick={() => handleSellerSelect(seller)}
                  >
                    {@render sellerAvatar(seller)}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-[var(--space-2)]">
                        <span class="font-medium text-[color:var(--text-primary)] truncate">@{seller.username}</span>
                        {#if seller.is_verified}
                          <svg class="w-[var(--space-4)] h-[var(--space-4)] text-[color:var(--brand-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                      </div>
                      <div class="flex items-center gap-[var(--space-2)] text-sm text-[color:var(--text-secondary)]">
                        <span>{seller.total_products} items</span>
                        {#if seller.rating}
                          <span>•</span>
                          <div class="flex items-center gap-[var(--space-1)]">
                            <svg class="w-[var(--space-3)] h-[var(--space-3)] text-[color:var(--status-warning-text)]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{seller.rating.toFixed(1)}</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            {:else}
              {@render emptyState(
                '<svg class="w-12 h-12 mx-auto mb-3 text-[color:var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>',
                'No sellers found'
              )}
            {/if}
          {/if}
        {/if}
      </div>
    {:else}
      <!-- Empty state when no search query -->
      {@render emptyState(
        '<svg class="w-12 h-12 mx-auto mb-3 text-[color:var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
        'Start typing to search...'
      )}
    {/if}
  </div>
{/if}
