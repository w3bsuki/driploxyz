<script lang="ts">
/**
 * FilterDrawer - Mobile bottom sheet for product filtering
 * 
 * Features:
 * - Brand search-select
 * - Condition pills with emojis
 * - Price range dual-thumb slider
 * - Size pills (dynamic)
 * - Sort options (radio)
 * - Sticky footer with preview count
 */

interface FilterSection {
  key: string;
  label: string;
  type: 'pills' | 'search-select' | 'range-slider' | 'radio';
}

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
  
  // Data for filter sections
  brands?: string[];
  conditions?: { value: string; label: string; emoji: string }[];
  sizes?: string[];
  sortOptions?: { value: string; label: string }[];
  priceRange?: { min: number; max: number };
  
  class?: string;
}

let {
  isOpen = false,
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

// Local filter state (pending changes)
let pendingFilters = $state<FilterValue>({ ...currentFilters });
let brandSearchQuery = $state('');
let dialogEl = $state<HTMLDivElement | null>(null);
let sheetEl = $state<HTMLDivElement | null>(null);
let closeBtnEl = $state<HTMLButtonElement | null>(null);
let previousBodyOverflow: string | null = null;

// Update pending filters when currentFilters change
$effect(() => {
  if (currentFilters) {
    pendingFilters = { ...currentFilters };
  }
});

// Filtered brands based on search
const filteredBrands = $derived.by(() => {
  if (!brandSearchQuery) return brands.slice(0, 20); // Show first 20
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
  onClose?.();
}

function handleClear() {
  pendingFilters = {};
  onClear?.();
}

function handleClose() {
  // Reset to current filters
  pendingFilters = { ...currentFilters };
  onClose?.();
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose();
  }
}

// Lock body scroll while drawer is open
$effect(() => {
  if (typeof document === 'undefined') return;
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    // Focus management: move focus into the drawer
    queueMicrotask(() => {
      if (closeBtnEl) closeBtnEl.focus();
      else if (sheetEl) sheetEl.focus();
      else if (dialogEl) dialogEl.focus();
    });
    return () => {
      document.body.style.overflow = previousBodyOverflow ?? '';
    };
  }
});

// Basic focus trap within the sheet
function handleFocusTrap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !sheetEl) return;
  const focusable = sheetEl.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey) {
    if (active === first || !sheetEl.contains(active)) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (active === last || !sheetEl.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }
}

