<script lang="ts">
  import { SearchBar } from '@repo/ui';
  
  interface Props {
    value?: string;
    placeholder?: string;
    show?: boolean;
    onSearch: (query: string) => void;
  }
  
  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    show = false,
    onSearch
  }: Props = $props();
</script>

{#if show}
  <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-2xl mx-auto px-4 py-1.5">
      <SearchBar 
        bind:value
        {placeholder}
        {onSearch}
        showCategoriesButton={false}
      />
    </div>
  </div>
{/if}