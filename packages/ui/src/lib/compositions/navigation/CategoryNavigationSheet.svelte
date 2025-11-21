<script lang="ts">
  import Dialog from '../../primitives/dialog/Dialog.svelte';
  import { fly } from 'svelte/transition';

  interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    level: number;
    sort_order: number;
    product_count?: number;
  }

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    subcategories: Category[];
    onCategoryClick: (category: Category) => void;
    onBack: () => void;
    showBackButton?: boolean;
    translations?: {
      back?: string;
      close?: string;
      all?: string;
    };
  }

  let {
    open,
    onOpenChange,
    category,
    subcategories,
    onCategoryClick,
    onBack,
    showBackButton = true,
    translations = {
      back: 'Back',
      close: 'Close',
      all: 'All'
    }
  }: Props = $props();

  // State for animations
  let animateIn = $state(false);
  $effect(() => {
    if (open) {
      setTimeout(() => {
        animateIn = true;
      }, 150);
    } else {
      animateIn = false;
    }
  });

  function handleCategoryClick(cat: Category) {
    onCategoryClick(cat);
  }

  function handleBackClick() {
    onBack();
  }

  function handleAllClick() {
    if (category) {
      // Navigate to category page showing all items
      window.location.href = `/category/${category.slug}`;
      onOpenChange(false);
    }
  }

  // Body lock while menu is open
  $effect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  });
</script>

<Dialog
  bind:open
  {onOpenChange}
  class="sm:hidden"
>
  {#snippet children()}
    <div
      class="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-navigation-title"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[var(--modal-overlay-bg)]"
        role="button"
        tabindex="0"
        onclick={() => onOpenChange(false)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenChange(false);
          }
        }}
        aria-label="Close category navigation"
      ></div>

      <!-- Sheet content from left -->
      <div
        class="relative flex w-80 max-w-[80vw] flex-col bg-[color:var(--surface-base)] shadow-xl"
        style="padding-top: env(safe-area-inset-top);"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-[color:var(--border-subtle)]">
          <div class="flex items-center gap-3">
            {#if showBackButton}
              <button
                onclick={handleBackClick}
                class="flex items-center justify-center w-10 h-10 rounded-lg text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] transition-colors"
                aria-label={translations.back}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            {/if}
            <h2 id="category-navigation-title" class="text-lg font-semibold text-[color:var(--text-primary)]">
              {category?.name || 'Categories'}
            </h2>
          </div>
          <button
            onclick={() => onOpenChange(false)}
            class="flex items-center justify-center w-10 h-10 rounded-lg text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] transition-colors"
            aria-label={translations.close}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="overflow-y-auto overscroll-contain flex-1">
          {#if animateIn}
            <div in:fly={{ y: 20, duration: 400, delay: 100 }}>
              <!-- "All [Category]" option -->
              {#if category}
                <div class="p-4">
                  <button
                    onclick={handleAllClick}
                    class="w-full flex items-center justify-between px-3 py-3 bg-[color:var(--brand-primary)] hover:bg-[color:var(--gray-800)] text-[color:var(--text-inverse)] rounded-lg transition-all duration-200 active:scale-[0.98] min-h-[44px]"
                    in:fly={{ y: 20, duration: 400, delay: 150 }}
                  >
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span class="text-sm font-medium">
                        {translations.all} {category.name}
                      </span>
                    </div>
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              {/if}

              <!-- Subcategories -->
              {#if subcategories.length > 0}
                <div class="px-4 mb-4">
                  <div class="space-y-2">
                    {#each subcategories as subcategory, i}
                      <div in:fly={{ y: 20, duration: 400, delay: 200 + i * 50 }}>
                        <button
                          onclick={() => handleCategoryClick(subcategory)}
                          class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors min-h-[36px] border border-gray-200 hover:border-gray-300"
                        >
                          <div class="flex items-center gap-3">
                            <span class="text-sm font-medium text-[color:var(--text-primary)]">
                              {subcategory.name}
                            </span>
                            {#if subcategory.product_count !== undefined && subcategory.product_count > 0}
                              <span class="text-xs bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)] px-2 py-0.5 rounded-full">
                                {subcategory.product_count}
                              </span>
                            {/if}
                          </div>
                          <svg
                            class="w-4 h-4 text-[color:var(--text-secondary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/snippet}
</Dialog>

<style>
  /* Hide bottom navigation when mobile menu is open */
  :global(body.mobile-menu-open .bottom-nav),
  :global(body.mobile-menu-open [data-bottom-nav]) {
    display: none !important;
  }
</style>