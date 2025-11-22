<script lang="ts">
  /**
   * FilterDrawer - Mobile bottom sheet for product filtering
   * Rebuilt for robustness and simplicity.
   */

  import * as Sheet from '../../primitives/sheet';
  import { cn } from '../../utils/cn';

  interface FilterValue {
    [key: string]: string | number | null;
  }

  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
    onApply?: (filters: FilterValue) => void;
    onClear?: () => void;
    currentFilters?: FilterValue;
    previewCount?: number;
    brands?: string[];
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
    conditions = [
      { value: 'brand_new_with_tags', label: 'New with Tags', emoji: '🏷️' },
      { value: 'like_new', label: 'Like New', emoji: '💎' },
      { value: 'good', label: 'Good', emoji: '👍' },
      { value: 'fair', label: 'Fair', emoji: '👌' }
    ],
    sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sortOptions = [
      { value: 'relevance', label: 'Best Match' },
      { value: 'newest', label: 'Newest First' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' }
    ],
    priceRange = { min: 0, max: 500 },
    class: className = ''
  }: Props = $props();

  // Local filter state
  let pendingFilters = $state<FilterValue>({ ...currentFilters });
  let brandSearchQuery = $state('');

  // Sync pending filters when currentFilters change
  $effect(() => {
    if (currentFilters) {
      pendingFilters = { ...currentFilters };
    }
  });

  const filteredBrands = $derived.by(() => {
    if (!brandSearchQuery) return brands.slice(0, 20);
    const query = brandSearchQuery.toLowerCase();
    return brands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 20);
  });

  function updateFilter(key: string, value: string | number | null) {
    pendingFilters = { ...pendingFilters, [key]: value };
  }

  function toggleFilter(key: string, value: string) {
    const current = pendingFilters[key];
    updateFilter(key, current === value ? null : value);
  }

  function handleApply() {
    onApply?.(pendingFilters);
    isOpen = false;
  }

  function handleClear() {
    pendingFilters = {};
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
      "flex flex-col",
      isDesktop ? 'h-full w-full sm:max-w-md' : 'h-[85vh] w-full rounded-t-xl',
      className
    )}
  >
    <!-- Header -->
    <div class="flex-none flex items-center justify-between px-4 py-3 border-b border-(--border-subtle)">
      <Sheet.Title class="text-lg font-semibold text-(--text-primary)">
        Filters
      </Sheet.Title>
      <div class="flex items-center gap-3">
        {#if previewCount > 0}
          <span class="text-sm text-(--text-tertiary)">{previewCount} results</span>
        {/if}
      </div>
    </div>
    
    <Sheet.Description class="sr-only">
      Adjust filters for product search.
    </Sheet.Description>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-8 overscroll-contain">
      
      <!-- Sort -->
      <section>
        <h3 class="text-sm font-medium text-(--text-primary) mb-3">Sort By</h3>
        <div class="space-y-1">
          {#each sortOptions as option}
            {@const isActive = pendingFilters.sortBy === option.value}
            <button
              type="button"
              onclick={() => updateFilter('sortBy', option.value)}
              class={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-(--surface-muted) font-medium text-(--text-primary)" : "text-(--text-secondary) hover:bg-(--surface-subtle)"
              )}
            >
              <span>{option.label}</span>
              {#if isActive}
                <div class="w-2 h-2 rounded-full bg-(--brand-primary)"></div>
              {/if}
            </button>
          {/each}
        </div>
      </section>

      <!-- Condition -->
      <section>
        <h3 class="text-sm font-medium text-(--text-primary) mb-3">Condition</h3>
        <div class="flex flex-wrap gap-2">
          {#each conditions as condition}
            {@const isActive = pendingFilters.condition === condition.value}
            <button
              type="button"
              onclick={() => toggleFilter('condition', condition.value)}
              class={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                isActive 
                  ? "bg-(--text-primary) border-(--text-primary) text-(--surface-base)" 
                  : "bg-(--surface-base) border-(--border-default) text-(--text-secondary) hover:bg-(--surface-subtle)"
              )}
            >
              <span>{condition.emoji}</span>
              <span>{condition.label}</span>
            </button>
          {/each}
        </div>
      </section>

      <!-- Price -->
      <section>
        <h3 class="text-sm font-medium text-(--text-primary) mb-3">Price Range</h3>
        <div class="flex gap-4 mb-4">
          <div class="flex-1">
            <label class="text-xs text-(--text-tertiary) mb-1 block">Min</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">$</span>
              <input
                type="number"
                value={pendingFilters.minPrice ?? ''}
                oninput={e => updateFilter('minPrice', (e.target as HTMLInputElement).value)}
                class="w-full pl-6 pr-3 py-2 bg-(--surface-subtle) border-none rounded-lg text-sm text-(--text-primary)"
                placeholder="0"
              />
            </div>
          </div>
          <div class="flex-1">
            <label class="text-xs text-(--text-tertiary) mb-1 block">Max</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">$</span>
              <input
                type="number"
                value={pendingFilters.maxPrice ?? ''}
                oninput={e => updateFilter('maxPrice', (e.target as HTMLInputElement).value)}
                class="w-full pl-6 pr-3 py-2 bg-(--surface-subtle) border-none rounded-lg text-sm text-(--text-primary)"
                placeholder="Any"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
           {#each [{ label: 'Under $25', min: 0, max: 25 }, { label: '$25-$50', min: 25, max: 50 }, { label: '$50-$100', min: 50, max: 100 }] as preset}
              <button
                type="button"
                onclick={() => { updateFilter('minPrice', preset.min); updateFilter('maxPrice', preset.max); }}
                class="px-3 py-1 text-xs font-medium bg-(--surface-muted) rounded-md hover:bg-(--surface-elevated) transition-colors text-(--text-secondary)"
              >
                {preset.label}
              </button>
           {/each}
        </div>
      </section>

      <!-- Size -->
      <section>
        <h3 class="text-sm font-medium text-(--text-primary) mb-3">Size</h3>
        <div class="grid grid-cols-4 gap-2">
          {#each sizes as size}
            {@const isActive = pendingFilters.size === size}
            <button
              type="button"
              onclick={() => toggleFilter('size', size)}
              class={cn(
                "h-10 rounded-md text-sm font-medium transition-colors border",
                isActive
                  ? "bg-(--text-primary) border-(--text-primary) text-(--surface-base)"
                  : "bg-(--surface-base) border-(--border-default) text-(--text-primary) hover:border-(--border-muted)"
              )}
            >
              {size}
            </button>
          {/each}
        </div>
      </section>

    </div>

    <!-- Footer -->
    <div class="flex-none p-4 border-t border-(--border-subtle) pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div class="flex gap-3">
        <button
          type="button"
          onclick={handleClear}
          class="flex-1 h-11 flex items-center justify-center rounded-xl border border-(--border-default) font-medium text-(--text-primary) hover:bg-(--surface-subtle) transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onclick={handleApply}
          class="flex-1 h-11 flex items-center justify-center rounded-xl bg-(--text-primary) font-medium text-(--surface-base) hover:opacity-90 transition-opacity"
        >
          Show Results
        </button>
      </div>
    </div>
  </Sheet.Content>
</Sheet.Root>
