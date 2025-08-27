<script lang="ts">
  import { ProductCard, Button, SearchBar, SearchDropdown, SmartStickySearch, MegaMenu, CategorySidebar, ProductCardSkeleton, BottomNav, type Product, type CategoryData } from '@repo/ui';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
  import { goto } from '$app/navigation';
  import { page, navigating } from '$app/stores';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { translateCategory, getCategoryIcon } from '$lib/categories/mapping';
  import type { Database } from '@repo/database';
  
  type Category = Database['public']['Tables']['categories']['Row'];
  
  interface Props {
    data: PageData;
  }
  
  // Search and filter states
  let searchQuery = $state('');
  let selectedLevel1 = $state<string | null>(null); // Level 1: Gender (women/men/kids/unisex)
  let selectedLevel2 = $state<string | null>(null); // Level 2: Product Type (clothing/shoes/bags/accessories)
  let selectedLevel3 = $state<string | null>(null); // Level 3: Specific Item (t-shirts/dresses/sneakers)
  let selectedSize = $state('all');
  let selectedBrand = $state('all');
  let selectedCondition = $state('all');
  let priceMin = $state('');
  let priceMax = $state('');
  let sortBy = $state('relevance');
  let showFilters = $state(false);
  let showMegaMenu = $state(false);
  let isLoading = $state(false);
  let isSearching = $state(false);
  
  // Compact filter bar states
  let compactPriceRange = $state('all');
  let compactCondition = $state('all');
  
  // Detect cross-gender category searches (accessories, clothing, shoes, bags across all genders)
  let isCrossGenderSearch = $derived(
    selectedLevel1 && ['accessories', 'clothing', 'shoes', 'bags'].includes(selectedLevel1)
  );

  // For backward compatibility with existing components
  let selectedMainCategory = $derived(isCrossGenderSearch ? null : selectedLevel1);
  let selectedSubcategory = $derived(selectedLevel2);
  
  let { data }: Props = $props();

  // Initialize search state from server data and URL parameters
  $effect(() => {
    if (data.searchQuery) {
      searchQuery = data.searchQuery;
    }
    if (data.filters) {
      if (data.filters.category) {
        selectedLevel1 = data.filters.category;
      }
      if (data.filters.subcategory) {
        selectedLevel2 = data.filters.subcategory;
      }
      if (data.filters.specific) {
        selectedLevel3 = data.filters.specific;
      }
      if (data.filters.size) selectedSize = data.filters.size;
      if (data.filters.brand) selectedBrand = data.filters.brand;
      if (data.filters.condition) selectedCondition = data.filters.condition;
      if (data.filters.minPrice) priceMin = data.filters.minPrice;
      if (data.filters.maxPrice) priceMax = data.filters.maxPrice;
      if (data.filters.sortBy) sortBy = data.filters.sortBy;
    }
  });
  
  // Build category hierarchy from database categories
  const categoryHierarchy = $derived((() => {
    if (!data.categoryHierarchy || Object.keys(data.categoryHierarchy).length === 0) {
      return {
        level1: [],
        level2: {},
        level3: {}
      };
    }
    
    const hierarchy = {
      level1: [] as Array<{key: string, name: string, icon: string, id: string}>,
      level2: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>,
      level3: {} as Record<string, Array<{key: string, name: string, icon: string, id: string}>>
    };
    
    // Process the hierarchy from server
    Object.entries(data.categoryHierarchy).forEach(([slug, catData]: [string, any]) => {
      // Add Level 1 category
      hierarchy.level1.push({
        key: slug,
        name: translateCategory(catData.name),
        icon: getCategoryIcon(catData.name),
        id: catData.id
      });
      
      // Process Level 2 categories
      if (catData.level2) {
        hierarchy.level2[slug] = [];
        
        Object.entries(catData.level2).forEach(([l2Slug, l2Data]: [string, any]) => {
          // Extract clean slug (remove gender prefix)
          const cleanSlug = l2Slug.replace(`${slug}-`, '').replace('-new', '');
          
          hierarchy.level2[slug].push({
            key: cleanSlug,
            name: translateCategory(l2Data.name),
            icon: getCategoryIcon(l2Data.name),
            id: l2Data.id
          });
          
          // Process Level 3 categories
          if (l2Data.level3 && Array.isArray(l2Data.level3)) {
            const level3Key = `${slug}-${cleanSlug}`;
            hierarchy.level3[level3Key] = l2Data.level3.map((l3: any) => ({
              key: l3.slug.replace(`${slug}-`, ''),
              name: translateCategory(l3.name),
              icon: getCategoryIcon(l3.name),
              id: l3.id
            }));
          }
        });
      }
    });
    
    // Sort Level 1 in preferred order
    const order = ['women', 'men', 'kids', 'unisex'];
    hierarchy.level1.sort((a, b) => {
      const aIndex = order.indexOf(a.key);
      const bIndex = order.indexOf(b.key);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    return hierarchy;
  })());
  
  // Transform category hierarchy for CategorySidebar component
  const categoryData = $derived<CategoryData>((() => {
    const data: CategoryData = {};
    
    // Build CategoryData format from our hierarchy
    categoryHierarchy.level1.forEach(l1 => {
      const subcategories = categoryHierarchy.level2[l1.key] || [];
      
      data[l1.key] = {
        name: l1.name,
        icon: l1.icon,
        subcategories: subcategories.map(l2 => ({
          name: l2.name,
          icon: l2.icon
        }))
      };
    });
    
    return data;
  })());

  // Smart filter data based on category
  const smartFilterData = {
    women: {
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      brands: ['Zara', 'H&M', 'Mango', 'COS', 'ASOS', 'Urban Outfitters', 'Free People', 'Other']
    },
    men: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      brands: ['Nike', 'Adidas', 'Levi\'s', 'Uniqlo', 'Gap', 'Patagonia', 'North Face', 'Other']
    },
    kids: {
      sizes: ['0-3m', '3-6m', '6-12m', '12-18m', '18-24m', '2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'],
      brands: ['Gap Kids', 'H&M Kids', 'Zara Kids', 'Nike', 'Adidas', 'Carter\'s', 'OshKosh', 'Other']
    },
    shoes: {
      sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
      brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Vans', 'Converse', 'Dr. Martens', 'Other']
    },
    bags: {
      sizes: ['Mini', 'Small', 'Medium', 'Large', 'XL'],
      brands: ['Coach', 'Michael Kors', 'Kate Spade', 'Longchamp', 'Fjällräven', 'Herschel', 'JanSport', 'Other']
    },
    default: {
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Uniqlo', 'Gap', 'Other']
    }
  };
  
  // Get smart filters based on selected category - no function calls in $derived
  const currentFilters = $derived(smartFilterData[selectedMainCategory || 'default'] || smartFilterData.default);
  
  const sizes = $derived(currentFilters.sizes);
  const brands = $derived(currentFilters.brands);
  const conditions = ['new', 'like-new', 'good', 'fair'];
  
  // Transform server products to component format - no client-side filtering needed
  const displayProducts = $derived((() => {
    const products = (data.products || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      // Fix: Server sends 'images' array directly
      images: product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'],
      product_images: product.product_images,
      brand: product.brand,
      size: product.size,
      condition: product.condition as Product['condition'],
      category: product.category?.name || 'Uncategorized',
      // Use the proper category hierarchy from server
      main_category_name: product.main_category_name, // This should be Men/Women/Kids
      category_name: product.main_category_name || product.category_name, // Use main category
      subcategory_name: product.subcategory_name, // This should be Tops/T-Shirts/etc
      sellerId: product.seller_id || product.seller?.id,
      sellerName: product.seller?.username || 'Unknown',
      sellerRating: product.seller?.rating ? Number(product.seller.rating) : null,
      sellerAvatar: product.seller?.avatar_url,
      sellerAccountType: product.sellerAccountType,
      createdAt: product.created_at,
      location: product.location || 'Unknown'
    }));

    // All filtering is handled server-side via navigation
    // Return products as-is from server
    return products;
  })());
  
  let activeFiltersCount = $derived((() => {
    let count = 0;
    if (selectedMainCategory) count++;
    if (selectedSubcategory) count++;
    if (selectedSize !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (priceMin || priceMax) count++;
    return count;
  })());
  
  
  async function clearFilters() {
    selectedLevel1 = null;
    selectedLevel2 = null;
    selectedLevel3 = null;
    selectedSize = 'all';
    selectedBrand = 'all';
    selectedCondition = 'all';
    priceMin = '';
    priceMax = '';
    
    // Navigate to clear all filters on server
    const url = new URL('/search', window.location.origin);
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery.trim());
    }
    await goto(url.pathname + url.search);
  }
  
  async function handleSearch(query: string) {
    isSearching = true;
    
    // Build URL with search parameters for server-side filtering
    const url = new URL('/search', window.location.origin);
    if (query.trim()) {
      url.searchParams.set('q', query.trim());
    }
    
    // Preserve existing filters
    if (selectedMainCategory) url.searchParams.set('category', selectedMainCategory);
    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
    if (priceMin) url.searchParams.set('min_price', priceMin);
    if (priceMax) url.searchParams.set('max_price', priceMax);
    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
    
    // Navigate to trigger server-side load
    await goto(url.pathname + url.search);
    isSearching = false;
  }
  
  function handleFilter() {
    // Toggle filter panel
    showFilters = !showFilters;
  }
  
  function handleOpenMegaMenu() {
    showMegaMenu = true;
  }
  
  function handleCategorySelectFromMega(category: string | null) {
    selectedMainCategory = category;
    selectedSubcategory = null;
    // Keep the menu open when selecting a category
    // Don't change showMegaMenu here
  }
  
  function handleSubcategorySelectFromMega(subcategory: string | null, category: string) {
    selectedMainCategory = category;
    selectedSubcategory = subcategory;
    // Only close when selecting an actual subcategory (not null)
    if (subcategory !== null) {
      showMegaMenu = false;
    }
  }
  
  function handleFilterRemove(filterType: string) {
    switch(filterType) {
      case 'size':
        selectedSize = 'all';
        break;
      case 'brand':
        selectedBrand = 'all';
        break;
      case 'condition':
        selectedCondition = 'all';
        break;
      case 'priceRange':
        priceMin = '';
        priceMax = '';
        break;
    }
  }
  
  function handleMobileFilters() {
    // Toggle mobile filter drawer (size, brand, condition, price)
    showFilters = !showFilters;
  }
  
  // Compact filter bar handlers
  async function handleCompactSortChange(value: string) {
    sortBy = value;
    
    // Navigate to apply sort on server
    const url = new URL('/search', window.location.origin);
    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
    if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
    if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
    if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
    if (priceMin) url.searchParams.set('min_price', priceMin);
    if (priceMax) url.searchParams.set('max_price', priceMax);
    if (value !== 'relevance') url.searchParams.set('sort', value);
    
    await goto(url.pathname + url.search);
  }
  
  function handleCompactPriceRangeChange(value: string) {
    compactPriceRange = value;
    // Convert to min/max price values
    switch (value) {
      case 'under-20':
        priceMin = '';
        priceMax = '20';
        break;
      case '20-50':
        priceMin = '20';
        priceMax = '50';
        break;
      case '50-100':
        priceMin = '50';
        priceMax = '100';
        break;
      case '100-plus':
        priceMin = '100';
        priceMax = '';
        break;
      default:
        priceMin = '';
        priceMax = '';
    }
  }
  
  function handleCompactConditionChange(value: string) {
    compactCondition = value;
    selectedCondition = value;
  }

  // Quick filters for sticky search (most popular)
  const stickyQuickFilters = [
    { label: i18n.filter_under20(), value: 'price_under_20', style: 'price' },
    { label: i18n.filter_newToday(), value: 'new_today', style: 'new' },
    { label: `${i18n.product_size()} M`, value: 'size_M', style: 'size' },
    { label: `${i18n.product_size()} L`, value: 'size_L', style: 'size' }
  ];

  function handleStickyFilterClick(filterValue: string) {
    const url = new URL('/search', window.location.origin);
    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
    
    if (filterValue.startsWith('price_under_')) {
      const price = filterValue.replace('price_under_', '');
      url.searchParams.set('max_price', price);
    } else if (filterValue.startsWith('size_')) {
      const size = filterValue.replace('size_', '');
      url.searchParams.set('size', size);
    } else if (filterValue === 'new_today') {
      url.searchParams.set('sort', 'newest');
    }
    
    goto(url.pathname + url.search);
  }
