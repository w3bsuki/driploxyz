<script lang="ts">
  import { LazySearchResults as SharedLazySearchResults } from '@repo/ui';
  import { createLazyLoader, loadComponent } from '$lib/utils/performance';
  import { searchProducts } from '$lib/remote/products.remote';
  
  interface Props {
    searchQuery?: string;
    filters?: any;
    onProductClick: (product: any) => void;
    onFavorite: (product: any) => void;
    translations?: Record<string, any>;
    class?: string;
  }
  
  let { 
    searchQuery = '', 
    filters = {},
    onProductClick, 
    onFavorite,
    translations = {},
    class: className = ''
  }: Props = $props();
  
  // Pass app-specific dependencies to shared component
</script>

<SharedLazySearchResults
  {searchQuery}
  {filters}
  {onProductClick}
  {onFavorite}
  {translations}
  searchFunction={searchProducts}
  {loadComponent}
  {createLazyLoader}
  class={className}
/>