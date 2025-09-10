<script lang="ts">
  import type { Database } from '@repo/database';
  import type { Snippet } from 'svelte';
  import SearchDropdown from './SearchDropdown.svelte';
  import { goto } from '$app/navigation';

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
    searchId = 'enhanced-search-input',
    showDropdown = true,
    maxResults = 5
  }: Props = $props();

  let inputElement: HTMLInputElement;
  let focused = $state(false);
  let dropdownVisible = $derived(focused && showDropdown && searchValue !== undefined);

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchValue = value;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (searchValue?.trim()) {
      const query = searchValue.trim();
      if (onSearch) {
        onSearch(query);
      } else {
        goto(`/search?q=${encodeURIComponent(query)}`);
      }
      inputElement?.blur();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchValue?.trim()) {
      const query = searchValue.trim();
      if (onSearch) {
        onSearch(query);
      } else {
        goto(`/search?q=${encodeURIComponent(query)}`);
      }
      inputElement?.blur();
    }
  }

  function handleFocus() {
    focused = true;
  }

  function handleBlur() {
    // Delay blur to allow dropdown clicks
    setTimeout(() => {
      focused = false;
    }, 200);
  }

  function handleProductSelect(product: ProductWithImages) {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      goto(`/product/${product.id}`);
    }
    inputElement?.blur();
    focused = false;
  }
</script>

<form onsubmit={handleSubmit} class="w-full relative {className}">
  <div class="bg-white rounded-xl flex items-center relative shadow-sm border border-gray-200 hover:shadow-md transition-shadow {dropdownVisible && searchValue?.trim() ? 'rounded-b-none border-b-0' : ''}">
    <!-- Left Section (Category Dropdown/Filter) -->
    {#if leftSection}
      <div class="shrink-0">
        {@render leftSection()}
      </div>

      <!-- Vertical Separator -->
      <div class="w-px h-6 bg-gray-300"></div>
    {/if}
    
    <!-- Search Input -->
    <div class="flex-1 relative">
      <input
        bind:this={inputElement}
        id={searchId}
        type="search"
        value={searchValue || ''}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        onfocus={handleFocus}
        onblur={handleBlur}
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

    <!-- Right Section (Dropdown/Actions) -->
    {#if rightSection}
      <!-- Vertical Separator -->
      <div class="w-px h-6 bg-gray-300"></div>
      
      <div class="shrink-0">
        {@render rightSection()}
      </div>
    {/if}
  </div>

  <!-- Search Dropdown -->
  {#if dropdownVisible && searchFunction}
    <SearchDropdown
      query={searchValue || ''}
      onSearch={searchFunction}
      onSelect={handleProductSelect}
      {maxResults}
      class="border-t-0"
    />
  {/if}
</form>