<script lang="ts">
  /**
   * FilterDrawer - Refined Mobile Filter UI
   * Clean typography, optimal touch targets, polished styling
   */

  import * as Sheet from '../../primitives/sheet';
  import { cn } from '../../utils/cn';
  import { Search, X, ChevronRight, ChevronLeft, Check, SlidersHorizontal } from 'lucide-svelte';

  interface FilterValue {
    [key: string]: string | number | null;
  }

  interface Category {
    id: string;
    name: string;
    slug: string;
    level: number;
    children?: Category[];
  }

  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
    onApply?: (filters: FilterValue) => void;
    onClear?: () => void;
    currentFilters?: FilterValue;
    previewCount?: number;
    brands?: string[];
    categories?: Category[];
    conditions?: { value: string; label: string; emoji: string }[];
    sizes?: string[];
    sortOptions?: { value: string; label: string }[];
    priceRange?: { min: number; max: number };
    class?: string;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    onApply,
    onClear,
    currentFilters = {},
    previewCount = 0,
    brands = [],
    categories = [],
    conditions = [
      { value: 'brand_new_with_tags', label: 'New with tags', emoji: '🏷️' },
      { value: 'like_new', label: 'Like new', emoji: '✨' },
      { value: 'good', label: 'Good', emoji: '👍' },
      { value: 'fair', label: 'Fair', emoji: '👌' }
    ],
    sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sortOptions = [
      { value: 'relevance', label: 'Best match' },
      { value: 'newest', label: 'Newest first' },
      { value: 'price-low', label: 'Price: Low to high' },
      { value: 'price-high', label: 'Price: High to low' }
    ],
    priceRange = { min: 0, max: 500 },
    class: className = ''
  }: Props = $props();

  // Local filter state
  let pendingFilters = $state<FilterValue>({ ...currentFilters });
  let brandSearchQuery = $state('');
  
  // Category navigation - track which level we're viewing
  let categoryView: 'level1' | 'level2' | 'level3' = $state('level1');
  let selectedLevel1: Category | null = $state(null);
  let selectedLevel2: Category | null = $state(null);

  // Sync pending filters when currentFilters change
  $effect(() => {
    if (currentFilters) {
      pendingFilters = { ...currentFilters };
    }
  });

  // Count active filters
  const activeFilterCount = $derived.by(() => {
    return Object.entries(pendingFilters).filter(([key, value]) => {
      if (key === 'sortBy') return false;
      return value !== null && value !== undefined && value !== '' && value !== 'all';
    }).length;
  });

  const filteredBrands = $derived.by(() => {
    if (!brandSearchQuery) return brands.slice(0, 15);
    const query = brandSearchQuery.toLowerCase();
    return brands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 15);
  });

  // Category helpers
  const level1Categories = $derived(categories.filter(c => c.level === 1));
  
  const level2Categories = $derived.by(() => {
    if (!selectedLevel1) return [] as Category[];
    return selectedLevel1.children ?? [];
  });
  
  const level3Categories = $derived.by(() => {
    if (!selectedLevel2) return [] as Category[];
    return selectedLevel2.children ?? [];
  });

  function updateFilter(key: string, value: string | number | null) {
    pendingFilters = { ...pendingFilters, [key]: value };
  }

  function toggleFilter(key: string, value: string) {
    const current = pendingFilters[key];
    updateFilter(key, current === value ? null : value);
  }
  
  // Category selection - select and navigate to next level
  function selectLevel1(category: Category) {
    selectedLevel1 = category;
    selectedLevel2 = null;
    updateFilter('level1_category', category.id);
    updateFilter('level2_category', null);
    updateFilter('level3_category', null);
    // Navigate to level 2 if children exist
    if (category.children && category.children.length > 0) {
      categoryView = 'level2';
    }
  }
  
  function selectLevel2(category: Category) {
    selectedLevel2 = category;
    updateFilter('level2_category', category.id);
    updateFilter('level3_category', null);
    // Navigate to level 3 if children exist
    if (category.children && category.children.length > 0) {
      categoryView = 'level3';
    }
  }
  
  function selectLevel3(category: Category) {
    updateFilter('level3_category', category.id);
  }
  
  function goBackToLevel1() {
    categoryView = 'level1';
    selectedLevel1 = null;
    selectedLevel2 = null;
    updateFilter('level1_category', null);
    updateFilter('level2_category', null);
    updateFilter('level3_category', null);
  }
  
  function goBackToLevel2() {
    categoryView = 'level2';
    selectedLevel2 = null;
    updateFilter('level2_category', null);
    updateFilter('level3_category', null);
  }

  function handleApply() {
    onApply?.(pendingFilters);
    isOpen = false;
  }

  function handleClear() {
    pendingFilters = {};
    selectedLevel1 = null;
    selectedLevel2 = null;
    categoryView = 'level1';
    onClear?.();
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose?.();
    }
    isOpen = open;
  }

  // Responsive check
  let isDesktop = $state(false);
  $effect(() => {
    const checkDesktop = () => {
      isDesktop = window.innerWidth >= 640;
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  });
</script>

<Sheet.Root bind:open={isOpen} onOpenChange={handleOpenChange}>
  <Sheet.Content
    side={isDesktop ? 'right' : 'bottom'}
    class={cn(
      "flex flex-col bg-surface-base",
      isDesktop ? 'h-full w-full sm:max-w-[380px]' : 'h-[85vh] w-full rounded-t-2xl',
      className
    )}
  >
    <!-- Header -->
    <div class="flex-none bg-surface-base">
      {#if !isDesktop}
        <div class="flex justify-center pt-2 pb-1">
          <div class="w-8 h-1 rounded-full bg-text-muted/25"></div>
        </div>
      {/if}
      
      <div class="flex items-center justify-between px-4 py-2 {isDesktop ? 'pt-4' : ''}">
        <div class="flex items-center gap-2">
          <Sheet.Title class="text-[15px] font-semibold text-text-primary">
            Filters
          </Sheet.Title>
          {#if activeFilterCount > 0}
            <span class="text-[11px] text-text-inverse bg-surface-inverse px-1.5 py-0.5 rounded font-medium">{activeFilterCount}</span>
          {/if}
        </div>
        
        <div class="flex items-center gap-0.5">
          {#if activeFilterCount > 0}
            <button 
              type="button"
              onclick={handleClear}
              class="text-[13px] font-medium text-text-secondary px-2 py-1 rounded-md hover:text-text-primary hover:bg-surface-subtle active:bg-surface-muted"
            >
              Clear all
            </button>
          {/if}
          <button
            type="button"
            onclick={() => isOpen = false}
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-subtle active:bg-surface-muted text-text-muted"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
    
    <Sheet.Description class="sr-only">Filter products by category, brand, condition, size, and price.</Sheet.Description>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      
      <!-- Category Section -->
      {#if categories.length > 0}
        <section class="px-4 pt-4 pb-3 border-b border-border-subtle">
          <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Category</h3>
          
          <!-- Level 1: Men / Women / Kids -->
          {#if categoryView === 'level1'}
            <div class="flex flex-wrap gap-2">
              {#each level1Categories as category}
                {@const isSelected = pendingFilters.level1_category === category.id}
                <button
                  type="button"
                  onclick={() => selectLevel1(category)}
                  class={cn(
                    "inline-flex items-center gap-1 h-8 px-3 rounded-md text-[13px] font-medium transition-colors",
                    isSelected 
                      ? "bg-surface-inverse text-text-inverse" 
                      : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
                  )}
                >
                  <span>{category.name}</span>
                  {#if category.children && category.children.length > 0}
                    <ChevronRight size={14} class={isSelected ? "text-text-inverse/60" : "text-text-muted"} />
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
          
          <!-- Level 2: Clothing / Shoes / Accessories -->
          {#if categoryView === 'level2' && selectedLevel1}
            <div>
              <button
                type="button"
                onclick={goBackToLevel1}
                class="inline-flex items-center gap-0.5 text-[13px] font-medium text-brand-primary hover:text-brand-primary/80 mb-2.5 -ml-1 px-1"
              >
                <ChevronLeft size={16} strokeWidth={2} />
                <span>{selectedLevel1.name}</span>
              </button>
              
              <div class="flex flex-wrap gap-2">
                {#each level2Categories as category}
                  {@const isSelected = pendingFilters.level2_category === category.id}
                  <button
                    type="button"
                    onclick={() => selectLevel2(category)}
                    class={cn(
                      "inline-flex items-center gap-1 h-8 px-3 rounded-md text-[13px] font-medium transition-colors",
                      isSelected 
                        ? "bg-surface-inverse text-text-inverse" 
                        : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
                    )}
                  >
                    <span>{category.name}</span>
                    {#if category.children && category.children.length > 0}
                      <ChevronRight size={14} class={isSelected ? "text-text-inverse/60" : "text-text-muted"} />
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Level 3: T-shirts / Sneakers / etc -->
          {#if categoryView === 'level3' && selectedLevel2}
            <div>
              <button
                type="button"
                onclick={goBackToLevel2}
                class="inline-flex items-center gap-0.5 text-[13px] font-medium text-brand-primary hover:text-brand-primary/80 mb-2.5 -ml-1 px-1"
              >
                <ChevronLeft size={16} strokeWidth={2} />
                <span>{selectedLevel2.name}</span>
              </button>
              
              <div class="flex flex-wrap gap-1.5">
                {#each level3Categories as category}
                  {@const isSelected = pendingFilters.level3_category === category.id}
                  <button
                    type="button"
                    onclick={() => selectLevel3(category)}
                    class={cn(
                      "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[13px] font-medium transition-colors",
                      isSelected 
                        ? "bg-surface-inverse text-text-inverse" 
                        : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
                    )}
                  >
                    <span>{category.name}</span>
                    {#if isSelected}<Check size={12} strokeWidth={2.5} />{/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </section>
      {/if}
      
      <!-- Brand Section -->
      <section class="px-4 pt-4 pb-3 border-b border-border-subtle">
        <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Brand</h3>
        
        <div class="relative mb-2.5">
          <Search size={14} class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            bind:value={brandSearchQuery}
            placeholder="Search brands..."
            class="w-full h-8 pl-8 pr-8 bg-surface-muted/60 rounded-md text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-border-emphasis focus:bg-surface-subtle"
          />
          {#if brandSearchQuery}
            <button
              type="button"
              onclick={() => brandSearchQuery = ''}
              class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted"
            >
              <X size={12} strokeWidth={2} />
            </button>
          {/if}
        </div>
        
        {#if filteredBrands.length > 0}
          <div class="flex flex-wrap gap-1.5">
            {#each filteredBrands as brand}
              {@const isSelected = pendingFilters.brand === brand}
              <button
                type="button"
                onclick={() => toggleFilter('brand', brand)}
                class={cn(
                  "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[13px] font-medium transition-colors",
                  isSelected 
                    ? "bg-surface-inverse text-text-inverse" 
                    : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
                )}
              >
                <span>{brand}</span>
                {#if isSelected}<Check size={12} strokeWidth={2.5} />{/if}
              </button>
            {/each}
          </div>
        {:else}
          <p class="text-[13px] text-text-tertiary py-1">No brands found</p>
        {/if}
      </section>

      <!-- Condition Section -->
      <section class="px-4 pt-4 pb-3 border-b border-border-subtle">
        <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Condition</h3>
        
        <div class="flex flex-wrap gap-1.5">
          {#each conditions as condition}
            {@const isSelected = pendingFilters.condition === condition.value}
            <button
              type="button"
              onclick={() => toggleFilter('condition', condition.value)}
              class={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium transition-colors",
                isSelected 
                  ? "bg-surface-inverse text-text-inverse" 
                  : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
              )}
            >
              <span class="text-sm leading-none">{condition.emoji}</span>
              <span>{condition.label}</span>
            </button>
          {/each}
        </div>
      </section>

      <!-- Size Section -->
      <section class="px-4 pt-4 pb-3 border-b border-border-subtle">
        <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Size</h3>
        
        <div class="flex flex-wrap gap-1.5">
          {#each sizes as size}
            {@const isSelected = pendingFilters.size === size}
            <button
              type="button"
              onclick={() => toggleFilter('size', size)}
              class={cn(
                "min-w-[36px] h-8 px-2.5 rounded-md text-[13px] font-medium transition-colors",
                isSelected 
                  ? "bg-surface-inverse text-text-inverse" 
                  : "bg-surface-muted/80 text-text-primary hover:bg-surface-muted"
              )}
            >
              {size}
            </button>
          {/each}
        </div>
      </section>

      <!-- Price Section -->
      <section class="px-4 pt-4 pb-3 border-b border-border-subtle">
        <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Price</h3>
        
        <!-- Quick presets -->
        <div class="flex flex-wrap gap-1.5 mb-2.5">
          {#each [
            { label: 'Under $25', min: 0, max: 25 },
            { label: '$25–$50', min: 25, max: 50 },
            { label: '$50–$100', min: 50, max: 100 },
            { label: '$100+', min: 100, max: null }
          ] as preset}
            {@const isSelected = Number(pendingFilters.minPrice) === preset.min && (preset.max === null ? !pendingFilters.maxPrice : Number(pendingFilters.maxPrice) === preset.max)}
            <button
              type="button"
              onclick={() => { updateFilter('minPrice', preset.min); updateFilter('maxPrice', preset.max); }}
              class={cn(
                "h-7 px-2.5 rounded-full text-[13px] font-medium transition-colors",
                isSelected 
                  ? "bg-surface-inverse text-text-inverse" 
                  : "bg-surface-muted/80 text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              )}
            >
              {preset.label}
            </button>
          {/each}
        </div>
        
        <!-- Custom inputs -->
        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">$</span>
            <input
              id="filter-min-price"
              type="number"
              inputmode="numeric"
              value={pendingFilters.minPrice ?? ''}
              oninput={e => updateFilter('minPrice', (e.target as HTMLInputElement).value)}
              class="w-full h-8 pl-6 pr-2 bg-surface-muted/60 rounded-md text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-border-emphasis focus:bg-surface-subtle"
              placeholder="Min"
            />
          </div>
          <span class="text-text-muted text-[13px]">–</span>
          <div class="flex-1 relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">$</span>
            <input
              id="filter-max-price"
              type="number"
              inputmode="numeric"
              value={pendingFilters.maxPrice ?? ''}
              oninput={e => updateFilter('maxPrice', (e.target as HTMLInputElement).value)}
              class="w-full h-8 pl-6 pr-2 bg-surface-muted/60 rounded-md text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-border-emphasis focus:bg-surface-subtle"
              placeholder="Max"
            />
          </div>
        </div>
      </section>

      <!-- Sort Section -->
      <section class="px-4 pt-4 pb-3">
        <h3 class="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5">Sort by</h3>
        
        <div class="space-y-0.5">
          {#each sortOptions as option}
            {@const isSelected = pendingFilters.sortBy === option.value}
            <button
              type="button"
              onclick={() => updateFilter('sortBy', option.value)}
              class={cn(
                "w-full flex items-center justify-between h-9 px-2.5 rounded-md text-[13px] transition-colors",
                isSelected ? "bg-surface-subtle" : "hover:bg-surface-subtle/60"
              )}
            >
              <span class={cn("font-medium", isSelected ? "text-text-primary" : "text-text-secondary")}>{option.label}</span>
              {#if isSelected}
                <Check size={14} class="text-brand-primary" strokeWidth={2.5} />
              {/if}
            </button>
          {/each}
        </div>
      </section>

    </div>

    <!-- Footer -->
    <div class="flex-none border-t border-border-subtle bg-surface-base px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <button
        type="button"
        onclick={handleApply}
        class="w-full h-10 rounded-lg bg-surface-inverse text-text-inverse text-[13px] font-semibold active:opacity-90 transition-opacity"
      >
        {#if previewCount > 0}
          Show {previewCount.toLocaleString()} results
        {:else}
          Apply filters
        {/if}
      </button>
    </div>
  </Sheet.Content>
</Sheet.Root>
