<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  
  interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
  }

  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    quickFilters?: QuickFilter[];
    onFilterClick?: (filterValue: string) => void;
    show?: boolean;
    observeTarget?: string; // CSS selector for element to observe
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    quickFilters = [],
    onFilterClick,
    show = $bindable(false),
    observeTarget = '#hero-search-container',
    class: className = ''
  }: Props = $props();

  let observer: IntersectionObserver | null = null;
  let searchTimeout: NodeJS.Timeout;
  let inputElement: HTMLInputElement;

  function handleInput() {
    clearTimeout(searchTimeout);
    if (value.trim()) {
      searchTimeout = setTimeout(() => {
        onSearch?.(value.trim());
      }, 300);
    }
  }

  function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value.trim());
    }
  }
  
  function handleClear() {
    value = '';
    inputElement?.focus();
  }

  function getFilterButtonClasses(style: string = 'default'): string {
    const baseClasses = 'px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:scale-105 shrink-0 scroll-snap-align-start';
    
    switch(style) {
      case 'price':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'condition':
        return `${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`;
      case 'brand':
      case 'size':
        return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    }
  }

  // Set up intersection observer to show/hide sticky search
  $effect(() => {
    if (!browser) return;
    
    const target = document.querySelector(observeTarget);
    if (!target) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky search when hero search is out of view
        show = !entry.isIntersecting;
      },
      {
        threshold: 0,
        rootMargin: '-50px 0px 0px 0px' // Show when 50px past the top
      }
    );

    observer.observe(target);

    return () => {
      observer?.disconnect();
    };
  });
</script>

{#if show}
  <!-- Smart Sticky Search Bar (positioned below main header) -->
  <div 
    class="fixed left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm md:shadow-md md:backdrop-blur-sm transition-transform duration-200 {className}"
    style="top: var(--app-header-offset, 56px);"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div class="flex items-center gap-3">
        <!-- Compact Search Input -->
        <div class="flex-1 max-w-md">
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input
              bind:this={inputElement}
              bind:value
              {placeholder}
              type="search"
              autocomplete="off"
              spellcheck="false"
              class="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
              oninput={handleInput}
              onkeydown={handleSubmit}
            />
            
            {#if value}
              <button
                type="button"
                onclick={handleClear}
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>

        <!-- Quick Filter Pills -->
        {#if quickFilters.length > 0}
          <div class="hidden sm:flex items-center gap-1.5 overflow-x-auto scroll-snap-type-x scroll-snap-type-mandatory scrollbar-hide">
            {#each quickFilters.slice(0, 4) as filter}
              <button
                onclick={() => onFilterClick?.(filter.value)}
                class={getFilterButtonClasses(filter.style)}
              >
                {filter.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Spacer to prevent content jumping -->
  <div class="h-16 bg-transparent"></div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
