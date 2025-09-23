<script lang="ts">
  import { page, navigating } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, ProductCard, Breadcrumb, SellerQuickView, IntegratedSearchBar, SearchDropdown, BottomNav, FilterPill, type Product, type BreadcrumbItem } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { unreadMessageCount } from '$lib/stores/messageNotifications.svelte';
  import { formatPrice } from '$lib/utils/price';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import { CategoryService } from '$lib/services/categories';
  import { ProfileService } from '$lib/services/profiles';
  import { getCollectionsForContext } from '$lib/data/collections';
  import { browser } from '$app/environment';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Track current segments to detect changes
  let currentSegments = $state(page.params.segments || '');
  
  // React to URL parameter changes to refresh data
  $effect(() => {
    const newSegments = page.params.segments || '';
    if (newSegments !== currentSegments) {
      currentSegments = newSegments;
      // Trigger data reload when segments change
      invalidateAll();
    }
  });

  // Load search dropdown data when component mounts
  $effect(() => {
    if (browser && data.supabase) {
      loadSearchDropdownData();
    }
  });

  async function loadSearchDropdownData() {
    try {
      // Determine context based on category level and slug
      const categoryContext = resolution.l1?.slug || category.slug;

      // Load categories for category page context
      const categoryService = new CategoryService(data.supabase);
      const { data: categories, error: categoryError } = await categoryService.getSearchDropdownCategories('category', categoryContext);

      if (!categoryError && categories) {
        searchDropdownCategories = categoryService.transformForSearchDropdown(categories);
      }

      // Load top sellers
      const profileService = new ProfileService(data.supabase);
      const { data: sellers, error: sellerError } = await profileService.getTopSellersForDropdown(5);

      if (!sellerError && sellers) {
        searchDropdownSellers = profileService.transformSellersForDropdown(sellers);
      }

      // Load collections for category context
      searchDropdownCollections = getCollectionsForContext('category', categoryContext);
    } catch (error) {
      
    }
  }
  
  // Translate category name using proper i18n
  function translateCategoryName(name: string): string {
    // Try to get translation from i18n functions
    const translations: Record<string, string> = {
      'Women': i18n.category_women(),
      'Men': i18n.category_men(),
      'Kids': i18n.category_kids(),
      'Unisex': i18n.category_unisex()
    };
    return translations[name] || name;
  }

  // Translation mapping for all category names  
  function translateSubcategoryName(name: string): string {
    const translations: Record<string, string> = {
      // Level 1 - Gender categories
      'Women': i18n.category_women(),
      'Men': i18n.category_men(),
      'Kids': i18n.category_kids(),
      'Unisex': i18n.category_unisex(),
      
      // Level 2 - Main categories
      'Clothing': i18n.category_clothing(),
      'Shoes': i18n.category_shoesType(),
      'Accessories': i18n.category_accessoriesType(),
      'Bags': i18n.category_bags(),
      
      // Additional Level 2/3 categories
      'Activewear': i18n.category_activewear(),
      'Boots': i18n.category_boots(),
      'Dresses': i18n.category_dresses(),
      'Flats': i18n.category_flats(),
      'Formal Shoes': i18n.category_formalShoes(),
      'Heels': i18n.category_heels(),
      'Hoodies': i18n.category_hoodies(),
      'Jackets': i18n.category_jackets(),
      'Jackets & Coats': i18n.category_jacketsCoats(),
      'Jeans': i18n.category_jeans(),
      'Jewelry': i18n.category_jewelry(),
      'Lingerie & Underwear': i18n.category_lingerie(),
      'Pants & Jeans': i18n.category_pantsJeans(),
      'Pants & Trousers': i18n.category_pantsTrousers(),
      'Sandals': i18n.category_sandals(),
      'Sandals & Slides': i18n.category_sandalsSlides(),
      'Shirts': i18n.category_shirts(),
      'Shirts & Blouses': i18n.category_shirtsBlouses(),
      'Shorts': i18n.category_shorts(),
      'Skirts': i18n.category_skirts(),
      'Sneakers': i18n.category_sneakers(),
      'Suits & Blazers': i18n.category_suitsBlazers(),
      'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
      'Swimwear': i18n.category_swimwear(),
      'T-Shirts': i18n.category_tshirts(),
      'Tops & T-Shirts': i18n.category_topsTshirts(),
      'Underwear': i18n.category_underwear(),
      'Watches': i18n.category_watches(),
      'Bags & Purses': i18n.category_bags(),
      
      // Level 3 - Accessory subcategories
      'Hats & Caps': i18n.category_hatsAndCaps(),
      'Belts': i18n.category_belts(),
      'Scarves': i18n.category_scarves(),
      'Sunglasses': i18n.category_sunglasses(),
      'Wallets': i18n.category_wallets(),
      'Hair Accessories': i18n.category_hairAccessories(),
      'Ties': i18n.category_ties(),
      'Cufflinks': i18n.category_cufflinks(),
      'Backpacks': i18n.category_backpacks()
    };
    return translations[name] || name;
  }
  
  // Use real category data from server with level-aware navigation
  const category = data.category || { name: 'Categories', slug: 'categories', description: 'Browse all categories' };
  const resolution = data.resolution;
  const pillCategories = data.pillCategories || [];        // Level-appropriate categories for pills
  const dropdownCategories = data.dropdownCategories || []; // Level-appropriate categories for dropdown
  const products = data.products || [];
  const sellers = data.sellers || [];
  const breadcrumbs = data.breadcrumbs || [];
  
  // Backward compatibility for existing logic (deprecated)
  const subcategories = dropdownCategories;
  const level3Categories = pillCategories;
  
  // Performance-optimized product transformation using $state.raw()
  // Transform products for ProductCard component with better performance for large arrays
  let rawDisplayProducts = $state.raw<Product[]>([]);
  
  // Initialize displayProducts on component mount and data changes
  $effect(() => {
    rawDisplayProducts = products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      price: p.price,
      images: p.product_images?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)).map((img: any) => img.image_url) || [],
      brand: p.brand,
      size: p.size,
      condition: p.condition,
      category: p.categories?.name || category.name,
      main_category_name: resolution.l1?.name || category.name,
      subcategory_name: resolution.l2?.name || null,
      specific_category_name: resolution.l3?.name || null,
      sellerId: p.seller_id,
      sellerName: p.profiles?.username || 'Unknown',
      sellerAvatar: p.profiles?.avatar_url || '',
      sellerRating: 0, // Default rating
      createdAt: p.created_at,
      location: p.location || p.profiles?.location || ''
    }));
  });
  
  let displayProducts = $derived(rawDisplayProducts);
  
  // Professional neutral background for all categories
  const categoryBgColor = 'bg-white';
  
  let sortBy = $state('popular');
  let showFilters = $state(false);
  let searchQuery = $state('');
  let showMegaMenu = $state(false);
  let showSearchDropdown = $state(false);
  let activeDropdownTab = $state('categories');

  // Search dropdown data
  let searchDropdownCategories = $state<any[]>([]);
  let searchDropdownSellers = $state<any[]>([]);
  let searchDropdownCollections = $state<any[]>([]);
  
  // Seller quick view modal state
  let selectedSeller = $state<any>(null);
  let showSellerModal = $state(false);
  
  function openSellerModal(seller: any) {
    selectedSeller = seller;
    showSellerModal = true;
  }
  
  function closeSellerModal() {
    showSellerModal = false;
    selectedSeller = null;
  }
  
  // Filter states
  let selectedSizes = $state<string[]>([]);
  let selectedBrands = $state<string[]>([]);
  let selectedConditions = $state<string[]>([]);
  let priceRange = $state({ min: 0, max: 500 });
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Louis Vuitton'];
  const conditions = [
    { value: 'new', label: i18n.condition_newWithTags() },
    { value: 'like-new', label: i18n.condition_likeNew() },
    { value: 'good', label: i18n.condition_good() },
    { value: 'fair', label: i18n.condition_fair() }
  ];
  
  // Performance-optimized filtering using $state.raw() for large product arrays
  let rawFilteredProducts = $state.raw<Product[]>([]);
  
  // Simple client-side filtering for search and additional filters
  // Category filtering is now handled server-side via hierarchical queries
  $effect(() => {
    rawFilteredProducts = displayProducts.filter(p => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesBrand = p.brand?.toLowerCase().includes(query) || false;
        const matchesDescription = p.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesBrand && !matchesDescription) return false;
      }
      
      // Additional filters (when filters panel is used)
      if (selectedSizes.length && !selectedSizes.includes(p.size)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand || '')) return false;
      if (selectedConditions.length && !selectedConditions.includes(p.condition)) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      return true;
    });
  });
  
  let filteredProducts = $derived(rawFilteredProducts);
  
  // Clear all client-side filters
  function clearAllFilters() {
    selectedSizes = [];
    selectedBrands = [];
    selectedConditions = [];
    priceRange = { min: 0, max: 500 };
  }

  function toggleSize(size: string) {
    if (selectedSizes.includes(size)) {
      selectedSizes = selectedSizes.filter(s => s !== size);
    } else {
      selectedSizes = [...selectedSizes, size];
    }
  }
  
  function toggleCondition(condition: string) {
    if (selectedConditions.includes(condition)) {
      selectedConditions = selectedConditions.filter(c => c !== condition);
    } else {
      selectedConditions = [...selectedConditions, condition];
    }
  }
  
  function clearFilters() {
    selectedSizes = [];
    selectedBrands = [];
    selectedConditions = [];
    priceRange = { min: 0, max: 500 };
  }
  
  function handleSearch(query: string) {
    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query)}&category=${resolution.l1?.slug || ''}`);
    }
  }

  function handleMegaMenuToggle() {
    showMegaMenu = !showMegaMenu;
  }

  // Search dropdown event handlers
  function handleDropdownCategorySelect(category: any) {
    if (category.level === 1) {
      goto(`/category/${category.key}`);
    } else if (category.level === 2) {
      goto(getCategoryUrl(category.parentKey, category.key));
    } else if (category.level === 3) {
      const parentKeys = category.parentKey?.split('-');
      goto(getCategoryUrl(parentKeys?.[0], parentKeys?.[1], category.key));
    }
    showSearchDropdown = false;
  }

  function handleDropdownCollectionSelect(collection: any) {
    // Handle collection selection based on key
    if (collection.key.startsWith('category=')) {
      const categoryKey = collection.key.replace('category=', '');
      goto(`/category/${categoryKey}`);
    } else if (collection.key.startsWith('condition=')) {
      const conditionKey = collection.key.replace('condition=', '');
      // Add condition filter to current category page
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('condition', conditionKey);
      goto(currentUrl.pathname + currentUrl.search);
    } else if (collection.key === 'under25') {
      // Add price filter to current category page
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('max_price', '25');
      goto(currentUrl.pathname + currentUrl.search);
    } else if (collection.key === 'price-low' || collection.key === 'newest') {
      // Add sort filter to current category page
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('sort', collection.key);
      goto(currentUrl.pathname + currentUrl.search);
    }
    showSearchDropdown = false;
  }

  function handleDropdownSellerSelect(seller: any) {
    // Navigate to seller profile
    goto(`/profile/${seller.username}`);
  }


  // Helper function to generate clean category URLs
  function getCategoryUrl(l1Slug: string, l2Slug?: string, l3Slug?: string): string {
    // Remove parent prefixes from slugs to create clean URLs
    const cleanL2 = l2Slug ? l2Slug.replace(new RegExp(`^${l1Slug}-`), '') : '';
    const cleanL3 = l3Slug && l2Slug ? l3Slug.replace(new RegExp(`^${l2Slug}-`), '') : l3Slug || '';
    
    let url = `/category/${l1Slug}`;
    if (cleanL2) url += `/${cleanL2}`;
    if (cleanL3) url += `/${cleanL3}`;
    return url;
  }
  
  // Generate page title based on category hierarchy
  let pageTitle = $derived(data.meta?.title || `${translateCategoryName(category.name)} - Driplo`);
  let pageDescription = $derived(data.meta?.description || category.description || `Shop ${category.name} items on Driplo`);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  {#if data.meta?.canonical}
    <link rel="canonical" href={data.meta.canonical} />
  {/if}
  
  <!-- JSON-LD Breadcrumbs -->
  {#if data.breadcrumbsJsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(data.breadcrumbsJsonLd)}</script>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Loading overlay when navigating -->
  {#if navigating}
    <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black mx-auto mb-2"></div>
        <p class="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  {/if}

  <!-- Breadcrumb -->
  <div class="bg-white">
    <div class="px-2 sm:px-4 lg:px-6 py-3">
      <Breadcrumb items={breadcrumbs.map(b => ({ label: translateCategoryName(b.name), href: b.href }))} />
    </div>
  </div>

  <!-- Category Section with Brand Colors -->
  <div class="border-b {categoryBgColor}">
    <div class="px-2 sm:px-4 lg:px-6 py-3">


      <!-- Top Sellers -->
      {#if sellers.length > 0}
        <div class="flex justify-center items-center gap-3 overflow-x-auto scrollbar-hide pb-6">
          {#each sellers as seller}
            <button
              onclick={() => openSellerModal(seller)}
              class="flex flex-col items-center group shrink-0 hover:scale-105 transition-transform cursor-pointer"
              title="{seller.username} - {seller.itemCount} {i18n.category_itemsCount()}"
            >
              <div class="relative">
                <img 
                  src={seller.avatar_url} 
                  alt={seller.username} 
                  class="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-gray-300 shadow-sm transition-colors" 
                />
                {#if seller.itemCount === 1}
                  <span class="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-white">{i18n.condition_new().toUpperCase()}</span>
                {/if}
              </div>
              <span class="text-xs mt-1 font-medium text-gray-700 group-hover:text-gray-900">{seller.username}</span>
              <span class="text-xs text-gray-500">{seller.itemCount} {i18n.category_itemsCount()}</span>
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Search Bar with Integrated Design -->
      <div class="pb-2">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <IntegratedSearchBar
              bind:searchValue={searchQuery}
              onSearch={handleSearch}
              placeholder={i18n.category_searchPlaceholder()}
              class="w-full"
            >
              {#snippet leftSection()}
                <button
                  onclick={handleMegaMenuToggle}
                  class="h-12 px-3 rounded-l-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
                  aria-label={i18n.category_categories()}
                >
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span class="text-sm text-gray-600 hidden sm:inline">{i18n.category_categories()}</span>
                </button>
              {/snippet}

              {#snippet rightSection()}
                <div class="relative">
                  <button
                    onclick={() => showSearchDropdown = !showSearchDropdown}
                    class="h-12 px-4 rounded-r-xl border-0 bg-transparent hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-600 border-l border-gray-200"
                    aria-label="Open search options"
                  >
                    <svg class="w-4 h-4 transition-transform {showSearchDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {#if showSearchDropdown}
                    <div class="absolute top-full left-0 right-0 mt-1 z-50">
                      <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        <div class="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
                          <button
                            onclick={() => activeDropdownTab = 'categories'}
                            class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                          >
                            {i18n.search_categories ? i18n.search_categories() : 'Categories'}
                          </button>
                          <button
                            onclick={() => activeDropdownTab = 'sellers'}
                            class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'sellers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                          >
                            {i18n.search_topSellers()}
                          </button>
                        </div>

                        {#if activeDropdownTab === 'categories'}
                          <div class="grid grid-cols-2 gap-3">
                            {#each dropdownCategories as cat}
                              <button
                                onclick={() => {
                                  goto(getCategoryUrl(resolution.l1?.slug || '', cat.slug));
                                  showSearchDropdown = false;
                                }}
                                class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
                              >
                                <div class="flex-1 min-w-0">
                                  <span class="font-medium text-gray-900 group-hover:text-blue-600 truncate block">{translateSubcategoryName(cat.name)}</span>
                                  {#if cat.productCount}
                                    <span class="text-xs text-gray-500">({cat.productCount})</span>
                                  {/if}
                                </div>
                              </button>
                            {/each}
                          </div>
                        {:else if activeDropdownTab === 'sellers'}
                          <div class="space-y-3">
                            {#each searchDropdownSellers.slice(0, 5) as seller}
                              <button
                                onclick={() => {
                                  goto(`/profile/${seller.username}`);
                                  showSearchDropdown = false;
                                }}
                                class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
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
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/snippet}
            </IntegratedSearchBar>
            
            <!-- Category Mega Menu -->
            {#if showMegaMenu}
              <!-- Backdrop -->
              <button 
                class="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-default"
                onclick={() => showMegaMenu = false}
                aria-label="Close menu"
                tabindex="-1"
              ></button>

              <!-- Level-Aware Dropdown Menu -->
              <div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2">
                <div class="p-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {#each dropdownCategories as cat}
                      <a
                        href={(() => {
                          if (resolution.isVirtual) {
                            // Virtual category → Gender dropdown → Navigate to /category/{gender}/{virtual_category}
                            return `/category/${cat.slug}/${resolution.virtualCategory?.slug || ''}`;
                          } else if (resolution.level === 1) {
                            // L1 page → L2 dropdown → Navigate to /category/{l1}/{l2}
                            return getCategoryUrl(resolution.l1?.slug || '', cat.slug);
                          } else if (resolution.level === 2) {
                            // L2 page → L3 dropdown → Navigate to /category/{l1}/{l2}/{l3}
                            return getCategoryUrl(resolution.l1?.slug || '', resolution.l2?.slug || '', cat.slug);
                          }
                          return '#';
                        })()}
                        onclick={() => showMegaMenu = false}
                        class="text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors block no-underline"
                        data-sveltekit-preload-data="hover"
                      >
                        <span class="text-sm font-medium text-gray-900">
                          {translateSubcategoryName(cat.name)}
                        </span>
                        {#if cat.productCount}
                          <span class="text-xs text-gray-500 block">({cat.productCount})</span>
                        {/if}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Level-Aware Category Navigation Pills -->
      {#if pillCategories.length > 0}
        <div class="space-y-3">
          <div class="flex justify-center">
            <div class="flex overflow-x-auto scrollbar-hide gap-2 px-4">
              {#each pillCategories.filter(cat => cat.productCount > 0).slice(0, 12) as cat}
                <FilterPill 
                  variant="primary" 
                  onClick={() => {
                    let targetUrl = '';
                    
                    if (resolution.isVirtual) {
                      // Virtual category pills → Navigate to /category/{gender}/{virtual_category}
                      // Example: /category/clothing + click "Women" → /category/women/clothing
                      targetUrl = `/category/${cat.slug}/${resolution.virtualCategory?.slug || ''}`;
                    } else if (resolution.level === 1) {
                      // L1 page → L2 pills → Navigate to /category/{l1}/{l2}
                      targetUrl = getCategoryUrl(resolution.l1?.slug || '', cat.slug);
                    } else if (resolution.level === 2) {
                      // L2 page → L3 pills → Navigate to /category/{l1}/{l2}/{l3}
                      targetUrl = getCategoryUrl(resolution.l1?.slug || '', resolution.l2?.slug || '', cat.slug);
                    }
                    
                    if (targetUrl) goto(targetUrl);
                  }}
                >
                  {#snippet children()}
                    {translateSubcategoryName(cat.name)}
                    <span class="text-xs opacity-75">({cat.productCount})</span>
                  {/snippet}
                </FilterPill>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="px-2 sm:px-4 lg:px-6 py-3">
    <!-- Sort and Filter Bar -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-600">
        {filteredProducts.length} {i18n.category_itemsCount()}
      </p>
      <div class="flex items-center space-x-2">
        <select 
          bind:value={sortBy}
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="popular">{i18n.filter_mostPopular()}</option>
          <option value="newest">{i18n.filter_newest()}</option>
          <option value="price-low">{i18n.filter_priceLowToHigh()}</option>
          <option value="price-high">{i18n.filter_priceHighToLow()}</option>
        </select>
        <!-- Filter Toggle -->
        <Button 
          variant={showFilters ? "primary" : "outline"} 
          size="sm"
          onclick={() => showFilters = !showFilters}
          class="flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="hidden sm:inline">{i18n.category_filters()}</span>
          <span class="sm:hidden">{i18n.category_filters()}</span>
          {#if selectedSizes.length > 0 || selectedBrands.length > 0 || selectedConditions.length > 0}
            <span class="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedSizes.length + selectedBrands.length + selectedConditions.length}
            </span>
          {/if}
        </Button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Desktop Filters Sidebar -->
      {#if showFilters}
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="bg-white rounded-lg p-4 sticky top-24 shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">{i18n.search_filters()}</h3>
              <button onclick={clearFilters} class="text-sm text-gray-500 hover:text-gray-700">
                {i18n.category_clearAll()}
              </button>
            </div>
            
            <!-- Sizes -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3">{i18n.filter_size()}</h4>
              <div class="grid grid-cols-3 gap-2">
                {#each sizes as size}
                  <button
                    onclick={() => toggleSize(size)}
                    class="px-3 py-1 text-sm border rounded-lg transition-colors
                      {selectedSizes.includes(size) 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Condition -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3">{i18n.filter_condition()}</h4>
              <div class="space-y-2">
                {#each conditions as condition}
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedConditions.includes(condition.value)}
                      onchange={() => toggleCondition(condition.value)}
                      class="mr-2 rounded-sm text-blue-600"
                    />
                    <span class="text-sm text-gray-700">{condition.label}</span>
                  </label>
                {/each}
              </div>
            </div>
            
            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="font-medium text-sm mb-3">{i18n.filter_priceRange()}</h4>
              <div class="flex items-center space-x-2">
                <input 
                  type="number" 
                  bind:value={priceRange.min}
                  placeholder="{i18n.search_min()}"
                  class="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm"
                />
                <span class="text-gray-500">-</span>
                <input 
                  type="number" 
                  bind:value={priceRange.max}
                  placeholder="{i18n.search_max()}"
                  class="w-24 px-2 py-1 border border-gray-300 rounded-sm text-sm"
                />
              </div>
            </div>
          </div>
        </aside>
      {/if}
      
      <!-- Products Grid -->
      <div class="flex-1">
        <div class="grid grid-cols-2 sm:grid-cols-3 {showFilters ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4">
          {#each filteredProducts as product}
            <ProductCard 
              {product}
              onclick={() => goto(getProductUrl(product))}
              translations={{
                size: i18n.product_size(),
                newSeller: i18n.trending_newSeller(),
                unknownSeller: i18n.seller_unknown(),
                currency: i18n.common_currency(),
                addToFavorites: i18n.product_addToFavorites(),
                new: i18n.condition_new(),
                likeNew: i18n.condition_likeNew(),
                good: i18n.condition_good(),
                fair: i18n.condition_fair(),
                formatPrice: (price: number) => formatPrice(price),
                categoryTranslation: translateSubcategoryName
              }}
            />
          {/each}
        </div>
        
        <!-- No products message -->
        {#if filteredProducts.length === 0}
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg mb-4">No items found in this category</p>
            <Button onclick={clearAllFilters}>Clear Filters</Button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
      <div class="flex justify-center mt-8 space-x-2">
        {#if data.pagination.hasPrevPage}
          <Button variant="outline" onclick={() => goto(`${page.url.pathname}?page=${data.pagination.page - 1}`)}>
            Previous
          </Button>
        {/if}
        
        <span class="flex items-center px-4 text-sm text-gray-600">
          Page {data.pagination.page} of {data.pagination.totalPages}
        </span>
        
        {#if data.pagination.hasNextPage}
          <Button variant="outline" onclick={() => goto(`${page.url.pathname}?page=${data.pagination.page + 1}`)}>
            Next
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Mobile Filter Drawer -->
{#if showFilters}
  <div class="lg:hidden fixed inset-0 z-50">
    <!-- Backdrop -->
    <button 
      class="fixed inset-0 bg-black bg-opacity-50"
      onclick={() => showFilters = false}
      aria-label="Close filters"
    ></button>
    
    <!-- Drawer -->
    <div class="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl h-[calc(90vh-4rem)] flex flex-col shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold">{i18n.category_filters()}</h2>
        <button onclick={() => showFilters = false} class="p-1" aria-label="Close filters">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Sizes -->
        <div>
          <h4 class="font-medium text-sm mb-3">{i18n.filter_size()}</h4>
          <div class="grid grid-cols-3 gap-2">
            {#each sizes as size}
              <button
                onclick={() => toggleSize(size)}
                class="px-3 py-2 text-sm border rounded-lg transition-colors duration-200 font-medium
                  {selectedSizes.includes(size) 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                {size}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Condition -->
        <div>
          <h4 class="font-medium text-sm mb-3">{i18n.filter_condition()}</h4>
          <div class="space-y-2">
            {#each conditions as condition}
              <button
                onclick={() => toggleCondition(condition.value)}
                class="w-full py-3 px-3 text-sm rounded-lg border text-left transition-colors duration-200 font-medium
                  {selectedConditions.includes(condition.value)
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
              >
                {condition.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Price Range -->
        <div>
          <h4 class="font-medium text-sm mb-3">{i18n.filter_priceRange()}</h4>
          <div class="flex items-center space-x-2">
            <input 
              type="number" 
              bind:value={priceRange.min}
              placeholder={i18n.search_min()}
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span class="text-gray-500">-</span>
            <input 
              type="number" 
              bind:value={priceRange.max}
              placeholder={i18n.search_max()}
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      
      <!-- Footer Actions -->
      <div class="flex space-x-3 p-4 border-t border-gray-100">
        <Button onclick={clearFilters} variant="outline" class="flex-1">{i18n.category_clearAll()}</Button>
        <Button onclick={() => showFilters = false} class="flex-1">{i18n.filter_apply()}</Button>
      </div>
    </div>
  </div>
{/if}

<!-- Seller Quick View Modal -->
{#if selectedSeller}
  <SellerQuickView
    seller={selectedSeller}
    bind:isOpen={showSellerModal}
    onClose={closeSellerModal}
    onViewProfile={(sellerId) => goto(`/profile/${sellerId}`)}
  />
{/if}

<!-- Bottom Navigation -->
<BottomNav 
  currentPath={page.url.pathname}
  isNavigating={!!navigating}
  navigatingTo={navigating?.to?.url.pathname}
  unreadMessageCount={unreadMessageCount()}
  profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
  labels={{
    home: i18n.nav_home(),
    search: i18n.nav_search(),
    sell: i18n.nav_sell(),
    profile: i18n.nav_profile(),
    messages: i18n.nav_messages()
  }}
/>

<style>
  /* Hide scrollbar for horizontal scroll */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
