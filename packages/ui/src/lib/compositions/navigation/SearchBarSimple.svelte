<script lang="ts">
/**
 * SearchBarSimple - Clean, minimal search bar for /search page
 * 
 * Mobile-first design with:
 * - Touch-optimized inputs (min 44px height)
 * - Browse dropdown trigger
 * - Filter modal trigger with count badge
 * - No embedded tabs/scopes
 */

interface Props {
  searchValue?: string;
  onSearch?: (query: string) => void;
  onBrowseClick?: () => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  placeholder?: string;
  class?: string;
}

let {
  searchValue = $bindable(''),
  onSearch,
  onBrowseClick,
  onFilterClick,
  activeFilterCount = 0,
  placeholder = 'Search for clothes, brands...',
  class: className = ''
}: Props = $props();

let inputElement: HTMLInputElement | undefined = $state();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  searchValue = target.value;
}

function handleSubmit(event: Event) {
  event.preventDefault();
  onSearch?.(searchValue);
}

function handleClear() {
  searchValue = '';
  inputElement?.focus();
  onSearch?.('');
}
</script>

<!-- Mobile-first search bar -->
<div class="w-full {className}">
  <form onsubmit={handleSubmit} class="relative">
    <div class="flex items-center gap-2">
      <!-- Browse Button (Mobile: Icon only, Desktop: Icon + Text) -->
      <button
        type="button"
        onclick={onBrowseClick}
        class="flex items-center justify-center gap-2 h-12 px-3 sm:px-4 
               bg-white border border-gray-300 rounded-lg
               hover:bg-gray-50 active:bg-gray-100
               transition-colors duration-150
               focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
               min-w-[44px]"
        aria-label="Browse categories"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="hidden sm:inline text-sm font-medium text-gray-700">Browse</span>
      </button>

      <!-- Search Input Container -->
      <div class="relative flex-1">
        <div class="relative">
          <!-- Search Icon -->
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Input Field -->
          <input
            bind:this={inputElement}
            type="text"
            value={searchValue}
            oninput={handleInput}
            {placeholder}
            class="w-full h-12 pl-10 pr-10 
                   bg-white border border-gray-300 rounded-lg
                   text-base text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                   transition-shadow duration-150"
            aria-label="Search products"
          />

          <!-- Clear Button (shown when there's text) -->
          {#if searchValue}
            <button
              type="button"
              onclick={handleClear}
              class="absolute inset-y-0 right-0 flex items-center pr-3
                     text-gray-400 hover:text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-brand-primary rounded"
              aria-label="Clear search"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      </div>

      <!-- Filter Button with Badge -->
      <button
        type="button"
        onclick={onFilterClick}
        class="relative flex items-center justify-center gap-2 h-12 px-3 sm:px-4
               bg-white border border-gray-300 rounded-lg
               hover:bg-gray-50 active:bg-gray-100
               transition-colors duration-150
               focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
               min-w-[44px]"
        aria-label="Open filters{activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="hidden sm:inline text-sm font-medium text-gray-700">Filters</span>
        
        <!-- Active Filter Count Badge -->
        {#if activeFilterCount > 0}
          <div class="absolute -top-1 -right-1 sm:-top-2 sm:-right-2
                      flex items-center justify-center
                      min-w-[20px] h-5 px-1.5
                      bg-brand-primary text-white text-xs font-bold rounded-full
                      animate-in fade-in zoom-in duration-200">
            {activeFilterCount}
          </div>
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  /* Custom animations */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes zoom-in {
    from { transform: scale(0.8); }
    to { transform: scale(1); }
  }

  .animate-in {
    animation: fade-in 200ms ease-out, zoom-in 200ms ease-out;
  }
</style>
