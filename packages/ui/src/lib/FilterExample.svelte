<!--
  EXAMPLE: Using the new accessibility-first filter components
  This example shows how to integrate with existing product filter stores
-->

<script lang="ts">
  import FilterPillGroup from './FilterPillGroup.svelte';
  import CategoryFilterDropdown from './CategoryFilterDropdown.svelte';
  import FilterModal from './FilterModal.svelte';
  import AppliedFilters from './AppliedFilters.svelte';

  // Example filter options
  const sizeOptions = [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' }
  ];

  const conditionOptions = [
    { 
      value: 'brand_new_with_tags', 
      label: 'Brand New With Tags', 
      shortLabel: 'BNWT',
      bgGradient: 'bg-gradient-to-r from-emerald-600 to-green-600',
      color: 'var(--condition-new)'
    },
    { 
      value: 'like_new', 
      label: 'Like New', 
      shortLabel: 'Like New',
      bgGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      color: 'var(--condition-like-new)'
    },
    { 
      value: 'good', 
      label: 'Good', 
      shortLabel: 'Good',
      bgGradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
      color: 'var(--condition-good)'
    }
  ];

  const brandOptions = [
    { value: 'nike', label: 'Nike', icon: '👟' },
    { value: 'adidas', label: 'Adidas', icon: '⚡' },
    { value: 'zara', label: 'Zara', icon: '👗' },
    { value: 'hm', label: 'H&M', icon: '🏷️' }
  ];

  // Example category hierarchy
  const categoryHierarchy = {
    categories: [
      { key: 'women', name: 'Women', icon: '👗', id: '1' },
      { key: 'men', name: 'Men', icon: '👔', id: '2' },
      { key: 'kids', name: 'Kids', icon: '👶', id: '3' }
    ],
    subcategories: {
      women: [
        { key: 'clothing', name: 'Clothing', icon: '👚', id: '4' },
        { key: 'shoes', name: 'Shoes', icon: '👠', id: '5' }
      ],
      men: [
        { key: 'clothing', name: 'Clothing', icon: '👕', id: '6' },
        { key: 'shoes', name: 'Shoes', icon: '👞', id: '7' }
      ]
    },
    specifics: {
      'women-clothing': [
        { key: 'dresses', name: 'Dresses', icon: '👗', id: '8' },
        { key: 'tops', name: 'Tops', icon: '👚', id: '9' }
      ],
      'women-shoes': [
        { key: 'heels', name: 'Heels', icon: '👠', id: '10' },
        { key: 'sneakers', name: 'Sneakers', icon: '👟', id: '11' }
      ]
    }
  };

  // Filter modal sections
  const filterSections = [
    {
      key: 'size',
      label: 'Size',
      type: 'pills' as const,
      options: sizeOptions,
      value: selectedSize
    },
    {
      key: 'condition',
      label: 'Condition',
      type: 'pills' as const,
      options: conditionOptions,
      value: selectedCondition
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'pills' as const,
      options: brandOptions,
      value: selectedBrand
    },
    {
      key: 'price',
      label: 'Price Range',
      type: 'range' as const,
      minValue: minPrice,
      maxValue: maxPrice,
      placeholder: { min: 'Min price', max: 'Max price' }
    }
  ];

  // State for filter values
  let selectedCategory = $state<string | null>(null);
  let selectedSubcategory = $state<string | null>(null);
  let selectedSpecific = $state<string | null>(null);
  let selectedSize = $state<string | null>(null);
  let selectedCondition = $state<string | null>(null);
  let selectedBrand = $state<string | null>(null);
  let minPrice = $state('');
  let maxPrice = $state('');
  let showFilterModal = $state(false);

  // Applied filters for demonstration
  const appliedFilters = $derived(() => {
    const filters = [];
    
    if (selectedCategory) {
      const category = categoryHierarchy.categories.find(cat => cat.key === selectedCategory);
      filters.push({
        key: 'category',
        label: 'Category',
        value: selectedCategory,
        displayValue: category?.name || selectedCategory,
        icon: category?.icon
      });
    }
    
    if (selectedSize) {
      filters.push({
        key: 'size',
        label: 'Size',
        value: selectedSize,
        displayValue: selectedSize
      });
    }
    
    if (selectedCondition) {
      const condition = conditionOptions.find(opt => opt.value === selectedCondition);
      filters.push({
        key: 'condition',
        label: 'Condition',
        value: selectedCondition,
        displayValue: condition?.shortLabel || selectedCondition,
        color: condition?.color
      });
    }
    
    if (selectedBrand) {
      const brand = brandOptions.find(opt => opt.value === selectedBrand);
      filters.push({
        key: 'brand',
        label: 'Brand',
        value: selectedBrand,
        displayValue: brand?.label || selectedBrand,
        icon: brand?.icon
      });
    }
    
    if (minPrice || maxPrice) {
      const priceRange = [minPrice, maxPrice].filter(Boolean).join(' - ');
      filters.push({
        key: 'price',
        label: 'Price',
        value: priceRange,
        displayValue: `$${priceRange}`
      });
    }
    
    return filters;
  });

  // Event handlers
  function handleCategorySelect(category: string | null, subcategory: string | null, specific: string | null) {
    selectedCategory = category;
    selectedSubcategory = subcategory;
    selectedSpecific = specific;
  }

  function handleFilterChange(key: string, value: any) {
    switch (key) {
      case 'size':
        selectedSize = value === 'all' ? null : value;
        break;
      case 'condition':
        selectedCondition = value === 'all' ? null : value;
        break;
      case 'brand':
        selectedBrand = value === 'all' ? null : value;
        break;
      case 'price_min':
        minPrice = value;
        break;
      case 'price_max':
        maxPrice = value;
        break;
    }
  }

  function handleRemoveFilter(key: string) {
    switch (key) {
      case 'category':
        selectedCategory = null;
        selectedSubcategory = null;
        selectedSpecific = null;
        break;
      case 'size':
        selectedSize = null;
        break;
      case 'condition':
        selectedCondition = null;
        break;
      case 'brand':
        selectedBrand = null;
        break;
      case 'price':
        minPrice = '';
        maxPrice = '';
        break;
    }
  }

  function clearAllFilters() {
    selectedCategory = null;
    selectedSubcategory = null;
    selectedSpecific = null;
    selectedSize = null;
    selectedCondition = null;
    selectedBrand = null;
    minPrice = '';
    maxPrice = '';
  }
