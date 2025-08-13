<script lang="ts">
  import { SearchBar } from '@repo/ui';
  import { goto } from '$app/navigation';

  interface Props {
    searchQuery: string;
    categories: any[];
    onSearch: (query: string) => void;
    onFilter: () => void;
  }

  let { searchQuery = $bindable(), categories, onSearch, onFilter }: Props = $props();

  function navigateToCategory(categorySlug: string) {
    goto(`/category/${categorySlug}`);
  }
</script>

<!-- Sticky Search & Categories Container -->
<div class="sticky top-14 sm:top-16 z-30 bg-gray-50 border-b border-gray-200">
  <div class="px-4 sm:px-6 lg:px-8 py-4 space-y-3">
    <!-- Search Bar -->
    <SearchBar 
      bind:value={searchQuery}
      {onSearch}
      {onFilter}
      showCategoryDropdown={true}
      placeholder="Search for anything..."
      suggestions={['Vintage jackets', 'Designer bags', 'Summer dresses', 'Sneakers']}
    />
    
    <!-- Category Pills -->
    <div class="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:gap-3">
      {#each categories as category}
        <button 
          onclick={() => navigateToCategory(category.slug)}
          class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          {category.name}
        </button>
      {/each}
      <button 
        onclick={() => goto('/search')}
        class="flex-shrink-0 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors"
      >
        View all
      </button>
    </div>
  </div>
</div>