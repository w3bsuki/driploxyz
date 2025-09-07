<script lang="ts">
  import { Tooltip } from '@repo/ui';
  
  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onFilter?: () => void;
    showCategoriesButton?: boolean;
    categoriesText?: string;
    isDropdownOpen?: boolean;
    searchId?: string;
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    onFilter,
    showCategoriesButton = true,
    categoriesText = 'Categories', // Will be overridden by parent component
    isDropdownOpen = false,
    searchId = 'search-input',
    class: className = ''
  }: Props = $props();

  function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value.trim());
    }
  }
  
  function handleClear() {
    value = '';
    const input = document.getElementById(searchId) as HTMLInputElement;
    input?.focus();
  }
</script>

<form 
  role="search"
  class="bg-[color:var(--surface-base)] rounded-lg border border-[color:var(--border-subtle)] p-1 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[color:var(--state-focus)] focus-within:border-[color:var(--border-focus)] transition-colors {className}"
  onsubmit={(e: SubmitEvent) => { e.preventDefault(); if (value.trim()) onSearch?.(value.trim()); }}
>
  <div class="bg-[color:var(--surface-subtle)] relative rounded-lg overflow-hidden min-h-11 sm:min-h-12">
    <div class="relative flex items-center min-h-11 sm:min-h-12">
      <label for={searchId} class="sr-only">{placeholder}</label>
      <div class="absolute left-3 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <svg class="w-5 h-5 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        id={searchId}
        bind:value
        {placeholder}
        type="search"
        autocomplete="off"
        spellcheck="false"
        aria-label={placeholder}
        aria-describedby="{searchId}-hint"
        class="flex-1 bg-transparent text-sm sm:text-base placeholder-[color:var(--text-placeholder)] text-[color:var(--text-primary)] focus:outline-none border-0 focus:ring-0 min-w-0 pl-10 pr-2 py-2.5 sm:py-3"
        onkeydown={handleSubmit}
      />
      <span id="{searchId}-hint" class="sr-only">Press Enter to search</span>
      
      <div class="flex items-center pr-2 gap-1">
        {#if value}
          <Tooltip 
            content="Clear search"
            positioning={{ side: 'top', align: 'center' }}
            openDelay={500}
            closeDelay={200}
          >
            {#snippet trigger()}
              <button
                type="button"
                onclick={handleClear}
                class="p-1.5 min-h-[var(--touch-standard)] min-w-[var(--touch-standard)] hover:bg-[color:var(--surface-muted)] rounded-full transition-colors mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]"
                aria-label="Clear search query"
              >
                <svg class="w-4 h-4 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/snippet}
          </Tooltip>
        {/if}
        
        {#if showCategoriesButton}
          <button
            type="button"
            onclick={onFilter}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-label="{categoriesText} filter"
            class="px-2 py-1 min-h-[var(--touch-standard)] bg-[color:var(--surface)] rounded-md hover:bg-[color:var(--surface-muted)] transition-colors flex items-center gap-1 border border-[color:var(--border-default)] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--state-focus)]"
          >
            <svg 
              class="w-4 h-4 text-[color:var(--text-secondary)] shrink-0 transition-transform {isDropdownOpen ? 'rotate-180' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span class="text-xs font-medium text-[color:var(--text-secondary)] hidden sm:inline">{categoriesText}</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
</form>

<style>
  /* Respect prefers-reduced-motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global(.transition-colors),
    :global(.transition-transform) {
      transition: none !important;
      transform: none !important;
    }
  }
</style>