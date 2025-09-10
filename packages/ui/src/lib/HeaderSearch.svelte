<script lang="ts">
  import EnhancedSearchBar from './EnhancedSearchBar.svelte';
  import type { Database } from '@repo/database';

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
    placeholder?: string;
    onSearch?: (query: string) => void;
    searchFunction?: (query: string) => Promise<{ data: ProductWithImages[]; error: string | null }>;
    class?: string;
  }

  let { 
    placeholder = 'Search...',
    onSearch,
    searchFunction,
    class: className = ''
  }: Props = $props();

  function handleSearch(query: string) {
    if (onSearch) {
      onSearch(query);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }
</script>

<div class="hidden sm:flex flex-1 max-w-lg mx-8 {className}">
  <EnhancedSearchBar
    {placeholder}
    onSearch={handleSearch}
    {searchFunction}
    class="w-full"
    searchId="header-search"
    showDropdown={true}
    maxResults={6}
  />
</div>