<script lang="ts">
import type { Database } from '@repo/database';
import type { Snippet } from 'svelte';
import SearchDropdown from './SearchDropdown.svelte';

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
  maxResults = 5
}: Props = $props();

let inputElement: HTMLInputElement;
let focused = $state(false);
let dropdownVisible = $derived(focused && showDropdown && searchValue.trim().length > 0);

function handleSubmit(event: Event) {
  event.preventDefault();
  if (searchValue.trim()) {
    onSearch?.(searchValue.trim());
    inputElement.blur();
  }
}

function handleKeydown(event: KeyboardEvent) {
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

<div class="relative w-full {className}">
  <form onsubmit={handleSubmit} class="bg-white rounded-lg flex items-center relative shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
        class="w-full h-12 pl-10 {rightSection ? 'pr-16' : 'pr-4'} bg-transparent border-0 text-base placeholder-gray-500 focus:ring-0 focus:outline-none"
        autocomplete="off"
        spellcheck="false"
        aria-label={placeholder}
      />
      <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        {searchValue}
        {searchFunction}
        {maxResults}
        onProductSelect={handleProductSelect}
      />
    </div>
  {/if}
</div>