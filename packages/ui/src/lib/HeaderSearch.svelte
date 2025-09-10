<script lang="ts">
  import IntegratedSearchBar from './IntegratedSearchBar.svelte';

  interface Props {
    placeholder?: string;
    onSearch?: (query: string) => void;
    class?: string;
  }

  let { 
    placeholder = 'Search...',
    onSearch,
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
  <IntegratedSearchBar
    {placeholder}
    onSearch={handleSearch}
    class="w-full"
    searchId="header-search"
  />
</div>