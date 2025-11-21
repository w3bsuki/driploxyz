<script lang="ts">
  import EnhancedSearchBar from './EnhancedSearchBar.svelte';
  import type { SearchFunction } from './search/types';

  interface Props {
    placeholder?: string;
    onSearch?: (query: string) => void;
  searchFunction?: SearchFunction;
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

<div class="hidden sm:flex flex-1 max-w-lg mx-[length:var(--space-8)] {className}">
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