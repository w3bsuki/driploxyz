<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { EnhancedSearchBar, LoadingSpinner } from '.';
  import * as i18n from '@repo/i18n';
  

  interface CategoryData {
    slug: string;
    name: string;
  }

  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    show?: boolean;
    observeTarget?: string; // CSS selector for element to observe
    class?: string;
    // Category pills props
    mainCategories?: CategoryData[];
    virtualCategories?: CategoryData[];
    loadingCategory?: string | null;
    onNavigateToCategory?: (slug: string) => Promise<void>;
    onNavigateToAllSearch?: () => Promise<void>;
    onPillKeyNav?: (e: KeyboardEvent, index: number) => void;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    show = $bindable(false),
    observeTarget = '#hero-search-container',
    class: className = '',
    // Category pills props
    mainCategories = [],
    virtualCategories = [],
    loadingCategory = null,
    onNavigateToCategory,
    onNavigateToAllSearch,
    onPillKeyNav
  }: Props = $props();

  let observer: IntersectionObserver | null = null;
  let searchTimeout: NodeJS.Timeout;

  // Derived category lookups to avoid repeated find() calls
  const womenCategory = $derived(mainCategories.find(c => c.slug === 'women'));
  const menCategory = $derived(mainCategories.find(c => c.slug === 'men'));
  const kidsCategory = $derived(mainCategories.find(c => c.slug === 'kids'));

  function handleInput() {
    clearTimeout(searchTimeout);
    if (value.trim()) {
      searchTimeout = setTimeout(() => {
        onSearch?.(value.trim());
      }, 300);
    }
  }

  function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value.trim());
    }
  }
  
  function handleClear() {
    value = '';
  }


  // Set up intersection observer to show/hide sticky search
  $effect(() => {
    if (!browser) return;
    
    const target = document.querySelector(observeTarget);
    if (!target) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky search when hero search is out of view
        show = !entry.isIntersecting;
      },
      {
        threshold: 0,
        rootMargin: '-50px 0px 0px 0px' // Show when 50px past the top
      }
    );

    observer.observe(target);

    return () => {
      observer?.disconnect();
    };
  });
</script>

{#if show}
  <!-- Sticky version of Main Page Search Bar with Glass Background -->
  <div 
    class="fixed left-0 right-0 z-40 bg-white/40 backdrop-blur-sm border-b border-gray-100 transition-transform duration-200 {className}"
    style="top: var(--app-header-offset, 56px);"
  >
    <div class="px-2 sm:px-4 lg:px-6 py-3">
      
      <!-- Main page search interface made sticky -->
      <div class="max-w-4xl mx-auto relative mb-3">
        <EnhancedSearchBar
          bind:searchValue={value}
          onSearch={(query) => onSearch?.(query)}
          {placeholder}
          searchId="sticky-hero-search-input"
          showDropdown={false}
        >
          {#snippet rightSection()}
            <button
              class="h-12 px-3 rounded-r-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
              aria-label={i18n.search_categories()}
            >
              <svg 
                class="w-4 h-4 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="text-sm font-medium text-gray-600 hidden sm:inline">{i18n.search_categories()}</span>
            </button>
          {/snippet}
        </EnhancedSearchBar>
      </div>

      <!-- Category Pills in Sticky Mode -->
      {#if mainCategories.length > 0 || virtualCategories.length > 0}
        <nav 
          class="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-1 sm:px-2 sm:justify-center"
          aria-label="Browse Categories"
        >
          <!-- All Categories -->
          <button 
            class="category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors whitespace-nowrap shadow-sm hover:shadow-md bg-black text-white hover:bg-gray-800 disabled:opacity-75 disabled:cursor-not-allowed {loadingCategory === 'all' ? 'gap-1.5' : ''}"
            disabled={loadingCategory === 'all'}
            aria-busy={loadingCategory === 'all'}
            aria-label="View All"
            onclick={() => onNavigateToAllSearch?.()}
            onkeydown={(e) => onPillKeyNav?.(e, 0)}
          >
            {#if loadingCategory === 'all'}
              <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
                <LoadingSpinner size="sm" color="white" />
              </span>
            {/if}
            <span>{i18n.search_all ? i18n.search_all() : 'All'}</span>
          </button>
          
          <!-- Women Category -->
          {#if womenCategory}
            <button 
              class="category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors whitespace-nowrap shadow-sm hover:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed {loadingCategory === womenCategory.slug ? 'gap-1.5' : ''}"
              disabled={loadingCategory === womenCategory.slug}
              aria-busy={loadingCategory === womenCategory.slug}
              aria-label="Browse Women"
              onclick={() => onNavigateToCategory?.(womenCategory.slug)}
              onkeydown={(e) => onPillKeyNav?.(e, 1)}
            >
              {#if loadingCategory === womenCategory.slug}
                <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
                  <LoadingSpinner size="sm" color="gray" />
                </span>
              {/if}
              <span>{womenCategory.name}</span>
            </button>
          {/if}
          
          <!-- Men Category -->
          {#if menCategory}
            <button 
              class="category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors whitespace-nowrap shadow-sm hover:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed {loadingCategory === menCategory.slug ? 'gap-1.5' : ''}"
              disabled={loadingCategory === menCategory.slug}
              aria-busy={loadingCategory === menCategory.slug}
              aria-label="Browse Men"
              onclick={() => onNavigateToCategory?.(menCategory.slug)}
              onkeydown={(e) => onPillKeyNav?.(e, 2)}
            >
              {#if loadingCategory === menCategory.slug}
                <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
                  <LoadingSpinner size="sm" color="gray" />
                </span>
              {/if}
              <span>{menCategory.name}</span>
            </button>
          {/if}
          
          <!-- Kids Category -->
          {#if kidsCategory}
            <button 
              class="category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors whitespace-nowrap shadow-sm hover:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed {loadingCategory === kidsCategory.slug ? 'gap-1.5' : ''}"
              disabled={loadingCategory === kidsCategory.slug}
              aria-busy={loadingCategory === kidsCategory.slug}
              aria-label="Browse Kids"
              onclick={() => onNavigateToCategory?.(kidsCategory.slug)}
              onkeydown={(e) => onPillKeyNav?.(e, 3)}
            >
              {#if loadingCategory === kidsCategory.slug}
                <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
                  <LoadingSpinner size="sm" color="gray" />
                </span>
              {/if}
              <span>{kidsCategory.name}</span>
            </button>
          {/if}
          
          <!-- Virtual Categories -->
          {#each virtualCategories as virtualCategory, index}
            <button 
              class="category-nav-pill shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center min-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors whitespace-nowrap shadow-sm hover:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed {loadingCategory === virtualCategory.slug ? 'gap-1.5' : ''}"
              disabled={loadingCategory === virtualCategory.slug}
              aria-busy={loadingCategory === virtualCategory.slug}
              aria-label="Browse {virtualCategory.name}"
              onclick={() => onNavigateToCategory?.(virtualCategory.slug)}
              onkeydown={(e) => onPillKeyNav?.(e, 4 + index)}
            >
              {#if loadingCategory === virtualCategory.slug}
                <span class="inline-flex w-4 h-4 justify-center items-center" aria-hidden="true">
                  <LoadingSpinner size="sm" color="gray" />
                </span>
              {/if}
              <span>{virtualCategory.name}</span>
            </button>
          {/each}
        </nav>
      {/if}
      
    </div>
  </div>

  <!-- Spacer to prevent content jumping -->
  <div class="h-32 bg-transparent"></div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>

