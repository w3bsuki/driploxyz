<script lang="ts">
/**
 * CategorySideDrawer - Dropdown menu that slides down from top
 * 
 * Features:
 * - Slides down from top with smooth Svelte transitions
 * - L1→L2→L3 drill-down navigation
 * - Breadcrumb header with back button
 * - Touch-friendly list items (min 56px)
 */

import { fly, fade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

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
  { categories, title: 'Browse Categories', path: [] }
]);

let currentLevel = $derived(navigationStack[navigationStack.length - 1] || { categories: [], title: 'Browse Categories', path: [] });

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
    navigationStack = [{ categories, title: 'Browse Categories', path: [] }];
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
    navigationStack = [{ categories, title: 'Browse Categories', path: [] }];
  }
});
</script>

<!-- Side Menu Drawer (slides from left) -->
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
      transition:fade={{ duration: 200 }}
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      aria-hidden="true"
    ></div>

    <!-- Side Menu Panel (slides from left) -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      in:fly={{ x: -320, duration: 300, easing: cubicOut }}
      out:fly={{ x: -320, duration: 250, easing: cubicOut }}
      class="absolute top-0 bottom-0 left-0 w-[320px] max-w-[85vw]
             bg-white shadow-2xl
             flex flex-col overflow-hidden"
      role="document"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-200 bg-linear-to-b from-white to-gray-50">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-gray-900 truncate">
            {currentLevel.title}
          </h2>
          {#if currentLevel.path.length > 0}
            <p class="text-xs text-gray-600 truncate mt-0.5">
              {currentLevel.path.join(' › ')}
            </p>
          {/if}
        </div>

        <button
          type="button"
          onclick={handleClose}
          class="flex items-center justify-center w-10 h-10
                 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full
                 transition-all duration-150
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
        <!-- Back Button (if nested) -->
        {#if navigationStack.length > 1}
          <button
            type="button"
            onclick={goBack}
            class="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100
                   text-left bg-gray-50 hover:bg-gray-100
                   transition-colors duration-150
                   focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-inset focus:ring-brand-primary"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="text-sm font-semibold text-gray-700">Back to {navigationStack[navigationStack.length - 2]?.title || 'Categories'}</span>
          </button>
        {/if}

        <ul class="py-2">
          {#each currentLevel.categories as category (category.id)}
            {@const hasChildren = category.children && category.children.length > 0}
            <li>
              <button
                type="button"
                onclick={() => navigateToSubcategories(category)}
                class="w-full flex items-center gap-3 px-4 py-4 min-h-[60px]
                       text-left border-b border-gray-50
                       hover:bg-brand-primary/5
                       active:bg-brand-primary/10
                       transition-all duration-150
                       focus:outline-none focus:bg-brand-primary/5 focus:ring-2 focus:ring-inset focus:ring-brand-primary
                       group"
              >
                <!-- Icon/Emoji -->
                {#if category.icon}
                  <span class="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                    {category.icon}
                  </span>
                {/if}

                <!-- Category Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-base text-gray-900 group-hover:text-brand-primary transition-colors">
                    {category.name}
                  </div>
                  {#if category.product_count !== undefined && category.product_count > 0}
                    <div class="text-xs text-gray-500 mt-0.5">
                      {category.product_count.toLocaleString()} items
                    </div>
                  {/if}
                </div>

                <!-- Arrow indicator -->
                {#if hasChildren}
                  <svg class="w-5 h-5 text-gray-400 shrink-0 group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                {/if}
              </button>
            </li>
          {/each}
        </ul>

        {#if currentLevel.categories.length === 0}
          <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div class="w-16 h-16 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-gray-700 font-semibold text-sm">No categories available</p>
            <p class="text-xs text-gray-500 mt-1">Check back soon for updates</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
