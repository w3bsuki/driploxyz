<script lang="ts">
  import type { SearchBarVariant } from './types.js';

  interface Props {
    value?: string;
    placeholder?: string;
    categoriesText?: string;
    suggestions?: string[];
    variant?: SearchBarVariant;
    showCategoryDropdown?: boolean;
    onSearch?: (query: string) => void;
    onSuggestionClick?: (suggestion: string) => void;
    onFilter?: () => void;
    onCategorySelect?: (category: string) => void;
    onOpenMegaMenu?: () => void;
    onNavigate?: (path: string) => void;
    showMegaMenuButton?: boolean;
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search clothing, brands, styles...',
    categoriesText = 'Categories',
    suggestions = [],
    variant = 'hero',
    showCategoryDropdown = false,
    onSearch,
    onSuggestionClick,
    onFilter,
    onCategorySelect,
    onOpenMegaMenu,
    onNavigate,
    showMegaMenuButton = false,
    class: className = ''
  }: Props = $props();

  let showSuggestions = $state(false);
  let showCategories = $state(false);
  let inputElement: HTMLInputElement | undefined = $state();
  
  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Kids', value: 'kids' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Shoes', value: 'shoes' }
  ];

  // Derived styles based on variant
  const containerClasses = $derived({
    hero: 'bg-white rounded-full border border-gray-200 p-1 shadow-sm hover:shadow-md focus-within:border-gray-400 transition-all',
    compact: 'relative flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-gray-400 transition-colors',
    power: 'relative flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-gray-400 transition-colors'
  }[variant]);

  const inputClasses = $derived({
    hero: 'flex-1 bg-transparent text-base placeholder-gray-500 focus:outline-none min-w-0 pl-10 pr-2 py-3',
    compact: 'w-full bg-transparent pl-9 pr-10 py-2 text-sm placeholder-gray-500 focus:outline-hidden',
    power: 'w-full bg-transparent pl-10 pr-24 py-3 text-base sm:text-sm placeholder-gray-500 focus:outline-hidden'
  }[variant]);

  const iconSize = $derived(variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5');
  const showButton = $derived(variant === 'hero' || variant === 'power');

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (value.trim()) {
      onSearch?.(value.trim());
      showSuggestions = false;
    }
  }

  function handleInput() {
    showSuggestions = value.length > 0 && suggestions.length > 0;
  }

  function handleFocus() {
    if (showCategoryDropdown && !value) {
      showCategories = true;
    } else {
      showSuggestions = value.length > 0 && suggestions.length > 0;
    }
  }

  function handleBlur() {
    setTimeout(() => {
      showSuggestions = false;
      showCategories = false;
    }, 200);
  }
  
  function handleClear() {
    value = '';
    inputElement?.focus();
  }

  function handleSuggestionClick(suggestion: string) {
    value = suggestion;
    onSuggestionClick?.(suggestion);
    showSuggestions = false;
    inputElement?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (value.trim()) {
        onSearch?.(value.trim());
        showSuggestions = false;
      }
    }
  }

  function handleCategoryClick(category: string) {
    onCategorySelect?.(category);
    showCategories = false;
    onNavigate?.(category === 'all' ? '/search' : `/category/${category}`);
  }
</script>

<!-- Unified SearchBar with variant-specific styling -->
<div class="search-input relative {className}">
  <div class="{containerClasses}">
    {#if variant === 'hero'}
      <div class="bg-gray-50 relative rounded-full overflow-hidden min-h-[48px]">
        <div class="relative flex items-center min-h-[48px]">
          <!-- Search Icon -->
          <div class="absolute left-3 flex items-center justify-center pointer-events-none">
            <svg class="{iconSize} text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <!-- Input -->
          <input
            bind:this={inputElement}
            bind:value
            {placeholder}
            type="search"
            class="{inputClasses}"
            oninput={handleInput}
            onfocus={handleFocus}
            onblur={handleBlur}
            onkeydown={handleKeydown}
          />
          
          <!-- Clear and Action Buttons -->
          <div class="flex items-center pr-2 gap-1">
            {#if value}
              <button
                type="button"
                onclick={handleClear}
                class="p-1.5 hover:bg-gray-200 rounded-full transition-colors mr-1"
                aria-label="Clear search"
              >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
            
            {#if showButton}
              <button
                type="button"
                onclick={() => showMegaMenuButton ? onOpenMegaMenu?.() : onFilter?.()}
                class="px-3 py-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1 ring-1 ring-gray-200 whitespace-nowrap"
              >
                {#if showMegaMenuButton}
                  <svg class="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                {/if}
                <span class="text-xs font-medium text-gray-600 hidden sm:inline">{categoriesText}</span>
              </button>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <!-- Compact/Power variants -->
      <div class="absolute left-3 flex items-center justify-center pointer-events-none">
        <svg class="{iconSize} text-gray-{variant === 'power' ? '600' : '500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        bind:this={inputElement}
        bind:value
        {placeholder}
        type="search"
        class="{inputClasses}"
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={handleKeydown}
      />
      
      {#if value}
        <button
          type="button"
          onclick={handleClear}
          class="absolute {variant === 'power' ? 'right-20' : 'right-2'} p-1 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Clear search"
        >
          <svg class="{variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
      
      {#if variant === 'power'}
        <button
          type="button"
          onclick={() => onFilter?.()}
          class="absolute right-3 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          aria-label="Filter results"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      {/if}
    {/if}
  </div>

  <!-- Category Dropdown -->
  {#if showCategories && showCategoryDropdown}
    <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50">
      <div class="p-2">
        <div class="text-xs text-gray-500 px-3 py-2 font-semibold uppercase">Shop by Category</div>
        {#each categories as category}
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-md focus:bg-gray-50 focus:outline-hidden flex items-center justify-between group"
            onclick={() => handleCategoryClick(category.value)}
          >
            <span>{category.label}</span>
            <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Suggestions Dropdown -->
  {#if showSuggestions && suggestions.length > 0}
    <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {#each suggestions as suggestion}
        <button
          type="button"
          class="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden flex items-center space-x-3"
          onclick={() => handleSuggestionClick(suggestion)}
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{suggestion}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>