import { slide, fade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

// Portal action: moves the element to document.body for proper stacking
function portal(node: HTMLElement) {
  if (typeof document === 'undefined') return {} as any;
  
  const placeholder = document.createComment('portal-placeholder');
  node.parentNode?.insertBefore(placeholder, node);
  
  document.body.appendChild(node);
  
  return {
    destroy() {
      try {
        placeholder.parentNode?.insertBefore(node, placeholder);
        placeholder.remove();
      } catch {}
    }
  };
}
</script>

<!-- Backdrop & Drawer Container -->
{#if isOpen}
  <div
    use:portal
    role="dialog"
    aria-modal="true"
    aria-labelledby="filter-drawer-title"
    class="fixed inset-0 {className}"
    style="z-index: var(--z-modal, 1400);"
    tabindex="0"
    bind:this={dialogEl}
    onclick={handleBackdropClick}
    onkeydown={(e: KeyboardEvent) => { handleKeydown(e); handleFocusTrap(e); }}
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      aria-hidden="true"
      transition:fade={{ duration: 200 }}
    ></div>

    <!-- Bottom Sheet - Above backdrop naturally via DOM order -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white shadow-2xl flex flex-col outline-none rounded-t-2xl max-h-[calc(100vh-var(--app-header-offset,56px))]"
      style="bottom: env(safe-area-inset-bottom, 0px);"
      aria-label="Filter sheet"
      bind:this={sheetEl}
      tabindex="-1"
      transition:slide={{ duration: 300, easing: cubicOut }}
    >
      <!-- Drag Handle -->
      <div class="flex justify-center pt-3 pb-2">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 id="filter-drawer-title" class="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onclick={handleClose}
          class="flex items-center justify-center w-9 h-9
                 text-gray-600 hover:bg-gray-100 rounded-full
                 transition-colors duration-150
                 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Close"
          bind:this={closeBtnEl}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filter Sections (Scrollable) -->
      <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-6">
        
        <!-- Condition Filter -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Condition</h3>
          <div class="flex flex-wrap gap-2">
            {#each conditions as condition}
              {@const isActive = pendingFilters.condition === condition.value}
              <button
                type="button"
                onclick={() => toggleFilter('condition', condition.value)}
                class="flex items-center gap-2 px-4 h-11 
                       rounded-full flex-shrink-0
                       font-medium text-sm whitespace-nowrap
                       transition-all duration-200 ease-out
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                       {isActive
                         ? 'bg-brand-primary text-white shadow-md'
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}"
                aria-pressed={isActive}
              >
                <span class="text-base" aria-hidden="true">{condition.emoji}</span>
                <span>{condition.label}</span>
              </button>
            {/each}
          </div>
        </section>

        <!-- Price Range Filter -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label for="min-price" class="block text-xs text-gray-600 mb-1">Min</label>
                <input
                  id="min-price"
                  type="number"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={pendingFilters.minPrice ?? priceRange.min}
                  oninput={(e) => updateFilter('minPrice', parseInt((e.target as HTMLInputElement).value))}
                  class="w-full px-3 h-10 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <span class="text-gray-400 mt-6">—</span>
              <div class="flex-1">
                <label for="max-price" class="block text-xs text-gray-600 mb-1">Max</label>
                <input
                  id="max-price"
                  type="number"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={pendingFilters.maxPrice ?? priceRange.max}
                  oninput={(e) => updateFilter('maxPrice', parseInt((e.target as HTMLInputElement).value))}
                  class="w-full px-3 h-10 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <!-- Quick presets -->
            <div class="flex gap-2 flex-wrap">
              {#each [
                { label: 'Under $25', min: 0, max: 25 },
                { label: '$25-$50', min: 25, max: 50 },
                { label: '$50-$100', min: 50, max: 100 },
                { label: '$100+', min: 100, max: priceRange.max }
              ] as preset}
                <button
                  type="button"
                  onclick={() => {
                    updateFilter('minPrice', preset.min);
                    updateFilter('maxPrice', preset.max);
                  }}
                  class="px-3 h-9 text-xs font-medium
                         bg-gray-100 text-gray-700 rounded-lg
                         hover:bg-gray-200 active:scale-95
                         transition-all duration-150
                         focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {preset.label}
                </button>
              {/each}
            </div>
          </div>
        </section>

        <!-- Size Filter -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Size</h3>
          <div class="grid grid-cols-4 gap-2">
            {#each sizes as size}
              {@const isActive = pendingFilters.size === size}
              <button
                type="button"
                onclick={() => toggleFilter('size', size)}
                class="h-11 rounded-lg font-medium text-sm
                       transition-all duration-200 ease-out
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                       {isActive
                         ? 'bg-brand-primary text-white shadow-md'
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}"
                aria-pressed={isActive}
              >
                {size}
              </button>
            {/each}
          </div>
        </section>

        <!-- Brand Filter -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Brand</h3>
          <div class="space-y-3">
            <!-- Search input -->
            <div class="relative">
              <input
                type="text"
                bind:value={brandSearchQuery}
                placeholder="Search brands..."
                class="w-full px-3 pl-10 h-10 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Brand list -->
            <div class="space-y-1 max-h-48 overflow-y-auto">
              {#each filteredBrands as brand}
                {@const isActive = pendingFilters.brand === brand}
                <button
                  type="button"
                  onclick={() => toggleFilter('brand', brand)}
                  class="w-full flex items-center justify-between px-3 h-10 rounded-lg
                         text-left text-sm
                         transition-colors duration-150
                         focus:outline-none focus:ring-2 focus:ring-brand-primary
                         {isActive
                           ? 'bg-brand-primary/10 text-brand-primary font-medium'
                           : 'text-gray-700 hover:bg-gray-100'}"
                >
                  <span>{brand}</span>
                  {#if isActive}
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        </section>

        <!-- Sort Filter -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
          <div class="space-y-1">
            {#each sortOptions as option}
              {@const isActive = pendingFilters.sortBy === option.value}
              <button
                type="button"
                onclick={() => updateFilter('sortBy', option.value)}
                role="radio"
                aria-checked={isActive}
                class="w-full flex items-center justify-between px-4 h-12 rounded-lg
                       text-left text-sm
                       transition-colors duration-150
                       focus:outline-none focus:ring-2 focus:ring-brand-primary
                       {isActive
                         ? 'bg-brand-primary/10 text-brand-primary font-medium'
                         : 'text-gray-700 hover:bg-gray-100'}"
              >
                <span>{option.label}</span>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center
                            {isActive ? 'border-brand-primary' : 'border-gray-300'}">
                  {#if isActive}
                    <div class="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </section>

      </div>

      <!-- Sticky Footer -->
      <div class="flex items-center gap-3 px-4 py-4 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onclick={handleClear}
          class="flex-1 h-12 px-4
                 bg-gray-100 text-gray-700 font-medium rounded-lg
                 hover:bg-gray-200 active:scale-95
                 transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Clear All
        </button>
        <button
          type="button"
          onclick={handleApply}
          class="flex-1 h-12 px-4
                 bg-brand-primary text-white font-medium rounded-lg shadow-md
                 hover:bg-brand-primary/90 active:scale-95
                 transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          Apply ({previewCount.toLocaleString()})
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in-from-bottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .slide-in-from-bottom {
    animation-name: slide-in-from-bottom;
  }

  .fade-in {
    animation-name: fade-in;
  }

  .duration-200 {
    animation-duration: 200ms;
  }

  .duration-300 {
    animation-duration: 300ms;
  }

  .ease-out {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }

  .overscroll-contain {
    overscroll-behavior: contain;
  }
</style>