</script>

<svelte:head>
  <title>Search - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
  
  <!-- Clean Search Section with Dynamic Pills -->
  <div id="search-main-section" class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <!-- Main Search Bar with Dropdown -->
      <div class="relative mb-4">
        <SearchDropdown 
          bind:value={searchQuery}
          placeholder={i18n.search_placeholder()}
          onSearch={handleSearch}
        />
        {#if activeFiltersCount > 0}
          <div class="absolute top-2 right-2 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center pointer-events-none z-10">
            {activeFiltersCount}
          </div>
        {/if}
      </div>
      <!-- Level 1: Gender Categories - Always visible -->
      <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
        <button
          onclick={async () => {
            selectedLevel1 = null;
            selectedLevel2 = null;
            selectedLevel3 = null;
            // Navigate to load all products from server
            const url = new URL('/search', window.location.origin);
            if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
            await goto(url.pathname + url.search);
          }}
          class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all flex items-center gap-1
            {selectedLevel1 === null 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          <span class="text-base">🌍</span>
          <span>{i18n.search_all()}</span>
        </button>
        {#each categoryHierarchy.level1 as level1Item}
          <button
            onclick={async () => {
              if (selectedLevel1 === level1Item.key) {
                // Deselect if clicking same category
                selectedLevel1 = null;
                selectedLevel2 = null;
                selectedLevel3 = null;
                const url = new URL('/search', window.location.origin);
                if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                await goto(url.pathname + url.search);
              } else {
                // Select new Level 1, reset others
                selectedLevel1 = level1Item.key;
                selectedLevel2 = null;
                selectedLevel3 = null;
                // Navigate to load category-specific products from server
                const url = new URL('/search', window.location.origin);
                if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                url.searchParams.set('category', level1Item.key);
                await goto(url.pathname + url.search);
              }
            }}
            class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel1 === level1Item.key
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            <span class="text-base">{level1Item.icon}</span>
            <span>{level1Item.name}</span>
          </button>
        {/each}
      </div>
      
      <!-- Level 2: Product Type Categories - Shows when Level 1 selected -->
      {#if selectedLevel1 && categoryHierarchy.level2[selectedLevel1]}
        <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
          <button
            onclick={async () => {
              selectedLevel2 = null;
              selectedLevel3 = null;
              // Navigate to show all products in this Level 1 category
              const url = new URL('/search', window.location.origin);
              if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
              url.searchParams.set('category', selectedLevel1);
              await goto(url.pathname + url.search);
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel2 === null 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            <span>Всички</span>
          </button>
          {#each categoryHierarchy.level2[selectedLevel1] as level2Item}
            <button
              onclick={async () => {
                if (selectedLevel2 === level2Item.key) {
                  selectedLevel2 = null;
                  selectedLevel3 = null;
                  // Navigate back to just Level 1
                  const url = new URL('/search', window.location.origin);
                  if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                  url.searchParams.set('category', selectedLevel1);
                  await goto(url.pathname + url.search);
                } else {
                  selectedLevel2 = level2Item.key;
                  selectedLevel3 = null;
                  // Navigate with both level1 and level2 filters
                  const url = new URL('/search', window.location.origin);
                  if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                  url.searchParams.set('category', selectedLevel1);
                  url.searchParams.set('subcategory', level2Item.key);
                  await goto(url.pathname + url.search);
                }
              }}
              class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
                {selectedLevel2 === level2Item.key
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
            >
              <span class="text-sm">{level2Item.icon}</span>
              <span>{level2Item.name}</span>
            </button>
          {/each}
        </div>
      {:else if !selectedLevel1 || isCrossGenderSearch}
        <!-- Quick access to major categories when no Level 1 is selected OR during cross-gender search -->
        <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
          <button
            onclick={async () => {
              // Show ALL Accessories across all genders
              const url = new URL('/search', window.location.origin);
              if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
              url.searchParams.set('category', 'accessories');
              await goto(url.pathname + url.search);
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel1 === 'accessories'
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            <span class="text-sm">💍</span>
            <span>{i18n.category_accessoriesType()}</span>
          </button>
          <button
            onclick={async () => {
              // Show ALL Clothing across all genders
              const url = new URL('/search', window.location.origin);
              if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
              url.searchParams.set('category', 'clothing');
              await goto(url.pathname + url.search);
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel1 === 'clothing'
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            <span class="text-sm">👔</span>
            <span>{i18n.category_clothing()}</span>
          </button>
          <button
            onclick={async () => {
              // Show ALL Shoes across all genders
              const url = new URL('/search', window.location.origin);
              if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
              url.searchParams.set('category', 'shoes');
              await goto(url.pathname + url.search);
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel1 === 'shoes'
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            <span class="text-sm">👟</span>
            <span>{i18n.category_shoesType()}</span>
          </button>
          <button
            onclick={async () => {
              // Show ALL Bags across all genders
              const url = new URL('/search', window.location.origin);
              if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
              url.searchParams.set('category', 'bags');
              await goto(url.pathname + url.search);
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
              {selectedLevel1 === 'bags'
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            <span class="text-sm">👜</span>
            <span>{i18n.category_bagsType()}</span>
          </button>
        </div>
      {/if}
      
      <!-- Level 3: Specific Items - Shows when Level 2 selected -->
      {#if selectedLevel1 && selectedLevel2 && categoryHierarchy.level3[`${selectedLevel1}-${selectedLevel2}`]}
        <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
          <button
            onclick={() => {
              selectedLevel3 = null;
            }}
            class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
              {selectedLevel3 === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}"
          >
            <span>Всички</span>
          </button>
          {#each categoryHierarchy.level3[`${selectedLevel1}-${selectedLevel2}`] as level3Item}
            <button
              onclick={async () => {
                if (selectedLevel3 === level3Item.key) {
                  selectedLevel3 = null;
                } else {
                  selectedLevel3 = level3Item.key;
                  // Navigate with all 3 levels
                  const url = new URL('/search', window.location.origin);
                  if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                  url.searchParams.set('category', selectedLevel1);
                  url.searchParams.set('subcategory', selectedLevel2);
                  url.searchParams.set('specific', level3Item.key);
                  await goto(url.pathname + url.search);
                }
              }}
              class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
                {selectedLevel3 === level3Item.key
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}"
            >
              <span class="text-xs">{level3Item.icon}</span>
              <span>{level3Item.name}</span>
            </button>
          {/each}
        </div>
      {/if}
      
    </div>
  </div>

  <!-- Filters Panel (Mobile Drawer) -->
  {#if showFilters}
    <div class="fixed inset-0 z-40 sm:hidden">
      <!-- Backdrop -->
      <button 
        class="fixed inset-0 bg-black bg-opacity-50 border-0 cursor-default"
        onclick={() => showFilters = false}
        aria-label="Close filters"
        tabindex="-1"
      ></button>
      
      <!-- Drawer -->
      <div class="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl h-[70vh] flex flex-col shadow-2xl border-t border-gray-100">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-semibold">{i18n.search_quickFilters()}</h2>
          <button onclick={() => showFilters = false} class="p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close filters">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Scrollable Filter Options -->
        <div class="flex-1 overflow-y-auto overscroll-contain">
          <div class="space-y-4 p-4">
            
            <!-- Size -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_size()}</div>
              <div class="grid grid-cols-4 gap-2">
                {#each sizes as size}
                  <button
                    onclick={async () => {
                      const newSize = selectedSize === size ? 'all' : size;
                      selectedSize = newSize;
                      
                      // Navigate to apply filter on server
                      const url = new URL('/search', window.location.origin);
                      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                      if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                      if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                      if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                      if (newSize !== 'all') url.searchParams.set('size', newSize);
                      if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
                      if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
                      if (priceMin) url.searchParams.set('min_price', priceMin);
                      if (priceMax) url.searchParams.set('max_price', priceMax);
                      if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                      
                      await goto(url.pathname + url.search);
                    }}
                    class="min-h-[44px] px-2 text-sm rounded-lg ring-1 transition-all font-medium flex items-center justify-center
                      {selectedSize === size ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Brand -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_brand()}</div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onclick={async () => {
                    selectedBrand = 'all';
                    
                    // Navigate to apply filter on server
                    const url = new URL('/search', window.location.origin);
                    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                    if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                    if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                    if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
                    if (priceMin) url.searchParams.set('min_price', priceMin);
                    if (priceMax) url.searchParams.set('max_price', priceMax);
                    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                    
                    await goto(url.pathname + url.search);
                  }}
                  class="min-h-[44px] px-3 text-sm rounded-lg ring-1 transition-all font-medium flex items-center justify-center
                    {selectedBrand === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allBrands()}
                </button>
                {#each brands as brand}
                  <button
                    onclick={async () => {
                      const newBrand = selectedBrand === brand ? 'all' : brand;
                      selectedBrand = newBrand;
                      
                      // Navigate to apply filter on server
                      const url = new URL('/search', window.location.origin);
                      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                      if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                      if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                      if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                      if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                      if (newBrand !== 'all') url.searchParams.set('brand', newBrand);
                      if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
                      if (priceMin) url.searchParams.set('min_price', priceMin);
                      if (priceMax) url.searchParams.set('max_price', priceMax);
                      if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                      
                      await goto(url.pathname + url.search);
                    }}
                    class="min-h-[44px] px-3 text-sm rounded-lg ring-1 transition-all font-medium flex items-center justify-center
                      {selectedBrand === brand ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {brand}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Condition -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_condition()}</div>
              <div class="space-y-2">
                <button
                  onclick={async () => {
                    selectedCondition = 'all';
                    
                    // Navigate to apply filter on server
                    const url = new URL('/search', window.location.origin);
                    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                    if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                    if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                    if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
                    if (priceMin) url.searchParams.set('min_price', priceMin);
                    if (priceMax) url.searchParams.set('max_price', priceMax);
                    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                    
                    await goto(url.pathname + url.search);
                  }}
                  class="w-full min-h-[44px] px-3 text-sm rounded-lg ring-1 text-left transition-all font-medium flex items-center
                    {selectedCondition === 'all' ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allConditions()}
                </button>
                {#each conditions as condition}
                  <button
                    onclick={async () => {
                      const newCondition = selectedCondition === condition ? 'all' : condition;
                      selectedCondition = newCondition;
                      
                      // Navigate to apply filter on server
                      const url = new URL('/search', window.location.origin);
                      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                      if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                      if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                      if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                      if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                      if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
                      if (newCondition !== 'all') url.searchParams.set('condition', newCondition);
                      if (priceMin) url.searchParams.set('min_price', priceMin);
                      if (priceMax) url.searchParams.set('max_price', priceMax);
                      if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                      
                      await goto(url.pathname + url.search);
                    }}
                    class="w-full min-h-[44px] px-3 text-sm rounded-lg ring-1 text-left transition-all font-medium flex items-center
                      {selectedCondition === condition ? 'bg-black text-white ring-black' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    <span class="capitalize">{
                      condition === 'new' ? i18n.condition_new() :
                      condition === 'like-new' ? i18n.condition_likeNew() :
                      condition === 'good' ? i18n.condition_good() :
                      condition === 'fair' ? i18n.condition_fair() :
                      condition.replace('-', ' ')
                    }</span>
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Price Range -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-2">{i18n.search_priceRange()}</div>
              <div class="flex space-x-2">
                <input
                  type="number"
                  bind:value={priceMin}
                  placeholder={i18n.search_min()}
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                  onchange={async () => {
                    // Navigate to apply price filter on server
                    const url = new URL('/search', window.location.origin);
                    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                    if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                    if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                    if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
                    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
                    if (priceMin) url.searchParams.set('min_price', priceMin);
                    if (priceMax) url.searchParams.set('max_price', priceMax);
                    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                    
                    await goto(url.pathname + url.search);
                  }}
                />
                <span class="self-center">-</span>
                <input
                  type="number"
                  bind:value={priceMax}
                  placeholder={i18n.search_max()}
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                  onchange={async () => {
                    // Navigate to apply price filter on server
                    const url = new URL('/search', window.location.origin);
                    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                    if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
                    if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
                    if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
                    if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
                    if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
                    if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
                    if (priceMin) url.searchParams.set('min_price', priceMin);
                    if (priceMax) url.searchParams.set('max_price', priceMax);
                    if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
                    
                    await goto(url.pathname + url.search);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Fixed Actions -->
        <div class="flex space-x-3 p-4 border-t border-gray-100 shrink-0">
          <Button onclick={clearFilters} variant="outline" class="flex-1 min-h-[44px]">{i18n.search_clearAll()}</Button>
          <Button onclick={async () => {
            showFilters = false;
            
            // Apply all current filters by navigating
            const url = new URL('/search', window.location.origin);
            if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
            if (selectedLevel1) url.searchParams.set('category', selectedLevel1);
            if (selectedLevel2) url.searchParams.set('subcategory', selectedLevel2);
            if (selectedLevel3) url.searchParams.set('specific', selectedLevel3);
            if (selectedSize !== 'all') url.searchParams.set('size', selectedSize);
            if (selectedBrand !== 'all') url.searchParams.set('brand', selectedBrand);
            if (selectedCondition !== 'all') url.searchParams.set('condition', selectedCondition);
            if (priceMin) url.searchParams.set('min_price', priceMin);
            if (priceMax) url.searchParams.set('max_price', priceMax);
            if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy);
            
            await goto(url.pathname + url.search);
          }} class="flex-1 min-h-[44px]">{i18n.search_applyFilters()}</Button>
        </div>
      </div>
    </div>
  {/if}


  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex gap-6">
      <!-- Desktop Sidebar -->
      <CategorySidebar
        categories={categoryData}
        selectedCategory={selectedMainCategory}
        selectedSubcategory={selectedSubcategory}
        appliedFilters={{
          size: selectedSize,
          brand: selectedBrand,
          condition: selectedCondition,
          priceMin,
          priceMax
        }}
        onCategorySelect={handleCategorySelectFromMega}
        onSubcategorySelect={handleSubcategorySelectFromMega}
        onFilterRemove={handleFilterRemove}
        onClearAll={clearFilters}
        translations={{
          categories: 'Categories',
          filters: 'Active Filters',
          clearAll: 'Clear All',
          size: 'Size',
          brand: 'Brand',
          condition: 'Condition',
          priceRange: 'Price Range',
          allCategories: 'All Categories'
        }}
      />
      
      <!-- Products Content -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-600">
        {data.total || displayProducts.length} {i18n.search_itemsFound()}
        {data.searchQuery && ` ${i18n.search_for()} "${data.searchQuery}"`}
      </p>
      
      <div class="flex items-center space-x-3">
        <!-- Mobile Filter Button -->
        <button
          onclick={handleMobileFilters}
          class="sm:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Open filters"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{i18n.search_filters()}</span>
          {#if activeFiltersCount > 0}
            <div class="h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </div>
          {/if}
        </button>
        
        <!-- Desktop Sort -->
        <select bind:value={sortBy} class="hidden sm:block px-3 py-1 ring-1 ring-gray-300 rounded-lg text-sm focus:ring-black">
          <option value="relevance">{i18n.search_relevance()}</option>
          <option value="newest">{i18n.search_newestFirst()}</option>
          <option value="price-low">{i18n.search_priceLowToHigh()}</option>
          <option value="price-high">{i18n.search_priceHighToLow()}</option>
        </select>
      </div>
    </div>
    
    <!-- Active Filters Pills -->
    {#if activeFiltersCount > 0}
      <div class="flex items-center space-x-2 mb-4 overflow-x-auto">
        {#if selectedMainCategory && categoryData[selectedMainCategory]}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {categoryData[selectedMainCategory].name}
            <button onclick={() => selectedMainCategory = null} class="ml-2" aria-label="Remove category filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedLevel2 && selectedLevel1 && categoryHierarchy.level2[selectedLevel1]}
          {@const level2Item = categoryHierarchy.level2[selectedLevel1].find(item => item.key === selectedLevel2)}
          {#if level2Item}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
              {level2Item.name}
              <button onclick={() => { selectedLevel2 = null; selectedSubcategory = null; }} class="ml-2" aria-label="Remove subcategory filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            </span>
          {/if}
        {/if}
        {#if selectedLevel3 && selectedLevel1 && selectedLevel2 && categoryHierarchy.level3[`${selectedLevel1}-${selectedLevel2}`]}
          {@const level3Item = categoryHierarchy.level3[`${selectedLevel1}-${selectedLevel2}`].find(item => item.key === selectedLevel3)}
          {#if level3Item}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
              {level3Item.name}
              <button onclick={() => { selectedLevel3 = null; }} class="ml-2" aria-label="Remove specific filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            </span>
          {/if}
        {/if}
        {#if selectedSize !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_size()}: {selectedSize}
            <button onclick={() => selectedSize = 'all'} class="ml-2" aria-label="Remove size filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedBrand !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_brand()}: {selectedBrand}
            <button onclick={() => selectedBrand = 'all'} class="ml-2" aria-label="Remove brand filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedCondition !== 'all'}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_condition()}: {
              selectedCondition === 'new' ? i18n.condition_new() :
              selectedCondition === 'like-new' ? i18n.condition_likeNew() :
              selectedCondition === 'good' ? i18n.condition_good() :
              selectedCondition === 'fair' ? i18n.condition_fair() :
              selectedCondition
            }
            <button onclick={() => selectedCondition = 'all'} class="ml-2" aria-label="Remove condition filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if priceMin || priceMax}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {i18n.search_priceRange()}: ${priceMin || '0'} - ${priceMax || '∞'}
            <button onclick={() => { priceMin = ''; priceMax = ''; }} class="ml-2" aria-label="Remove price filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        <button onclick={clearFilters} class="text-sm text-gray-600 hover:text-gray-900">
          {i18n.search_clearAllFilters()}
        </button>
      </div>
    {/if}
    
    <!-- Products Grid -->
    {#if isSearching || isLoading}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each Array(12) as _}
          <ProductCardSkeleton />
        {/each}
      </div>
    {:else if displayProducts.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each displayProducts as product}
          <ProductCard 
            {product}
            onclick={() => goto(`/product/${product.id}`)}
            translations={{
              size: i18n.product_size(),
              newSeller: i18n.trending_newSeller(),
              unknownSeller: i18n.seller_unknown(),
              currency: i18n.common_currency(),
              addToFavorites: i18n.product_addToFavorites(),
              brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
              newWithoutTags: i18n.sell_condition_newWithoutTags(),
              new: i18n.condition_new(),
              likeNew: i18n.condition_likeNew(),
              good: i18n.condition_good(),
              worn: i18n.sell_condition_worn(),
              fair: i18n.condition_fair(),
              formatPrice: (price: number) => formatPrice(price),
              categoryTranslation: (categoryName: string) => {
                // Map English category names to translation keys
                const categoryMap: Record<string, string> = {
                  // Level 1 - Gender categories
                  'Women': i18n.category_women(),
                  'Men': i18n.category_men(),
                  'Kids': i18n.category_kids(),
                  'Unisex': i18n.category_unisex(),
                  
                  // Level 2 - Product Types
                  'Clothing': i18n.category_clothing(),
                  'Shoes': i18n.category_shoesType(),
                  'Accessories': i18n.category_accessoriesType(),
                  'Bags': i18n.category_bagsType(),
                  
                  // Level 3 - Specific items (old Level 2)
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
                return categoryMap[categoryName] || categoryName;
              }
            }}
          />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.search_noItemsFound()}</h3>
        <p class="text-gray-600">{i18n.search_adjustFilters()}</p>
      </div>
    {/if}
        </div>
      </div>
    </div>
  </div>

<!-- Smart Sticky Search for Search Page -->
<SmartStickySearch 
  bind:value={searchQuery}
  onSearch={handleSearch}
  placeholder={i18n.search_placeholder()}
  quickFilters={stickyQuickFilters}
  onFilterClick={handleStickyFilterClick}
  observeTarget="#search-main-section"
/>

{#if !showMegaMenu}
  <BottomNav 
    currentPath={$page.url.pathname}
    isNavigating={!!$navigating}
    navigatingTo={$navigating?.to?.url.pathname}
    unreadMessageCount={$unreadMessageCount}
    labels={{
      home: i18n.nav_home(),
      search: i18n.nav_search(),
      sell: i18n.nav_sell(),
      messages: i18n.nav_messages(),
      profile: i18n.nav_profile()
    }}
  />
{/if}

<style>
  /* Hide scrollbar for category carousel */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>