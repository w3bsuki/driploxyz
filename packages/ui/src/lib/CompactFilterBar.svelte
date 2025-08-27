<script lang="ts">
  interface FilterOption {
    label: string;
    value: string;
  }

  interface Props {
    sortBy: string;
    priceRange: string;
    condition: string;
    onSortChange: (value: string) => void;
    onPriceRangeChange: (value: string) => void;
    onConditionChange: (value: string) => void;
    onMoreFilters: () => void;
    activeFiltersCount?: number;
  }

  let {
    sortBy = 'newest',
    priceRange = 'all',
    condition = 'all',
    onSortChange,
    onPriceRangeChange,
    onConditionChange,
    onMoreFilters,
    activeFiltersCount = 0
  }: Props = $props();

  const sortOptions: FilterOption[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' }
  ];

  const priceRangeOptions: FilterOption[] = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under 20лв', value: 'under-20' },
    { label: '20-50лв', value: '20-50' },
    { label: '50-100лв', value: '50-100' },
    { label: '100лв+', value: '100-plus' }
  ];

  const conditionOptions: FilterOption[] = [
    { label: 'All Conditions', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Like New', value: 'like-new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' }
  ];

  function getSortLabel(value: string): string {
    return sortOptions.find(opt => opt.value === value)?.label || 'Sort';
  }

  function getPriceLabel(value: string): string {
    return priceRangeOptions.find(opt => opt.value === value)?.label || 'Price';
  }

  function getConditionLabel(value: string): string {
    return conditionOptions.find(opt => opt.value === value)?.label || 'Condition';
  }
</script>

<!-- Mobile-First Compact Filter Bar -->
<div class="bg-white border-b border-gray-100 py-2 px-4 sticky top-0 z-20">
  <!-- Mobile: Single row with compact dropdowns -->
  <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <!-- Sort (most important) -->
    <div class="relative shrink-0">
      <select
        bind:value={sortBy}
        onchange={() => onSortChange(sortBy)}
        class="appearance-none bg-gray-50 border-0 rounded-full px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer min-w-0"
      >
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <svg class="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Price Range -->
    <div class="relative shrink-0">
      <select
        bind:value={priceRange}
        onchange={() => onPriceRangeChange(priceRange)}
        class="appearance-none bg-gray-50 border-0 rounded-full px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer min-w-0"
      >
        {#each priceRangeOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <svg class="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Condition -->
    <div class="relative shrink-0">
      <select
        bind:value={condition}
        onchange={() => onConditionChange(condition)}
        class="appearance-none bg-gray-50 border-0 rounded-full px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer min-w-0"
      >
        {#each conditionOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <svg class="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- More Filters Button -->
    <button
      onclick={onMoreFilters}
      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shrink-0 relative"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <span>More</span>
      {#if activeFiltersCount > 0}
        <div class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
          {activeFiltersCount}
        </div>
      {/if}
    </button>
  </div>
</div>

<style>
  /* Hide scrollbar for horizontal scroll */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Custom select styling */
  select {
    background-image: none;
  }
  
  select:focus {
    outline: none;
  }
  
  /* Hide default dropdown arrow in Firefox */
  select {
    -moz-appearance: none;
  }
  
  /* Hide default dropdown arrow in IE */
  select::-ms-expand {
    display: none;
  }
</style>