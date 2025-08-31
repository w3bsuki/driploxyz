<script lang="ts">
  import type { CategoryData } from '../types';

  interface Props {
    categories: CategoryData;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
    appliedFilters?: {
      size?: string;
      brand?: string;
      condition?: string;
      priceMin?: string;
      priceMax?: string;
    };
    onCategorySelect?: (category: string) => void;
    onSubcategorySelect?: (subcategory: string, category: string) => void;
    onFilterRemove?: (filterType: string) => void;
    onClearAll?: () => void;
    translations?: {
      categories?: string;
      filters?: string;
      clearAll?: string;
      size?: string;
      brand?: string;
      condition?: string;
      priceRange?: string;
      allCategories?: string;
    };
    class?: string;
  }

  let {
    categories,
    selectedCategory = null,
    selectedSubcategory = null,
    appliedFilters = {},
    onCategorySelect,
    onSubcategorySelect,
    onFilterRemove,
    onClearAll,
    translations = {
      categories: 'Categories',
      filters: 'Active Filters',
      clearAll: 'Clear All',
      size: 'Size',
      brand: 'Brand',
      condition: 'Condition',
      priceRange: 'Price Range',
      allCategories: 'All Categories'
    },
    class: className = ''
  }: Props = $props();

  let expandedCategories = $state<Set<string>>(new Set());

  $effect(() => {
    if (selectedCategory) {
      expandedCategories.add(selectedCategory);
    }
  });

  function toggleCategory(category: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    expandedCategories = newExpanded;
  }

  function handleCategoryClick(category: string) {
    toggleCategory(category);
    onCategorySelect?.(category);
  }

  function handleSubcategoryClick(subcategory: string, category: string) {
    onSubcategorySelect?.(subcategory, category);
  }

  const hasActiveFilters = $derived(() => {
    return selectedCategory || 
           selectedSubcategory || 
           Object.values(appliedFilters).some(v => v && v !== 'all');
  });

  function formatFilterValue(type: string, value: string): string {
    if (type === 'priceRange' && appliedFilters.priceMin && appliedFilters.priceMax) {
      return `$${appliedFilters.priceMin} - $${appliedFilters.priceMax}`;
    }
    return value;
  }
</script>

<aside class="hidden lg:block w-64 shrink-0 {className}">
  <div class="sticky top-20 space-y-6">
    <!-- Active Filters Section -->
    {#if hasActiveFilters()}
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-900">{translations.filters}</h3>
          <button
            onclick={onClearAll}
            class="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            {translations.clearAll}
          </button>
        </div>
        
        <div class="space-y-2">
          {#if selectedCategory}
            <div class="flex items-center justify-between py-1">
              <span class="text-sm text-gray-900">
                {categories[selectedCategory]?.name}
              </span>
              <button
                onclick={() => onCategorySelect?.(null)}
                class="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                aria-label="Remove category filter"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/if}
          
          {#if selectedSubcategory}
            <div class="flex items-center justify-between py-1">
              <span class="text-sm text-gray-900">{selectedSubcategory}</span>
              <button
                onclick={() => onSubcategorySelect?.(null, selectedCategory)}
                class="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                aria-label="Remove subcategory filter"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/if}
          
          {#each Object.entries(appliedFilters) as [type, value]}
            {#if value && value !== 'all'}
              <div class="flex items-center justify-between py-1">
                <span class="text-sm text-gray-900">
                  {translations[type]}: {formatFilterValue(type, value)}
                </span>
                <button
                  onclick={() => onFilterRemove?.(type)}
                  class="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                  aria-label={`Remove ${type} filter`}
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Categories Navigation -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">{translations.categories}</h3>
      </div>
      
      <nav class="p-2">
        <!-- All Categories -->
        <button
          onclick={() => onCategorySelect?.(null)}
          class="w-full text-left px-3 py-2 rounded-lg transition-colors {
            !selectedCategory 
              ? 'bg-gray-100 text-gray-900 font-medium' 
              : 'text-gray-900 hover:bg-gray-50'
          }"
        >
          {translations.allCategories}
        </button>
        
        <!-- Category Tree -->
        {#each Object.entries(categories) as [key, category]}
          <div class="mt-1">
            <button
              onclick={() => handleCategoryClick(key)}
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors {
                selectedCategory === key 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-900 hover:bg-gray-50'
              }"
            >
              <div class="flex items-center space-x-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {#if category.itemCount}
                  <span class="text-xs text-gray-500">({category.itemCount})</span>
                {/if}
              </div>
              
              {#if category.subcategories?.length > 0}
                <svg 
                  class="w-4 h-4 text-gray-400 transition-transform {
                    expandedCategories.has(key) ? 'rotate-180' : ''
                  }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              {/if}
            </button>
            
            <!-- Subcategories -->
            {#if expandedCategories.has(key) && category.subcategories}
              <div class="ml-4 mt-1 space-y-1">
                {#each category.subcategories as subcat}
                  <button
                    onclick={() => handleSubcategoryClick(subcat.name, key)}
                    class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors {
                      selectedSubcategory === subcat.name
                        ? 'bg-black text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }"
                  >
                    <span class="mr-1 text-xs">{subcat.icon}</span>
                    {subcat.name}
                    {#if subcat.itemCount}
                      <span class="ml-1 text-xs opacity-75">({subcat.itemCount})</span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </nav>
    </div>
    
    <!-- Quick Links -->
    <div class="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
      <h4 class="font-medium text-gray-900 mb-3">Quick Links</h4>
      <div class="space-y-2">
        <a href="/deals" class="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-900 transition-colors">
          <span>🔥</span>
          <span>Hot Deals</span>
        </a>
        <a href="/new" class="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-900 transition-colors">
          <span>✨</span>
          <span>New Arrivals</span>
        </a>
        <a href="/trending" class="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-900 transition-colors">
          <span>📈</span>
          <span>Trending Now</span>
        </a>
        <a href="/brands" class="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-900 transition-colors">
          <span>🏷️</span>
          <span>Popular Brands</span>
        </a>
      </div>
    </div>
  </div>
</aside>