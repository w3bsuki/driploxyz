<script lang="ts">
  import type { Snippet } from 'svelte';
  import * as i18n from '@repo/i18n';

  interface AppliedFilter {
    key: string;
    label: string;
    value: string | null;
    displayValue: string;
    removable?: boolean;
    icon?: string;
    color?: string;
  }

  interface Props {
    filters: AppliedFilter[];
    onRemoveFilter?: (key: string) => void;
    onClearAll?: () => void;
    class?: string;
    showClearAll?: boolean;
    clearAllLabel?: string;
    ariaLabel?: string;
    filterItem?: Snippet<[AppliedFilter, { onRemove: () => void }]>;
    /** Announce filter changes to screen readers */
    announceChanges?: boolean;
    /** Custom announcement template for filter removals */
    announcementTemplate?: (filter: AppliedFilter) => string;
  }

  let {
    filters,
    onRemoveFilter,
    onClearAll,
    class: className = '',
    showClearAll = true,
    clearAllLabel = 'Clear All',
    ariaLabel = 'Applied filters',
    filterItem,
    announceChanges = true,
    announcementTemplate
  }: Props = $props();

  // Announcement state
  let announcement = $state('');

  // Filter out inactive filters
  const activeFilters = $derived(
    filters.filter(filter => 
      filter.value !== null && 
      filter.value !== 'all' && 
      filter.value !== '' &&
      filter.displayValue.trim() !== ''
    )
  );

  const hasActiveFilters = $derived(activeFilters.length > 0);

  // Handle individual filter removal
  function handleRemoveFilter(key: string) {
    const removedFilter = filters.find(f => f.key === key);
    
    onRemoveFilter?.(key);
    
    // Announce removal
    if (announceChanges && removedFilter) {
      if (announcementTemplate) {
        announcement = announcementTemplate(removedFilter);
      } else {
        announcement = `Filter removed: ${removedFilter.label}`;
      }
    }
  }

  // Handle clear all
  function handleClearAll() {
    const activeCount = activeFilters.length;
    
    onClearAll?.();
    
    // Announce clearing all
    if (announceChanges) {
      announcement = `All ${activeCount} filters cleared`;
    }
  }
  
  // Clear announcement after it's been read
  $effect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        announcement = '';
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  // Generate accessible label for filter
  function getFilterAriaLabel(filter: AppliedFilter): string {
    return `Remove filter: ${filter.label} - ${filter.displayValue}`;
  }
</script>

{#if hasActiveFilters}
  <div class="applied-filters {className}" role="region" aria-label={ariaLabel}>
    <!-- Summary for screen readers -->
    <div class="sr-only" aria-live="polite">
      {activeFilters.length} active filters: {activeFilters.map(f => `${f.label}: ${f.displayValue}`).join(', ')}
    </div>
    
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Active Filter Pills -->
      {#each activeFilters as filter (filter.key)}
        {#if filter.removable !== false}
          {#if filterItem}
            {@render filterItem(filter, { onRemove: () => handleRemoveFilter(filter.key) })}
          {:else}
            <button
              onclick={() => handleRemoveFilter(filter.key)}
              onkeydown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  handleRemoveFilter(filter.key);
                }
              }}
              class="inline-flex items-center gap-1.5 px-3 py-1.5 
                     bg-[color:var(--surface-emphasis)] hover:bg-[color:var(--surface-muted)]
                     border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)]
                     rounded-[var(--radius-full)] text-xs font-medium text-[color:var(--text-primary)]
                     transition-all duration-[var(--duration-base)]
                     min-h-[var(--touch-compact)] max-w-48
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-1
                     hover:shadow-sm active:scale-95"
              aria-label={getFilterAriaLabel(filter)}
              aria-describedby="filter-removal-help"
              title={getFilterAriaLabel(filter)}
            >
              <!-- Filter Icon -->
              {#if filter.icon}
                <span class="text-xs" aria-hidden="true">{filter.icon}</span>
              {:else if filter.color}
                <span 
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  style="background-color: {filter.color}"
                  aria-hidden="true"
                ></span>
              {/if}
              
              <!-- Filter Label and Value -->
              <span class="truncate">
                <span class="text-[color:var(--text-secondary)]">{filter.label}:</span>
                <span class="font-semibold ml-1">{filter.displayValue}</span>
              </span>
              
              <!-- Remove Icon -->
              <svg 
                class="w-3 h-3 flex-shrink-0 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        {:else}
          <!-- Non-removable filter display -->
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 
                       bg-[color:var(--surface-subtle)] border border-[color:var(--border-subtle)]
                       rounded-[var(--radius-full)] text-xs font-medium text-[color:var(--text-secondary)]
                       min-h-[var(--touch-compact)] max-w-48">
            {#if filter.icon}
              <span class="text-xs" aria-hidden="true">{filter.icon}</span>
            {:else if filter.color}
              <span 
                class="w-2 h-2 rounded-full flex-shrink-0"
                style="background-color: {filter.color}"
                aria-hidden="true"
              ></span>
            {/if}
            
            <span class="truncate">
              <span class="text-[color:var(--text-tertiary)]">{filter.label}:</span>
              <span class="font-semibold ml-1 text-[color:var(--text-primary)]">{filter.displayValue}</span>
            </span>
          </span>
        {/if}
      {/each}
      
      <!-- Clear All Button -->
      {#if showClearAll && activeFilters.length > 1}
        <button
          onclick={handleClearAll}
          onkeydown={(e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              handleClearAll();
            }
          }}
          class="inline-flex items-center gap-1 px-2 py-1.5 
                 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]
                 hover:bg-[color:var(--surface-subtle)] rounded-[var(--radius-md)] 
                 text-xs font-medium transition-colors duration-[var(--duration-base)]
                 min-h-[var(--touch-compact)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-1"
          aria-label="Clear all applied filters"
          aria-describedby="clear-all-help"
        >
          <svg 
            class="w-3.5 h-3.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {clearAllLabel}
        </button>
      {/if}
    </div>
    
    <!-- Hidden help text -->
    <div id="filter-removal-help" class="sr-only">
      Click or press Enter to remove individual filters
    </div>
    
    <div id="clear-all-help" class="sr-only">
      Use Clear All button to remove all filters at once
    </div>
  </div>
{/if}

<!-- Live region for announcements -->
{#if announcement}
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    class="sr-only"
  >
    {announcement}
  </div>
{/if}

<style>
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .applied-filters {
    /* Ensure proper spacing and alignment */
    min-height: 2rem;
  }
  
  /* Enhanced mobile touch targets and feedback */
  @media (hover: none) and (pointer: coarse) {
    button:active {
      transform: scale(0.95);
    }
  }
  
  /* Smooth hover transitions */
  button {
    transition-property: background-color, border-color, color, box-shadow, transform;
  }
  
  /* Accessibility: High contrast focus indicators */
  @media (prefers-contrast: high) {
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    
    button:active {
      transform: none;
    }
  }
</style>