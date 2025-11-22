<script lang="ts">
  import { IntegratedSearchBar } from '@repo/ui';
  import { goto, preloadCode, preloadData } from '$app/navigation';

  interface Category {
    id: string;
    name: string;
    slug: string;
  }

  interface Props {
    searchQuery: string;
    categories: Category[];
    onSearch: (query: string) => void;
    onFilter: () => void;
  }

  let {
    searchQuery = $bindable(''),
    categories,
    onSearch,
    onFilter
  }: Props = $props();
  
  let selectedCategoryIndex = $state(-1);
  let categoryButtons: HTMLButtonElement[] = $state([]);
  let viewAllButton: HTMLButtonElement | undefined = $state();

  function navigateToCategory(categorySlug: string) {
    goto(`/category/${categorySlug}`);
  }
// ...existing code...
  function handleKeyNavigation(e: KeyboardEvent, index: number) {
    switch(e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        selectedCategoryIndex = Math.min(index + 1, categories.length - 1);
        break;
      case 'ArrowLeft':  
      case 'ArrowUp':
        e.preventDefault();
        selectedCategoryIndex = Math.max(index - 1, -1);
        break;
      case 'Home':
        e.preventDefault();
        selectedCategoryIndex = -1;
        break;
      case 'End':
        e.preventDefault();
        selectedCategoryIndex = categories.length - 1;
        break;
    }
    
    if (selectedCategoryIndex === -1) {
      viewAllButton?.focus();
    } else {
      categoryButtons[selectedCategoryIndex]?.focus();
    }
  }
</script>

<!-- Sticky Search & Categories Container -->
<section 
  class="sticky z-30 bg-gray-50 border-b border-gray-200"
  style="top: var(--app-header-offset, 56px);"
  aria-label="Search and filter products"
>
  <div class="px-4 sm:px-6 lg:px-8 py-4 space-y-3">
    <!-- Search Bar -->
    <IntegratedSearchBar
      bind:searchValue={searchQuery}
      onSearch={(query) => onSearch(query)}
      placeholder="Search for anything..."
      searchId="hero-search"
      class="w-full"
    >
      {#snippet leftSection()}
        <button
          onclick={onFilter}
          class="h-12 px-3 rounded-l-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
          aria-label="Categories"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="text-sm text-gray-600 hidden sm:inline">Categories</span>
        </button>
      {/snippet}
    </IntegratedSearchBar>
    
    <!-- Category Pills -->
    <nav 
      role="group"
      aria-label="Quick category filters"
      class="flex gap-1.5 overflow-x-auto scrollbarhide -mx-4 px-4 sm:mx-0 sm:px-0 sm:gap-3"
    >
      <button 
        bind:this={viewAllButton}
        onmouseenter={() => preloadCode('/search')}
        ontouchstart={() => preloadCode('/search')}
        onclick={() => goto('/search')}
        onkeydown={(e: KeyboardEvent) => handleKeyNavigation(e, -1)}
        class="category-nav-pill shrink-0 min-h-[--touch-standard] px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        aria-label="View all categories"
      >
        View all
      </button>
      {#each categories as category, i}
        <button 
          bind:this={categoryButtons[i]}
          onmouseenter={() => prefetchCategory(category.slug)}
          ontouchstart={() => prefetchCategory(category.slug)}
          onclick={() => navigateToCategory(category.slug)}
          onkeydown={(e: KeyboardEvent) => handleKeyNavigation(e, i)}
          class="category-nav-pill shrink-0 min-h-[--touch-standard] px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          aria-label="Browse {category.name}"
        >
          {category.name}
        </button>
      {/each}
    </nav>
  </div>
</section>
