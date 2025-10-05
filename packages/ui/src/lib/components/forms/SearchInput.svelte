<script lang="ts">
import type { Database } from '@repo/database';
import type { Snippet } from 'svelte';
import { useAnalytics } from '../../hooks/analytics.js';
import SearchDropdown from '../navigation/SearchDropdown.svelte';

// Define ProductWithImages type locally
type Product = Database['public']['Tables']['products']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];

export interface ProductWithImages extends Product {
  images: ProductImage[];
  category_name?: string;
  seller_name?: string;
  seller_username?: string;
  seller_rating?: number;
}

interface Props {
  searchValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onProductSelect?: (product: ProductWithImages) => void;
  searchFunction?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
  leftSection?: Snippet;
  rightSection?: Snippet;
  class?: string;
  searchId?: string;
  showDropdown?: boolean;
  maxResults?: number;
  mode?: 'power' | 'compact' | 'full';
}

let {
  searchValue = $bindable(''),
  placeholder = 'Search...',
  onSearch,
  onProductSelect,
  searchFunction,
  leftSection,
  rightSection,
  class: className = '',
  searchId = 'search-input',
  showDropdown = true,
  maxResults = 5,
  mode = 'full'
}: Props = $props();

// Analytics hooks
const { trackSearch, trackSearchPerformance } = useAnalytics();

let inputElement: HTMLInputElement;
let focused = $state(false);
let dropdownVisible = $derived.by(() => {
	return focused && showDropdown && searchValue.trim().length > 0;
});
const listboxId = $derived(`${searchId}-listbox`);


function handleSubmit(event: Event) {
  event.preventDefault();
  if (searchValue.trim()) {
    const startTime = performance.now();

    // Track search submission
    trackSearch({
      query: searchValue.trim(),
      mode: mode as any,
      session_id: '' // Will be set by analytics service
    });

    onSearch?.(searchValue.trim());
    inputElement.blur();

    // Note: Performance tracking would happen in parent component when results are received
  }
}

function handleKeydown(event: KeyboardEvent) {
  // Prevent event bubbling that could interfere with dropdown handling
  event.stopPropagation();

  if (event.key === 'Enter') {
    handleSubmit(event);
  } else if (event.key === 'Escape') {
    inputElement.blur();
  }
}

function handleProductSelect(product: ProductWithImages) {
  onProductSelect?.(product);
  focused = false;
}
</script>

<div class="search-input-container relative w-full {className}">
  <form onsubmit={handleSubmit} class="bg-[color:var(--surface-emphasis)] rounded-[var(--input-radius)] flex items-center relative shadow-none border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-muted)] focus-within:bg-[color:var(--surface-muted)] transition-colors">
    {#if leftSection}
      {@render leftSection()}
    {/if}

    <div class="flex-1 relative">
      <input
        bind:this={inputElement}
        bind:value={searchValue}
        onkeydown={handleKeydown}
        onfocus={() => focused = true}
        onblur={() => setTimeout(() => focused = false, 200)}
        type="search"
        id={searchId}
        {placeholder}
        class="w-full h-11 pl-10 {rightSection ? 'pr-16' : 'pr-4'} bg-transparent border-0 text-base text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:ring-0 focus:outline-none"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={dropdownVisible}
        aria-controls={listboxId}
        aria-label={placeholder}
      />
      <svg class="absolute left-3 top-3 w-5 h-5 text-[color:var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    {#if rightSection}
      {@render rightSection()}
    {/if}
  </form>

  {#if dropdownVisible && searchFunction}
    <div class="absolute top-full left-0 right-0 mt-1 z-50">
      <SearchDropdown
        query={searchValue}
        onSearch={searchFunction}
        {maxResults}
        visible={dropdownVisible}
        listboxId={listboxId}
        onSelect={handleProductSelect}
        onClose={() => { focused = false; }}
      />
    </div>
  {/if}
</div>