</script>

<div class="p-6 max-w-4xl mx-auto space-y-6">
  <h1 class="text-2xl font-bold text-[color:var(--text-primary)]">Filter Components Example</h1>

  <!-- Applied Filters -->
  <div class="bg-[color:var(--surface-subtle)] p-4 rounded-[var(--radius-lg)]">
    <h2 class="text-lg font-semibold mb-3 text-[color:var(--text-primary)]">Applied Filters</h2>
    <AppliedFilters
      filters={appliedFilters}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={clearAllFilters}
    />
  </div>

  <!-- Category Filter Dropdown -->
  <div class="bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] p-4 rounded-[var(--radius-lg)]">
    <h2 class="text-lg font-semibold mb-3 text-[color:var(--text-primary)]">Category Filter Dropdown</h2>
    <CategoryFilterDropdown
      {categoryHierarchy}
      bind:selectedCategory
      bind:selectedSubcategory
      bind:selectedSpecific
      onCategorySelect={handleCategorySelect}
      class="w-fit"
    />
  </div>

  <!-- Filter Pill Groups -->
  <div class="bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] p-4 rounded-[var(--radius-lg)]">
    <h2 class="text-lg font-semibold mb-4 text-[color:var(--text-primary)]">Filter Pill Groups</h2>
    
    <div class="space-y-4">
      <!-- Size Filter -->
      <div>
        <FilterPillGroup
          bind:value={selectedSize}
          options={[{ value: 'all', label: 'All Sizes' }, ...sizeOptions]}
          label="Size"
          onValueChange={(value) => handleFilterChange('size', value)}
        />
      </div>

      <!-- Condition Filter -->
      <div>
        <FilterPillGroup
          bind:value={selectedCondition}
          options={[{ value: 'all', label: 'All Conditions' }, ...conditionOptions]}
          label="Condition"
          onValueChange={(value) => handleFilterChange('condition', value)}
        />
      </div>

      <!-- Brand Filter -->
      <div>
        <FilterPillGroup
          bind:value={selectedBrand}
          options={[{ value: 'all', label: 'All Brands' }, ...brandOptions]}
          label="Brand"
          onValueChange={(value) => handleFilterChange('brand', value)}
        />
      </div>
    </div>
  </div>

  <!-- Filter Modal -->
  <div class="bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] p-4 rounded-[var(--radius-lg)]">
    <h2 class="text-lg font-semibold mb-3 text-[color:var(--text-primary)]">Filter Modal</h2>
    
    <FilterModal
      bind:open={showFilterModal}
      sections={filterSections}
      activeFilterCount={appliedFilters.length}
      onFilterChange={handleFilterChange}
      onClear={clearAllFilters}
      onApply={(filters) => {
        console.log('Applied filters:', filters);
        showFilterModal = false;
      }}
    >
      {#snippet trigger()}
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filter</span>
        {#if appliedFilters.length > 0}
          <span class="bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-semibold">{appliedFilters.length}</span>
        {/if}
      {/snippet}
    </FilterModal>
  </div>

  <!-- Current State Debug -->
  <details class="bg-[color:var(--surface-muted)] p-4 rounded-[var(--radius-lg)]">
    <summary class="cursor-pointer font-semibold text-[color:var(--text-primary)]">Current Filter State (Debug)</summary>
    <pre class="mt-2 text-xs text-[color:var(--text-secondary)] overflow-x-auto"><code>{JSON.stringify({
      selectedCategory,
      selectedSubcategory,
      selectedSpecific,
      selectedSize,
      selectedCondition,
      selectedBrand,
      minPrice,
      maxPrice
    }, null, 2)}</code></pre>
  </details>
</div>