<script lang="ts">
/**
 * CategoryBrowseSheet - Mobile bottom sheet for category navigation
 * 
 * Features:
 * - L1→L2→L3 drill-down navigation
 * - Breadcrumb header with back button
 * - Slide-in animations
 * - Product counts per category
 * - Touch-friendly list items (min 44px)
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  product_count?: number;
  children?: Category[];
}

interface Props {
  isOpen?: boolean;
  categories?: Category[];
  onClose?: () => void;
  onCategorySelect?: (categoryPath: string[], level: number) => void;
  class?: string;
}

let {
  isOpen = false,
  categories = [],
  onClose,
  onCategorySelect,
  class: className = ''
}: Props = $props();

// Navigation state
let navigationStack = $state<{ categories: Category[]; title: string; path: string[] }[]>([
  { categories, title: 'Categories', path: [] }
]);

let currentLevel = $derived(navigationStack[navigationStack.length - 1] || { categories: [], title: 'Categories', path: [] });

// Navigate to subcategories
function navigateToSubcategories(category: Category) {
  if (category.children && category.children.length > 0) {
    navigationStack = [
      ...navigationStack,
      {
        categories: category.children,
        title: category.name,
        path: [...currentLevel.path, category.slug]
      }
    ];
  } else {
    // Leaf category selected
    const path = [...currentLevel.path, category.slug];
    onCategorySelect?.(path, navigationStack.length);
    handleClose();
  }
}

// Go back one level
function goBack() {
  if (navigationStack.length > 1) {
    navigationStack = navigationStack.slice(0, -1);
  }
}

// Close and reset
function handleClose() {
  onClose?.();
  // Reset navigation after animation
  setTimeout(() => {
    navigationStack = [{ categories, title: 'Categories', path: [] }];
  }, 300);
}

// Handle backdrop click
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

// Handle keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (navigationStack.length > 1) {
      goBack();
    } else {
      handleClose();
    }
  }
}

// Reset navigation when categories change
$effect(() => {
  if (categories) {
    navigationStack = [{ categories, title: 'Categories', path: [] }];
  }
});
</script>

<!-- Backdrop & Sheet Container -->
{#if isOpen}
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Browse categories"
    tabindex="-1"
    class="fixed inset-0 z-90 {className}"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm
             animate-in fade-in duration-200"
      aria-hidden="true"
    ></div>

    <!-- Bottom Sheet -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="absolute bottom-0 left-0 right-0
             bg-white rounded-t-2xl shadow-2xl
             max-h-[85vh] flex flex-col
             animate-in slide-in-from-bottom duration-300 ease-out"
      role="document"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <!-- Drag Handle -->
      <div class="flex justify-center pt-3 pb-2">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          {#if navigationStack.length > 1}
            <button
              type="button"
              onclick={goBack}
              class="flex items-center justify-center w-9 h-9 -ml-2
                     text-gray-600 hover:bg-gray-100 rounded-full
                     transition-colors duration-150
                     focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label="Go back"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          {/if}

          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-gray-900 truncate">
              {currentLevel.title}
            </h2>
            {#if currentLevel.path.length > 0}
              <p class="text-sm text-gray-500 truncate">
                {currentLevel.path.join(' › ')}
              </p>
            {/if}
          </div>
        </div>

        <button
          type="button"
          onclick={handleClose}
          class="flex items-center justify-center w-9 h-9
                 text-gray-600 hover:bg-gray-100 rounded-full
                 transition-colors duration-150
                 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category List (Scrollable) -->
      <div class="flex-1 overflow-y-auto overscroll-contain">
        <ul class="divide-y divide-gray-100">
          {#each currentLevel.categories as category (category.id)}
            {@const hasChildren = category.children && category.children.length > 0}
            <li>
              <button
                type="button"
                onclick={() => navigateToSubcategories(category)}
                class="w-full flex items-center gap-3 px-4 py-4 min-h-14
                       text-left
                       hover:bg-gray-50 active:bg-gray-100
                       transition-colors duration-150
                       focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              >
                <!-- Icon/Emoji -->
                {#if category.icon}
                  <span class="text-2xl shrink-0" aria-hidden="true">
                    {category.icon}
                  </span>
                {/if}

                <!-- Category Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900">
                    {category.name}
                  </div>
                  {#if category.product_count !== undefined && category.product_count > 0}
                    <div class="text-sm text-gray-500">
                      {category.product_count.toLocaleString()} items
                    </div>
                  {/if}
                </div>

                <!-- Arrow indicator -->
                {#if hasChildren}
                  <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                {/if}
              </button>
            </li>
          {/each}
        </ul>

        {#if currentLevel.categories.length === 0}
          <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-500 font-medium">No categories available</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Slide-in animation */
  @keyframes slide-in-from-bottom {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .slide-in-from-bottom {
    animation-name: slide-in-from-bottom;
  }

  .fade-in {
    animation-name: fade-in;
  }

  .duration-200 {
    animation-duration: 200ms;
  }

  .duration-300 {
    animation-duration: 300ms;
  }

  .ease-out {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }

  /* Smooth scrolling */
  .overscroll-contain {
    overscroll-behavior: contain;
  }
</style>
