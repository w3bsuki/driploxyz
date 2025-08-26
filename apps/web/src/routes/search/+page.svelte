<script lang="ts">
  import { ProductCard, Button, SearchBar, SearchDropdown, SmartStickySearch, MegaMenu, CategorySidebar, ProductCardSkeleton, BottomNav, type Product, type CategoryData } from '@repo/ui';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
  import { goto } from '$app/navigation';
  import { page, navigating } from '$app/stores';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  
  interface Props {
    data: PageData;
  }
  
  // Search and filter states
  let searchQuery = $state('');
  let selectedMainCategory = $state<string | null>(null);
  let selectedSubcategory = $state<string | null>(null);
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
  
  let { data }: Props = $props();

  // Initialize search state from server data and URL parameters
  $effect(() => {
    if (data.searchQuery) {
      searchQuery = data.searchQuery;
    }
    if (data.filters) {
      if (data.filters.category) selectedMainCategory = data.filters.category;
      if (data.filters.subcategory) selectedSubcategory = data.filters.subcategory;
      if (data.filters.size) selectedSize = data.filters.size;
      if (data.filters.brand) selectedBrand = data.filters.brand;
      if (data.filters.condition) selectedCondition = data.filters.condition;
      if (data.filters.minPrice) priceMin = data.filters.minPrice;
      if (data.filters.maxPrice) priceMax = data.filters.maxPrice;
      if (data.filters.sortBy) sortBy = data.filters.sortBy;
    }
  });
  
  // Use category data from server
  const categoryData = $derived<CategoryData>(() => {
    // Always use real category hierarchy from server
    if (data.categoryHierarchy && Object.keys(data.categoryHierarchy).length > 0) {
      const hierarchy: CategoryData = {};
      
      // Transform server data to match component format
      Object.entries(data.categoryHierarchy).forEach(([slug, catData]: [string, any]) => {
        hierarchy[slug] = {
          name: catData.name,
          icon: getCategoryIcon(catData.name),
          subcategories: (catData.subcategories || []).map((sub: any) => ({
            name: sub.name,
            icon: getSubcategoryIcon(sub.name)
          }))
        };
      });
      
      return hierarchy;
    }
    
    // Fallback to hardcoded structure
    return {
    women: {
      name: i18n.category_women(),
      icon: '👗',
      subcategories: [
        { name: i18n.subcategory_dresses(), icon: '👗' },
        { name: i18n.subcategory_tops(), icon: '👚' },
        { name: i18n.subcategory_jeans(), icon: '👖' },
        { name: i18n.subcategory_skirts(), icon: '👠' },
        { name: i18n.subcategory_jackets(), icon: '🧥' },
        { name: i18n.category_shoes(), icon: '👠' },
        { name: i18n.category_bags(), icon: '👜' },
        { name: i18n.subcategory_accessories(), icon: '💍' }
      ]
    },
    men: {
      name: i18n.category_men(),
      icon: '👔',
      subcategories: [
        { name: i18n.subcategory_tshirts(), icon: '👕' },
        { name: i18n.subcategory_shirts(), icon: '👔' },
        { name: i18n.subcategory_jeans(), icon: '👖' },
        { name: i18n.subcategory_jackets(), icon: '🧥' },
        { name: i18n.subcategory_suits(), icon: '🤵' },
        { name: i18n.category_shoes(), icon: '👞' },
        { name: i18n.subcategory_watches(), icon: '⌚' },
        { name: i18n.subcategory_accessories(), icon: '🎩' }
      ]
    },
    kids: {
      name: i18n.category_kids(),
      icon: '👶',
      subcategories: [
        { name: i18n.subcategory_baby(), icon: '👶' },
        { name: i18n.subcategory_girls2to8(), icon: '👧' },
        { name: i18n.subcategory_boys2to8(), icon: '👦' },
        { name: i18n.subcategory_girls9to16(), icon: '🧒' },
        { name: i18n.subcategory_boys9to16(), icon: '🧒' },
        { name: i18n.category_shoes(), icon: '👟' },
        { name: i18n.subcategory_school(), icon: '🎒' },
        { name: i18n.subcategory_toys(), icon: '🧸' }
      ]
    },
    pets: {
      name: i18n.category_pets(),
      icon: '🐕',
      subcategories: [
        { name: i18n.subcategory_dogApparel(), icon: '🐕' },
        { name: i18n.subcategory_catAccessories(), icon: '🐱' },
        { name: i18n.subcategory_petToys(), icon: '🦴' },
        { name: i18n.subcategory_leashes(), icon: '🦮' },
        { name: i18n.subcategory_beds(), icon: '🛏️' },
        { name: i18n.subcategory_foodBowls(), icon: '🥣' },
        { name: i18n.subcategory_carriers(), icon: '🎒' }
      ]
    },
    shoes: {
      name: i18n.category_shoes(),
      icon: '👟',
      subcategories: [
        { name: i18n.subcategory_sneakers(), icon: '👟' },
        { name: i18n.subcategory_boots(), icon: '🥾' },
        { name: i18n.subcategory_heels(), icon: '👠' },
        { name: i18n.subcategory_flats(), icon: '🩰' },
        { name: i18n.subcategory_sandals(), icon: '👡' },
        { name: i18n.subcategory_athletic(), icon: '⚽' },
        { name: i18n.subcategory_dressShoes(), icon: '👞' }
      ]
    },
    bags: {
      name: i18n.category_bags(),
      icon: '👜',
      subcategories: [
        { name: i18n.subcategory_handbags(), icon: '👜' },
        { name: i18n.subcategory_backpacks(), icon: '🎒' },
        { name: i18n.subcategory_totes(), icon: '👝' },
        { name: i18n.subcategory_clutches(), icon: '💼' },
        { name: i18n.subcategory_crossbody(), icon: '👜' },
        { name: i18n.subcategory_travel(), icon: '🧳' },
        { name: i18n.subcategory_laptopBags(), icon: '💻' }
      ]
    },
    home: {
      name: i18n.category_home(),
      icon: '🏠',
      subcategories: [
        { name: i18n.subcategory_decor(), icon: '🖼️' },
        { name: i18n.subcategory_bedding(), icon: '🛏️' },
        { name: i18n.subcategory_kitchen(), icon: '🍽️' },
        { name: i18n.subcategory_lighting(), icon: '💡' },
        { name: i18n.subcategory_storage(), icon: '📦' },
        { name: i18n.subcategory_garden(), icon: '🌱' },
        { name: i18n.subcategory_art(), icon: '🎨' },
        { name: i18n.subcategory_textiles(), icon: '🧶' }
      ]
    },
    beauty: {
      name: i18n.category_beauty(),
      icon: '💄',
      subcategories: [
        { name: i18n.subcategory_makeup(), icon: '💄' },
        { name: i18n.subcategory_skincare(), icon: '🧴' },
        { name: i18n.subcategory_fragrance(), icon: '🌺' },
        { name: i18n.subcategory_hairCare(), icon: '💇' },
        { name: i18n.subcategory_tools(), icon: '🪞' },
        { name: i18n.subcategory_nails(), icon: '💅' },
        { name: i18n.subcategory_bathBody(), icon: '🛁' },
        { name: i18n.subcategory_sets(), icon: '🎁' }
      ]
    },
    unisex: {
      name: 'Unisex',
      icon: '👥',
      subcategories: [
        { name: 'Hoodies', icon: '🧥' },
        { name: 'T-Shirts', icon: '👕' },
        { name: 'Jeans', icon: '👖' },
        { name: 'Sneakers', icon: '👟' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Backpacks', icon: '🎒' },
        { name: 'Hats', icon: '🧢' },
        { name: 'Sunglasses', icon: '🕶️' }
      ]
    },
    accessories: {
      name: 'Accessories',
      icon: '💍',
      subcategories: [
        { name: 'Jewelry', icon: '💍' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Sunglasses', icon: '🕶️' },
        { name: 'Hats', icon: '🧢' },
        { name: 'Scarves', icon: '🧣' },
        { name: 'Belts', icon: '👔' },
        { name: 'Wallets', icon: '👛' }
      ]
    }
  };
  });
  
  // Helper functions for category icons
  function getCategoryIcon(name: string): string {
    const iconMap: Record<string, string> = {
      'Women': '👗',
      'Men': '👔',
      'Kids': '👶',
      'Unisex': '👥',
      'Shoes': '👟',
      'Bags': '👜',
      'Accessories': '💍',
      'Home': '🏠',
      'Beauty': '💄',
      'Pets': '🐕'
    };
    return iconMap[name] || '📦';
  }
  
  function getSubcategoryIcon(name: string): string {
    const iconMap: Record<string, string> = {
      'Dresses': '👗',
      'Tops': '👚',
      'T-Shirts': '👕',
      'Shirts': '👔',
      'Jeans': '👖',
      'Pants': '👖',
      'Skirts': '👗',
      'Jackets': '🧥',
      'Shoes': '👟',
      'Bags': '👜',
      'Accessories': '💍',
      'Watches': '⌚',
      'Sneakers': '👟',
      'Boots': '🥾',
      'Heels': '👠',
      'Sandals': '👡'
    };
    // Try to find a match in the name
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    return '🏷️';
  }
  
  
  // Get ordered categories - Women, Men, Kids, Unisex in that order
  function getOrderedCategories() {
    const cats = Object.entries(categoryData());
    // Categories are already sorted from server in correct order
    return cats;
  }

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
  
  // Get smart filters based on selected category
  const currentFilters = $derived(() => {
    const category = selectedMainCategory || 'default';
    return smartFilterData[category] || smartFilterData.default;
  });
  
  const sizes = $derived(() => currentFilters().sizes);
  const brands = $derived(() => currentFilters().brands);
  const conditions = ['new', 'like-new', 'good', 'fair'];
  
  // Transform server products to component format with client-side filtering
  const displayProducts = $derived(() => {
    let products = (data.products || []).map(product => ({
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

    // Main category filtering is handled by server
    // Only apply secondary client-side filters

    if (selectedSubcategory) {
      products = products.filter(p => p.subcategory_name === selectedSubcategory);
    }

    if (selectedSize !== 'all') {
      products = products.filter(p => p.size === selectedSize);
    }

    if (selectedBrand !== 'all') {
      products = products.filter(p => p.brand?.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    if (selectedCondition !== 'all') {
      products = products.filter(p => p.condition === selectedCondition);
    }

    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) {
        products = products.filter(p => p.price >= min);
      }
    }

    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) {
        products = products.filter(p => p.price <= max);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }

    return products;
  });
  
  let activeFiltersCount = $derived(() => {
    let count = 0;
    if (selectedMainCategory) count++;
    if (selectedSubcategory) count++;
    if (selectedSize !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (priceMin || priceMax) count++;
    return count;
  });
  
  
  function clearFilters() {
    selectedMainCategory = null;
    selectedSubcategory = null;
    selectedSize = 'all';
    selectedBrand = 'all';
    selectedCondition = 'all';
    priceMin = '';
    priceMax = '';
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
        {#if activeFiltersCount() > 0}
          <div class="absolute top-2 right-2 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center pointer-events-none z-10">
            {activeFiltersCount()}
          </div>
        {/if}
      </div>
      <!-- Main Category Pills (Row 1) -->
      <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
        <button
          onclick={async () => {
            selectedMainCategory = null;
            selectedSubcategory = null;
            // Navigate to load all products from server
            const url = new URL('/search', window.location.origin);
            if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
            await goto(url.pathname + url.search);
          }}
          class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all
            {selectedMainCategory === null 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {i18n.search_all()}
        </button>
        {#each getOrderedCategories() as [key, category]}
          <button
            onclick={async () => {
              // Toggle category selection
              if (selectedMainCategory === key) {
                selectedMainCategory = null;
                // Navigate to show all products
                const url = new URL('/search', window.location.origin);
                if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                await goto(url.pathname + url.search);
              } else {
                selectedMainCategory = key;
                selectedSubcategory = null;
                // Navigate to load category-specific products from server
                const url = new URL('/search', window.location.origin);
                if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
                url.searchParams.set('category', key);
                await goto(url.pathname + url.search);
              }
            }}
            class="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all flex items-center gap-1
              {selectedMainCategory === key
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            <span class="text-base">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        {/each}
      </div>
      
      <!-- Subcategory Pills (Row 2) - Dynamic based on selected main category -->
      {#if selectedMainCategory && categoryData()[selectedMainCategory]}
        <div class="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
          <button
            onclick={() => {
              selectedSubcategory = null;
            }}
            class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all
              {selectedSubcategory === null 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
          >
            All {categoryData()[selectedMainCategory].name}
          </button>
          {#each categoryData()[selectedMainCategory].subcategories as subcat}
            <button
              onclick={() => {
                selectedSubcategory = subcat.name;
              }}
              class="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all
                {selectedSubcategory === subcat.name
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'}"
            >
              {subcat.name}
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Quick Filters Row (Always visible) -->
      <div class="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
        <button
          onclick={() => {
            if (priceMax === '20') {
              priceMax = '';
            } else {
              priceMax = '20';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
            {priceMax === '20' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'}"
        >
          <span>💰</span>
          <span>{i18n.filter_under20()}</span>
        </button>
        <button
          onclick={() => {
            if (sortBy === 'newest') {
              sortBy = 'relevance';
            } else {
              sortBy = 'newest';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
            {sortBy === 'newest' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}"
        >
          <span>🆕</span>
          <span>{i18n.filter_newToday()}</span>
        </button>
        <button
          onclick={() => {
            if (selectedCondition === 'new') {
              selectedCondition = 'all';
            } else {
              selectedCondition = 'new';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1
            {selectedCondition === 'new' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}"
        >
          <span>🏷️</span>
          <span>{i18n.condition_newWithTags()}</span>
        </button>
        <button
          onclick={() => {
            if (selectedBrand === 'Nike') {
              selectedBrand = 'all';
            } else {
              selectedBrand = 'Nike';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
            {selectedBrand === 'Nike' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
        >
          Nike
        </button>
        <button
          onclick={() => {
            if (selectedBrand === 'Adidas') {
              selectedBrand = 'all';
            } else {
              selectedBrand = 'Adidas';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
            {selectedBrand === 'Adidas' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
        >
          Adidas
        </button>
        <button
          onclick={() => {
            if (selectedBrand === 'Zara') {
              selectedBrand = 'all';
            } else {
              selectedBrand = 'Zara';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
            {selectedBrand === 'Zara' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
        >
          Zara
        </button>
        <button
          onclick={() => {
            if (selectedSize === 'M') {
              selectedSize = 'all';
            } else {
              selectedSize = 'M';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
            {selectedSize === 'M' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
        >
          {i18n.product_size()} M
        </button>
        <button
          onclick={() => {
            if (selectedSize === 'L') {
              selectedSize = 'all';
            } else {
              selectedSize = 'L';
            }
          }}
          class="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all
            {selectedSize === 'L' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
        >
          {i18n.product_size()} L
        </button>
      </div>
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
      <div class="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl h-[calc(90vh-4rem)] flex flex-col shadow-2xl border-t border-gray-100">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 class="text-lg font-semibold">{i18n.search_quickFilters()}</h2>
          <button onclick={() => showFilters = false} class="p-1" aria-label="Close filters">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Scrollable Filter Options -->
        <div class="flex-1 overflow-y-auto">
          <div class="space-y-6 p-4">
            
            <!-- Size -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_size()}</div>
              <div class="grid grid-cols-4 gap-2">
                {#each sizes() as size}
                  <button
                    onclick={() => selectedSize = selectedSize === size ? 'all' : size}
                    class="py-2.5 px-2 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                      {selectedSize === size ? 'bg-black text-white ring-black shadow-sm transform scale-105' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Brand -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_brand()}</div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onclick={() => selectedBrand = 'all'}
                  class="py-3 px-3 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                    {selectedBrand === 'all' ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allBrands()}
                </button>
                {#each brands() as brand}
                  <button
                    onclick={() => selectedBrand = selectedBrand === brand ? 'all' : brand}
                    class="py-3 px-3 text-sm rounded-lg ring-1 transition-all duration-200 font-medium
                      {selectedBrand === brand ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                  >
                    {brand}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Condition -->
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-3">{i18n.search_condition()}</div>
              <div class="space-y-2">
                <button
                  onclick={() => selectedCondition = 'all'}
                  class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-all duration-200 font-medium
                    {selectedCondition === 'all' ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
                >
                  {i18n.search_allConditions()}
                </button>
                {#each conditions as condition}
                  <button
                    onclick={() => selectedCondition = selectedCondition === condition ? 'all' : condition}
                    class="w-full py-3 px-3 text-sm rounded-lg ring-1 text-left transition-all duration-200 font-medium
                      {selectedCondition === condition ? 'bg-black text-white ring-black shadow-sm' : 'bg-white text-gray-700 ring-gray-300 hover:ring-gray-400 hover:bg-gray-50'}"
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
                />
                <span class="self-center">-</span>
                <input
                  type="number"
                  bind:value={priceMax}
                  placeholder={i18n.search_max()}
                  class="flex-1 px-3 py-2 ring-1 ring-gray-300 rounded-lg text-base"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Fixed Actions -->
        <div class="flex space-x-3 p-4 border-t border-gray-100 shrink-0">
          <Button onclick={clearFilters} variant="outline" class="flex-1 h-12">{i18n.search_clearAll()}</Button>
          <Button onclick={() => showFilters = false} class="flex-1 h-12">{i18n.search_applyFilters()}</Button>
        </div>
      </div>
    </div>
  {/if}


  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex gap-6">
      <!-- Desktop Sidebar -->
      <CategorySidebar
        categories={categoryData()}
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
        {data.total || displayProducts().length} {i18n.search_itemsFound()}
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
          {#if activeFiltersCount() > 0}
            <div class="h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount()}
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
    {#if activeFiltersCount() > 0}
      <div class="flex items-center space-x-2 mb-4 overflow-x-auto">
        {#if selectedMainCategory && categoryData()[selectedMainCategory]}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {categoryData()[selectedMainCategory].name}
            <button onclick={() => selectedMainCategory = null} class="ml-2" aria-label="Remove category filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/if}
        {#if selectedSubcategory}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            {selectedSubcategory}
            <button onclick={() => selectedSubcategory = null} class="ml-2" aria-label="Remove subcategory filter">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
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
    {:else if displayProducts().length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {#each displayProducts() as product}
          <ProductCard 
            {product}
            onclick={() => goto(`/product/${product.id}`)}
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