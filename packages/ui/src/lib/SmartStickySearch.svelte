<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { EnhancedSearchBar } from '.';
  import * as i18n from '@repo/i18n';
  

  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    show?: boolean;
    observeTarget?: string; // CSS selector for element to observe
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    show = $bindable(false),
    observeTarget = '#hero-search-container',
    class: className = ''
  }: Props = $props();

  let observer: IntersectionObserver | null = null;
  let searchTimeout: NodeJS.Timeout;

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
      <div class="max-w-4xl mx-auto relative">
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
      
    </div>
  </div>

  <!-- Spacer to prevent content jumping -->
  <div class="h-20 bg-transparent"></div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>

