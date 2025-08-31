<script lang="ts">
  import { SearchBar } from '@repo/ui';
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
    isDropdownOpen?: boolean;
  }

  let { 
    searchQuery = $bindable(), 
    categories, 
    onSearch, 
    onFilter,
    isDropdownOpen = false
  }: Props = $props();
  
  let selectedCategoryIndex = $state(-1);

  function navigateToCategory(categorySlug: string) {
    goto(`/category/${categorySlug}`);
  }

  async function prefetchCategory(categorySlug: string) {
    const path = `/category/${categorySlug}`;
    try {
      await preloadCode(path);
      // Start data preload on interaction; it will be cached if user navigates
      preloadData(path).catch(() => {});
    } catch (e) {
      // ignore
    }
  }
  
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
    
    const buttons = document.querySelectorAll('[role="group"] button');
    buttons[selectedCategoryIndex + 1]?.focus();
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
    <SearchBar 
      bind:value={searchQuery}
      {onSearch}
      {onFilter}
      {isDropdownOpen}
      showCategoriesButton={true}
      placeholder="Search for anything..."
      searchId="hero-search"
    />
    
    <!-- Category Pills -->
    <nav 
      role="group"
      aria-label="Quick category filters"
      class="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:gap-3"
    >
      <button 
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
