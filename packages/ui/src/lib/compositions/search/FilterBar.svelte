<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';

  interface Props {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    onClearAll: () => void;
  }

  let { filters, onFilterChange, onClearAll }: Props = $props();

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Newest First', value: 'newest' },
  ];

  const conditions = [
    { label: 'New with tags', value: 'brand_new_with_tags' },
    { label: 'Like new', value: 'like_new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
  ];
  
  const categories = [
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Kids', value: 'kids' },
    { label: 'Unisex', value: 'unisex' },
    { label: 'Home', value: 'home' },
  ];
  
  const sizes = [
    { label: 'Small', value: 'S' },
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L' },
    { label: 'Extra Large', value: 'XL' },
  ];
  
  const brands = [
    { label: 'Nike', value: 'Nike' },
    { label: 'Adidas', value: 'Adidas' },
    { label: 'Zara', value: 'Zara' },
    { label: 'H&M', value: 'H&M' },
  ];

  let priceMin = $state('');
  let priceMax = $state('');
  let openDropdown = $state<string | null>(null);

  function toggleDropdown(name: string) {
    openDropdown = openDropdown === name ? null : name;
  }

  function closeDropdown() {
    openDropdown = null;
  }

  function applyPrice() {
     if (priceMin || priceMax) {
        onFilterChange('price_min', priceMin);
        onFilterChange('price_max', priceMax);
        closeDropdown();
     }
  }

  // Check if filter is active - using $derived for Svelte 5 reactive computed values
  const hasCategory = $derived(filters.category && filters.category !== 'all');
  const hasSize = $derived(!!filters.size && filters.size !== 'all');
  const hasBrand = $derived(!!filters.brand && filters.brand !== 'all');
  const hasCondition = $derived(!!filters.condition && filters.condition !== 'all');
  const hasPrice = $derived(!!filters.price_min || !!filters.price_max);

  // Active filter count for accessibility
  const activeFilterCount = $derived(
    [hasCategory, hasSize, hasBrand, hasCondition, hasPrice].filter(Boolean).length
  );
</script>

{#if openDropdown}
  <button 
    class="fixed inset-0 z-40" 
    onclick={closeDropdown} 
    tabindex="-1" 
    aria-hidden="true"
    aria-label="Close dropdown"
  ></button>
{/if}

<nav class="filter-bar" aria-label="Search filters" role="navigation">
  <div class="filter-bar__container">
    
    <!-- Category Filter -->
    <div class="relative">
      <button 
        class="filter-pill" 
        class:active={hasCategory}
        onclick={() => toggleDropdown('category')}
        aria-expanded={openDropdown === 'category'}
        aria-haspopup="listbox"
        aria-label={hasCategory ? `Category: ${filters.category}` : 'Select category'}
      >
        Category
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'category' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'category'}
        <div class="dropdown-menu" role="listbox" aria-label="Category options">
          {#each categories as category}
            <button 
              class="dropdown-item" 
              role="option"
              aria-selected={filters.category === category.value}
              onclick={() => { onFilterChange('category', category.value); closeDropdown(); }}
            >
              {category.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Size Filter -->
    <div class="relative">
      <button 
        class="filter-pill" 
        class:active={hasSize}
        onclick={() => toggleDropdown('size')}
        aria-expanded={openDropdown === 'size'}
        aria-haspopup="listbox"
        aria-label={hasSize ? `Size: ${filters.size}` : 'Select size'}
      >
        Size
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'size' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'size'}
        <div class="dropdown-menu" role="listbox" aria-label="Size options">
          {#each sizes as size}
            <button 
              class="dropdown-item" 
              role="option"
              aria-selected={filters.size === size.value}
              onclick={() => { onFilterChange('size', size.value); closeDropdown(); }}
            >
              {size.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Brand Filter -->
    <div class="relative">
      <button 
        class="filter-pill" 
        class:active={hasBrand}
        onclick={() => toggleDropdown('brand')}
        aria-expanded={openDropdown === 'brand'}
        aria-haspopup="listbox"
        aria-label={hasBrand ? `Brand: ${filters.brand}` : 'Select brand'}
      >
        Brand
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'brand' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'brand'}
        <div class="dropdown-menu" role="listbox" aria-label="Brand options">
          {#each brands as brand}
            <button 
              class="dropdown-item" 
              role="option"
              aria-selected={filters.brand === brand.value}
              onclick={() => { onFilterChange('brand', brand.value); closeDropdown(); }}
            >
              {brand.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Condition Filter -->
    <div class="relative">
      <button 
        class="filter-pill" 
        class:active={hasCondition}
        onclick={() => toggleDropdown('condition')}
        aria-expanded={openDropdown === 'condition'}
        aria-haspopup="listbox"
        aria-label={hasCondition ? `Condition: ${filters.condition}` : 'Select condition'}
      >
        Condition
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'condition' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'condition'}
        <div class="dropdown-menu" role="listbox" aria-label="Condition options">
          {#each conditions as condition}
            <button 
              class="dropdown-item" 
              role="option"
              aria-selected={filters.condition === condition.value}
              onclick={() => { onFilterChange('condition', condition.value); closeDropdown(); }}
            >
              {condition.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Price Filter -->
    <div class="relative">
      <button 
        class="filter-pill" 
        class:active={hasPrice}
        onclick={() => toggleDropdown('price')}
        aria-expanded={openDropdown === 'price'}
        aria-haspopup="dialog"
        aria-label={hasPrice ? `Price: ${filters.price_min || '0'} - ${filters.price_max || '∞'}` : 'Set price range'}
      >
        Price
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'price' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'price'}
        <div class="dropdown-menu w-64" role="dialog" aria-label="Price range">
          <div class="p-4 space-y-3">
            <span class="text-sm font-semibold price-title">Price Range</span>
            <div class="flex gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                bind:value={priceMin} 
                class="price-input"
                aria-label="Minimum price"
              />
              <input 
                type="number" 
                placeholder="Max" 
                bind:value={priceMax} 
                class="price-input"
                aria-label="Maximum price"
              />
            </div>
            <button 
              class="apply-btn"
              onclick={applyPrice}
            >
              Apply
            </button>
          </div>
        </div>
      {/if}
    </div>

    <div class="hidden md:block flex-1"></div>

    <!-- Sort Filter -->
    <div class="relative">
      <button 
        class="filter-pill"
        onclick={() => toggleDropdown('sort')}
        aria-expanded={openDropdown === 'sort'}
        aria-haspopup="listbox"
        aria-label="Sort results"
      >
        Sort by
        <ChevronDown class="w-4 h-4 opacity-50 transition-transform {openDropdown === 'sort' ? 'rotate-180' : ''}" />
      </button>
      {#if openDropdown === 'sort'}
        <div class="dropdown-menu dropdown-menu-right" role="listbox" aria-label="Sort options">
          {#each sortOptions as option}
            <button 
              class="dropdown-item" 
              role="option"
              aria-selected={filters.sort === option.value}
              onclick={() => { onFilterChange('sort', option.value); closeDropdown(); }}
            >
              {option.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

  </div>
</nav>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FILTER BAR — Mobile-First with Design Tokens
     Using Tailwind CSS v4 semantic tokens
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .filter-bar {
    position: sticky;
    top: var(--nav-height-mobile, 56px);
    z-index: var(--z-sticky, 1100);
    width: 100%;
    background: var(--surface-base);
    border-bottom: 1px solid var(--border-subtle);
  }

  @media (min-width: 768px) {
    .filter-bar {
      top: var(--nav-height, 64px);
    }
  }

  .filter-bar__container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-bar__container::-webkit-scrollbar {
    display: none;
  }

  /* Filter Pill - Modern Touch Target 40px */
  .filter-pill {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-normal);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    white-space: nowrap;
    min-height: var(--touch-standard);
    user-select: none;
    justify-content: space-between;
    min-width: 120px;
  }

  .filter-pill:hover {
    border-color: var(--border-emphasis);
    background: var(--surface-subtle);
  }

  .filter-pill:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .filter-pill.active {
    background: var(--surface-subtle);
    border-color: var(--text-primary);
    color: var(--text-primary);
    font-weight: var(--font-medium);
  }

  /* Dropdown Menu - Design Token Driven */
  .dropdown-menu {
    position: absolute;
    top: calc(100% + var(--space-1));
    left: 0;
    z-index: var(--z-dropdown, 1000);
    min-width: 14rem;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    animation: slideDown var(--duration-fast) var(--ease-out);
  }

  .dropdown-menu-right {
    left: auto;
    right: 0;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(calc(-1 * var(--space-2)));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Dropdown Item - Touch-Friendly 40px */
  .dropdown-item {
    width: 100%;
    text-align: left;
    padding: var(--space-2-5) var(--space-4);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    background: var(--surface-base);
    border: none;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out);
    min-height: var(--touch-standard);
    display: flex;
    align-items: center;
  }

  .dropdown-item:hover {
    background: var(--surface-subtle);
    color: var(--text-primary);
  }

  .dropdown-item:focus-visible {
    background: var(--surface-subtle);
    color: var(--text-primary);
    outline: none;
  }

  .dropdown-item:active {
    background: var(--surface-muted);
  }

  .dropdown-item[aria-selected="true"] {
    background: var(--surface-subtle);
    color: var(--text-primary);
    font-weight: var(--font-medium);
  }

  /* Price Filter Inputs */
  .price-title {
    color: var(--text-primary);
    display: block;
  }

  .price-input {
    flex: 1;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--text-primary);
    background: var(--surface-base);
    min-height: var(--touch-standard);
    transition: border-color var(--duration-fast) var(--ease-out),
                box-shadow var(--duration-fast) var(--ease-out);
  }

  .price-input::placeholder {
    color: var(--text-placeholder);
  }

  .price-input:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--border-focus-ring);
  }

  /* Apply Button */
  .apply-btn {
    width: 100%;
    background: var(--surface-inverse);
    color: var(--text-inverse);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    min-height: var(--touch-standard);
    cursor: pointer;
    border: none;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .apply-btn:hover {
    opacity: 0.9;
  }

  .apply-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Chevron rotation */
  .rotate-180 {
    transform: rotate(180deg);
  }

  /* Desktop enhancements */
  @media (min-width: 768px) {
    .filter-bar__container {
      padding: var(--space-3-5) var(--space-4);
    }

    .filter-pill {
      min-height: var(--touch-standard);
      padding: var(--space-2-5) var(--space-5);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .filter-pill,
    .dropdown-item,
    .price-input,
    .apply-btn {
      transition: none;
    }

    .dropdown-menu {
      animation: none;
    }
  }
</style>
