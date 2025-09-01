<script lang="ts">
  interface FilterPill {
    key: string;
    label: string;
    value: string;
    type: 'category' | 'subcategory' | 'specific' | 'size' | 'brand' | 'condition' | 'price' | 'sort';
    removable?: boolean;
  }

  interface Props {
    filters: Record<string, any>;
    categoryLabels?: Record<string, string>;
    onRemoveFilter: (key: string, type?: string) => void;
    onClearAll?: () => void;
    class?: string;
    clearAllLabel?: string;
    maxDisplay?: number;
    showMore?: boolean;
  }

  let {
    filters,
    categoryLabels = {},
    onRemoveFilter,
    onClearAll,
    class: className = '',
    clearAllLabel = 'Clear All',
    maxDisplay = 10,
    showMore = false
  }: Props = $props();

  // Generate filter pills from current filters
  let filterPills = $derived((() => {
    const pills: FilterPill[] = [];

    // Category hierarchy
    if (filters.category) {
      pills.push({
        key: 'category',
        label: categoryLabels[filters.category] || filters.category,
        value: filters.category,
        type: 'category',
        removable: true
      });
    }

    if (filters.subcategory) {
      pills.push({
        key: 'subcategory',
        label: categoryLabels[filters.subcategory] || filters.subcategory,
        value: filters.subcategory,
        type: 'subcategory',
        removable: true
      });
    }

    if (filters.specific) {
      pills.push({
        key: 'specific',
        label: categoryLabels[filters.specific] || filters.specific,
        value: filters.specific,
        type: 'specific',
        removable: true
      });
    }

    // Other filters
    if (filters.size && filters.size !== 'all') {
      pills.push({
        key: 'size',
        label: `Size: ${filters.size}`,
        value: filters.size,
        type: 'size',
        removable: true
      });
    }

    if (filters.brand && filters.brand !== 'all') {
      pills.push({
        key: 'brand',
        label: filters.brand,
        value: filters.brand,
        type: 'brand',
        removable: true
      });
    }

    if (filters.condition && filters.condition !== 'all') {
      const conditionLabels: Record<string, string> = {
        'brand_new_with_tags': 'Brand New',
        'new_without_tags': 'New',
        'like_new': 'Like New',
        'good': 'Good',
        'fair': 'Fair'
      };
      pills.push({
        key: 'condition',
        label: conditionLabels[filters.condition] || filters.condition,
        value: filters.condition,
        type: 'condition',
        removable: true
      });
    }

    // Price range
    if (filters.minPrice || filters.maxPrice) {
      let priceLabel = 'Price: ';
      if (filters.minPrice && filters.maxPrice) {
        priceLabel += `${filters.minPrice} - ${filters.maxPrice} лв`;
      } else if (filters.minPrice) {
        priceLabel += `from ${filters.minPrice} лв`;
      } else if (filters.maxPrice) {
        priceLabel += `up to ${filters.maxPrice} лв`;
      }
      
      pills.push({
        key: 'price',
        label: priceLabel,
        value: `${filters.minPrice || ''}-${filters.maxPrice || ''}`,
        type: 'price',
        removable: true
      });
    }

    // Sort (if not default)
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      const sortLabels: Record<string, string> = {
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low',
        'newest': 'Newest First'
      };
      pills.push({
        key: 'sortBy',
        label: sortLabels[filters.sortBy] || filters.sortBy,
        value: filters.sortBy,
        type: 'sort',
        removable: true
      });
    }

    return pills;
  })());

  // Display pills (with optional limit)
  let displayedPills = $derived(
    showMore || filterPills.length <= maxDisplay 
      ? filterPills 
      : filterPills.slice(0, maxDisplay)
  );

  let hasMorePills = $derived(filterPills.length > maxDisplay);

  function handleRemoveFilter(pill: FilterPill) {
    if (pill.type === 'price') {
      onRemoveFilter('minPrice');
      onRemoveFilter('maxPrice');
    } else if (pill.type === 'category') {
      // Remove entire category hierarchy
      onRemoveFilter('category');
      onRemoveFilter('subcategory');
      onRemoveFilter('specific');
    } else if (pill.type === 'subcategory') {
      // Remove subcategory and specific, keep main category
      onRemoveFilter('subcategory');
      onRemoveFilter('specific');
    } else if (pill.type === 'specific') {
      // Remove only specific
      onRemoveFilter('specific');
    } else {
      onRemoveFilter(pill.key);
    }
  }

  let showMoreState = $state(false);

  function toggleShowMore() {
    showMoreState = !showMoreState;
  }
</script>

{#if filterPills.length > 0}
  <div class="flex items-center gap-2 flex-wrap {className}">
    {#each showMoreState ? filterPills : displayedPills as pill (pill.key + pill.value)}
      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[color:var(--primary-50)] text-[color:var(--primary-700)] 
                  rounded-full text-xs font-medium border border-[color:var(--primary-200)]
                  transition-colors duration-[var(--duration-base)]">
        <span class="max-w-32 truncate">{pill.label}</span>
        {#if pill.removable}
          <button
            onclick={() => handleRemoveFilter(pill)}
            class="ml-1 p-0.5 rounded-full hover:bg-[color:var(--primary-100)] 
                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--state-focus)]
                   transition-colors duration-[var(--duration-base)]"
            aria-label="Remove {pill.label} filter"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>
    {/each}

    {#if hasMorePills && !showMoreState}
      <button
        onclick={toggleShowMore}
        class="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-[color:var(--text-secondary)]
               hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)]
               rounded-full border border-[color:var(--border-default)] border-dashed
               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--state-focus)]
               transition-colors duration-[var(--duration-base)]"
        aria-label="Show {filterPills.length - maxDisplay} more filters"
      >
        +{filterPills.length - maxDisplay} more
      </button>
    {:else if showMoreState && hasMorePills}
      <button
        onclick={toggleShowMore}
        class="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-[color:var(--text-secondary)]
               hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)]
               rounded-full border border-[color:var(--border-default)] border-dashed
               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--state-focus)]
               transition-colors duration-[var(--duration-base)]"
        aria-label="Show fewer filters"
      >
        Show less
      </button>
    {/if}

    {#if onClearAll && filterPills.length > 1}
      <button
        onclick={onClearAll}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
               text-[color:var(--text-secondary)] hover:text-[color:var(--danger-600)]
               hover:bg-[color:var(--danger-50)] border border-[color:var(--border-default)]
               hover:border-[color:var(--danger-200)] rounded-full
               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--state-focus)]
               transition-colors duration-[var(--duration-base)]"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {clearAllLabel}
      </button>
    {/if}
  </div>
{/if}