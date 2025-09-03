<script lang="ts">
  import { createDialog } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import FilterPillGroup from './FilterPillGroup.svelte';
  import * as i18n from '@repo/i18n';

  interface FilterOption {
    value: string;
    label: string;
    icon?: string;
    shortLabel?: string;
    color?: string;
    bgGradient?: string;
  }

  interface FilterSection {
    key: string;
    label: string;
    type: 'pills' | 'range' | 'custom';
    options?: FilterOption[];
    value?: string | null;
    minValue?: string;
    maxValue?: string;
    placeholder?: { min?: string; max?: string };
  }

  interface Props {
    open?: boolean;
    sections: FilterSection[];
    appliedFilters: Record<string, any>;
    pendingFilters: Record<string, any>;
    previewResultCount?: number;
    totalResultCount?: number;
    class?: string;
    title?: string;
    applyLabel?: string;
    cancelLabel?: string;
    clearLabel?: string;
    closeLabel?: string;
    minPriceLabel?: string;
    maxPriceLabel?: string;
    onApply?: (filters: Record<string, any>) => void;
    onCancel?: () => void;
    onClear?: () => void;
    onPendingFilterChange?: (key: string, value: any) => void;
    trigger?: Snippet;
    customSection?: Snippet<[FilterSection]>;
    /** Announce filter changes to screen readers */
    announceChanges?: boolean;
    /** Custom announcement template for filter changes */
    announcementTemplate?: (filterKey: string, filterValue: any, sectionLabel: string) => string;
  }

  let {
    open = $bindable(false),
    sections,
    appliedFilters,
    pendingFilters,
    previewResultCount,
    totalResultCount,
    class: className = '',
    title = 'Filter Products',
    applyLabel = 'Apply Filters',
    cancelLabel = 'Cancel',
    clearLabel = 'Clear All',
    closeLabel = 'Close',
    minPriceLabel = 'Min',
    maxPriceLabel = 'Max',
    onApply,
    onCancel,
    onClear,
    onPendingFilterChange,
    trigger,
    customSection,
    announceChanges = true,
    announcementTemplate
  }: Props = $props();

  // Focus management
  let triggerElement: HTMLElement | null = null;
  let firstFocusableElement: HTMLElement | null = null;
  let lastFocusableElement: HTMLElement | null = null;
  let modalContentRef = $state<HTMLDivElement>();
  let announcement = $state('');

  // Create dialog with proper accessibility
  const {
    elements: { trigger: triggerEl, overlay, content, title: titleEl, close },
    states: { open: isOpen }
  } = createDialog({
    onOpenChange: ({ next }) => {
      if (next) {
        // Store current focus before opening
        triggerElement = document.activeElement as HTMLElement;
      } else {
        // Restore focus when closing
        restoreFocus();
      }
      open = next;
      return next;
    },
    preventScroll: true,
    closeOnOutsideClick: true,
    portal: 'body'
  });
  
  // Sync external open state with Melt UI's internal state
  $effect(() => {
    if (open !== $isOpen) {
      isOpen.set(open);
    }
  });
  
  // Focus management functions
  function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  }
  
  function setupFocusTrap() {
    if (!modalContentRef) return;
    
    const focusableElements = getFocusableElements(modalContentRef);
    if (focusableElements.length === 0) return;
    
    firstFocusableElement = focusableElements[0];
    lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element
    setTimeout(() => {
      firstFocusableElement?.focus();
    }, 100);
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (!$isOpen) return;
    
    const { key, shiftKey } = event;
    
    if (key === 'Escape') {
      event.preventDefault();
      handleCancel();
      return;
    }
    
    if (key === 'Tab') {
      if (!firstFocusableElement || !lastFocusableElement) return;
      
      if (shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  }
  
  function restoreFocus() {
    if (triggerElement) {
      setTimeout(() => {
        triggerElement?.focus();
        triggerElement = null;
      }, 100);
    }
  }
  
  // Setup focus trap when modal opens
  $effect(() => {
    if ($isOpen && modalContentRef) {
      setupFocusTrap();
      document.addEventListener('keydown', handleKeydown);
      
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });

  // Local filter state tracking pending changes
  let localFilters = $state<Record<string, any>>({});

  // Initialize local filters from pending filters
  $effect(() => {
    localFilters = { ...pendingFilters };
  });

  // Handle individual filter changes
  function handleFilterChange(key: string, value: any) {
    const section = sections.find(s => s.key === key || key.startsWith(s.key));
    
    localFilters[key] = value;
    onPendingFilterChange?.(key, value);
    
    // Announce filter changes
    if (announceChanges && section) {
      if (announcementTemplate) {
        announcement = announcementTemplate(key, value, section.label);
      } else {
        if (key.includes('_min') || key.includes('_max')) {
          const type = key.includes('_min') ? 'minimum' : 'maximum';
          const displayValue = value || 'not set';
          announcement = `${section.label} ${type} set to ${displayValue}`;
        } else {
          const displayValue = value === 'all' ? 'all options' : value;
          announcement = `${section.label} filter set to ${displayValue}. Preview shows ${previewResultCount || 0} results`;
        }
      }
    }
  }

  // Handle price range input
  function handlePriceInput(key: string, type: 'min' | 'max', event: Event) {
    const target = event.target as HTMLInputElement;
    const rangeKey = `${key}_${type}`;
    localFilters[rangeKey] = target.value;
    onPendingFilterChange?.(rangeKey, target.value);
  }

  // Apply all filters and close modal
  function handleApply() {
    onApply?.(localFilters);
    
    // Announce application
    if (announceChanges) {
      announcement = `Applied filters. Showing ${previewResultCount || 0} results`;
    }
    
    open = false;
  }

  // Cancel changes and close modal
  function handleCancel() {
    // Reset local filters to applied state
    localFilters = { ...appliedFilters };
    onCancel?.();
    open = false;
  }

  // Clear all filters
  function handleClear() {
    // Reset all filter values to defaults
    Object.keys(localFilters).forEach(key => {
      if (key.includes('_min') || key.includes('_max')) {
        localFilters[key] = '';
      } else {
        localFilters[key] = key === 'sortBy' ? 'relevance' : 'all';
      }
    });
    
    // Update pending filters
    Object.keys(localFilters).forEach(key => {
      onPendingFilterChange?.(key, localFilters[key]);
    });
    
    // Announce clearing
    if (announceChanges) {
      announcement = `All filters cleared. Preview shows ${totalResultCount || 0} results`;
    }
    
    onClear?.();
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

  // Check if any filters have pending changes
  const hasPendingChanges = $derived(() => {
    return Object.keys(localFilters).some(key => {
      const applied = appliedFilters[key];
      const pending = localFilters[key];
      return applied !== pending;
    });
  });

  // Check if any filters are active
  const hasActiveFilters = $derived(() => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (key.includes('_min') || key.includes('_max')) {
        return value !== '';
      }
      if (key === 'sortBy') {
        return value !== 'relevance';
      }
      return value !== 'all' && value !== null;
    });
  });

  // Active filter count for display
  const activeFilterCount = $derived(() => {
    return Object.entries(appliedFilters).reduce((count, [key, value]) => {
      if (key.includes('_min') || key.includes('_max')) {
        return count; // Price range counts as 1 filter, handled elsewhere
      }
      if (key === 'sortBy') {
        return value !== 'relevance' ? count + 1 : count;
      }
      return value !== 'all' && value !== null && value !== '' ? count + 1 : count;
    }, 0) + (appliedFilters.minPrice || appliedFilters.maxPrice ? 1 : 0);
  });
</script>

<!-- Trigger Button (if provided) -->
{#if trigger}
  <button 
    use:triggerEl
    class="relative flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-lg)] text-sm font-medium 
           transition-colors duration-[var(--duration-base)]
           min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2
           {activeFilterCount > 0 
             ? 'bg-[color:var(--primary)] text-[color:var(--primary-fg)]' 
             : 'bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-primary)]'}"
    aria-label="Open filters"
    aria-describedby={activeFilterCount > 0 ? 'filter-count-description' : undefined}
  >
    {@render trigger()}
    {#if activeFilterCount > 0}
      <span 
        id="filter-count-description"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 
               bg-[color:var(--danger-500)] text-[color:var(--danger-50)] 
               rounded-full text-xs font-semibold flex items-center justify-center"
        aria-label="{activeFilterCount} filters applied"
      >
        {activeFilterCount}
      </span>
    {/if}
  </button>
{/if}

<!-- Modal Dialog -->
{#if $isOpen}
  <!-- Backdrop -->
  <div 
    use:overlay 
    class="fixed inset-0 z-50 bg-[color:var(--modal-overlay)] backdrop-blur-sm"
    style="z-index: 9999;"
  ></div>

  <!-- Dialog Content - Mobile-first responsive -->
  <div 
    bind:this={modalContentRef}
    use:content
    class="fixed inset-x-0 bottom-0 z-50 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:inset-x-auto
           bg-[color:var(--modal-bg)] sm:rounded-[var(--modal-radius)] shadow-[var(--modal-shadow)] border-t border-[color:var(--border-subtle)] sm:border
           max-h-[90vh] overflow-hidden flex flex-col {className}"
    style="z-index: 10000;"
    role="dialog"
    aria-labelledby="filter-modal-title"
    aria-describedby="filter-modal-description"
    aria-modal="true"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-base)]">
      <div class="flex-1">
        <h2 
          use:titleEl
          id="filter-modal-title"
          class="text-lg font-semibold text-[color:var(--text-primary)] leading-6"
        >
          {title}
        </h2>
        <p id="filter-modal-description" class="text-sm text-[color:var(--text-secondary)] mt-0.5">
          {#if previewResultCount !== undefined}
            Preview: {previewResultCount.toLocaleString()} results
            {#if hasPendingChanges}
              <span class="text-[color:var(--warning-600)]">(unsaved changes)</span>
            {/if}
          {:else}
            Use filters to find exactly what you're looking for
          {/if}
        </p>
      </div>
      
      <button
        use:close
        onclick={handleCancel}
        class="p-2 rounded-[var(--radius-md)] hover:bg-[color:var(--surface-subtle)] 
               transition-colors duration-[var(--duration-base)]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
        aria-label={closeLabel}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto py-1">
      {#each sections as section (section.key)}
        <div class="border-b border-[color:var(--border-subtle)] py-4 last:border-b-0">
          <h3 class="text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wide px-4 mb-3">
            {section.label}
          </h3>
          
          {#if section.type === 'pills' && section.options}
            <div class="px-4">
              <FilterPillGroup
                bind:value={localFilters[section.key]}
                options={[{ value: 'all', label: i18n.category_all() }, ...section.options]}
                onValueChange={(value) => handleFilterChange(section.key, value)}
                announceChanges={false}
                class="flex-wrap gap-2"
                pillClass="min-h-8"
              />
            </div>
          {:else if section.type === 'range'}
            <div class="px-4">
              <div class="flex gap-2 items-center">
                <div class="flex-1">
                  <input
                    type="number"
                    placeholder={section.placeholder?.min || minPriceLabel}
                    value={localFilters[`${section.key}_min`] || ''}
                    oninput={(e) => handlePriceInput(section.key, 'min', e)}
                    class="w-full px-3 py-2 border border-[color:var(--border-default)] rounded-[var(--radius-md)] 
                           text-sm text-center min-h-[var(--touch-standard)]
                           bg-[color:var(--surface-base)] text-[color:var(--text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-transparent
                           transition-colors duration-[var(--duration-base)]"
                    aria-label="{section.label} minimum value"
                  />
                </div>
                
                <span class="text-[color:var(--text-tertiary)] text-sm" aria-hidden="true">-</span>
                
                <div class="flex-1">
                  <input
                    type="number"
                    placeholder={section.placeholder?.max || maxPriceLabel}
                    value={localFilters[`${section.key}_max`] || ''}
                    oninput={(e) => handlePriceInput(section.key, 'max', e)}
                    class="w-full px-3 py-2 border border-[color:var(--border-default)] rounded-[var(--radius-md)] 
                           text-sm text-center min-h-[var(--touch-standard)]
                           bg-[color:var(--surface-base)] text-[color:var(--text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-transparent
                           transition-colors duration-[var(--duration-base)]"
                    aria-label="{section.label} maximum value"
                  />
                </div>
              </div>
            </div>
          {:else if section.type === 'custom' && customSection}
            <div class="px-4">
              {@render customSection(section)}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-[color:var(--border-subtle)] p-4 bg-[color:var(--surface-subtle)] flex flex-col gap-3 sm:flex-row-reverse sm:gap-2">
      <!-- Apply Button -->
      <button
        onclick={handleApply}
        class="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 
               bg-[color:var(--primary)] text-[color:var(--primary-fg)] 
               rounded-[var(--radius-md)] font-medium text-sm
               min-h-[var(--touch-primary)] 
               hover:bg-[color:var(--primary-600)] active:scale-98
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]
               transition-all duration-[var(--duration-base)]
               {hasPendingChanges ? 'ring-2 ring-[color:var(--primary-200)]' : ''}
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-describedby="apply-button-description"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {applyLabel}
        {#if hasPendingChanges}
          <span class="w-1.5 h-1.5 bg-[color:var(--primary-200)] rounded-full" aria-hidden="true"></span>
        {/if}
      </button>
      <p id="apply-button-description" class="sr-only">
        {#if hasPendingChanges}
          You have unsaved filter changes. Click to apply them.
        {:else}
          Apply current filter settings
        {/if}
      </p>
      
      <!-- Cancel Button -->
      <button
        onclick={handleCancel}
        class="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 
               text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-muted)]
               rounded-[var(--radius-md)] font-medium text-sm
               min-h-[var(--touch-standard)]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]
               transition-colors duration-[var(--duration-base)]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {cancelLabel}
      </button>
      
      <!-- Clear Button -->
      {#if hasActiveFilters}
        <button
          onclick={handleClear}
          class="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 
                 text-[color:var(--text-secondary)] hover:text-[color:var(--danger-600)] hover:bg-[color:var(--danger-50)]
                 rounded-[var(--radius-md)] font-medium text-sm
                 min-h-[var(--touch-standard)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]
                 transition-colors duration-[var(--duration-base)]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {clearLabel}
        </button>
      {/if}
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

  /* Smooth modal animations */
  :global([data-dialog-overlay]) {
    animation: fade-in var(--duration-base) var(--ease-out);
  }
  
  :global([data-dialog-content]) {
    animation: modal-in var(--duration-base) var(--ease-out);
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes modal-in {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0%);
    }
  }
  
  /* Desktop modal animation */
  @media (min-width: 640px) {
    @keyframes modal-in {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }
  
  /* Enhanced scrolling */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* Button press feedback */
  .active\:scale-98:active {
    transform: scale(0.98);
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    [role="dialog"] {
      outline: 3px solid currentColor;
    }
    
    button:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    :global([data-dialog-overlay]),
    :global([data-dialog-content]) {
      animation: none;
    }
    
    button {
      transition: none;
    }
    
    button:active {
      transform: none;
    }
    
    .overflow-y-auto {
      scroll-behavior: auto;
    }
  }
</style>