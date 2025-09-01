<script lang="ts">
  import { createDialog } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';
  import { writable } from 'svelte/store';
  import { spring } from 'svelte/motion';
  import { browser } from '$app/environment';

  interface CategoryHierarchy {
    categories: Array<{key: string, name: string, icon: string, id: string}>;
    subcategories: Record<string, Array<{key: string, name: string, icon: string, id: string}>>;
    specifics: Record<string, Array<{key: string, name: string, icon: string, id: string}>>;
  }

  interface CategoryPath {
    category: string | null;
    subcategory: string | null;
    specific: string | null;
  }

  interface Props {
    open?: boolean;
    categoryHierarchy: CategoryHierarchy;
    selectedPath?: CategoryPath;
    onCategorySelect: (path: CategoryPath) => void;
    onOpenChange?: (open: boolean) => void;
    trigger?: Snippet;
    // i18n props
    allCategoriesLabel?: string;
    backLabel?: string;
    allLabel?: string;
    class?: string;
  }

  let {
    open = $bindable(false),
    categoryHierarchy,
    selectedPath = { category: null, subcategory: null, specific: null },
    onCategorySelect,
    onOpenChange,
    trigger,
    allCategoriesLabel = 'Categories',
    backLabel = 'Back',
    allLabel = 'All',
    class: className = ''
  }: Props = $props();

  // Internal state
  let currentLevel = $state(1); // 1=gender, 2=type, 3=specific
  let breadcrumbs = $state<Array<{label: string, level: number}>>([]);
  let sheetContent: HTMLDivElement;
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  // Spring animation for sheet position
  const sheetY = spring(100, {
    stiffness: 0.3,
    damping: 0.8
  });

  // Melt UI Dialog setup
  const openStore = writable(open);

  const {
    elements: { trigger: triggerElement, overlay, content },
    states: { open: dialogOpen }
  } = createDialog({
    open: openStore,
    onOpenChange: onOpenChange ? (details) => {
      onOpenChange(details.next);
      return details.next;
    } : undefined,
    forceVisible: false,
    portal: 'body',
    preventScroll: true
  });

  // Sync bindable prop with store and spring
  $effect(() => {
    openStore.set(open);
    if (open) {
      sheetY.set(0);
      // Reset to level 1 when opening
      currentLevel = 1;
      updateBreadcrumbs();
    } else {
      sheetY.set(100);
    }
  });

  // Update bindable open state when dialog state changes
  $effect(() => {
    open = $dialogOpen;
  });

  // Update breadcrumbs based on current level and selection
  function updateBreadcrumbs() {
    breadcrumbs = [];
    
    if (currentLevel >= 1) {
      breadcrumbs.push({ label: allCategoriesLabel, level: 1 });
    }
    
    if (currentLevel >= 2 && selectedPath.category) {
      const category = categoryHierarchy.categories.find(c => c.key === selectedPath.category);
      if (category) {
        breadcrumbs.push({ label: category.name, level: 2 });
      }
    }
    
    if (currentLevel >= 3 && selectedPath.category && selectedPath.subcategory) {
      const subcategory = categoryHierarchy.subcategories[selectedPath.category]?.find(s => s.key === selectedPath.subcategory);
      if (subcategory) {
        breadcrumbs.push({ label: subcategory.name, level: 3 });
      }
    }
  }

  function handleCategorySelect(newPath: CategoryPath) {
    onCategorySelect(newPath);
    
    // Navigate to appropriate level
    if (newPath.specific) {
      // All levels selected, close sheet
      open = false;
    } else if (newPath.subcategory && categoryHierarchy.specifics[`${newPath.category}-${newPath.subcategory}`]?.length > 0) {
      // Has subcategory with specifics, go to level 3
      currentLevel = 3;
      updateBreadcrumbs();
    } else if (newPath.category && categoryHierarchy.subcategories[newPath.category]?.length > 0) {
      // Has category with subcategories, go to level 2
      currentLevel = 2;
      updateBreadcrumbs();
    } else {
      // No further levels, close sheet
      open = false;
    }
  }

  function navigateToLevel(level: number) {
    currentLevel = level;
    updateBreadcrumbs();
  }

  // Touch gesture handling for swipe-to-close
  function handleTouchStart(e: TouchEvent) {
    if (!browser) return;
    startY = e.touches[0].clientY;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!browser || !isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      const progress = Math.min(deltaY / 200, 1); // 200px to fully close
      sheetY.set(progress * 100);
    }
  }

  function handleTouchEnd() {
    if (!browser || !isDragging) return;
    isDragging = false;
    
    const deltaY = currentY - startY;
    
    // Close if swiped down enough (>80px) or with sufficient velocity
    if (deltaY > 80) {
      open = false;
    } else {
      // Snap back to open position
      sheetY.set(0);
    }
    
    startY = 0;
    currentY = 0;
  }
</script>

<!-- Trigger Button -->
{#if trigger}
  <button 
    use:triggerElement
    class="flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--surface-muted)] rounded-[var(--radius-lg)] transition-colors min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 {className}"
  >
    {@render trigger()}
  </button>
{/if}

<!-- Bottom Sheet Dialog -->
{#if $dialogOpen}
  <!-- Backdrop -->
  <div 
    use:overlay 
    class="fixed inset-0 z-50 bg-[color:var(--modal-overlay)] backdrop-blur-sm opacity-50"
    style="z-index: 9998;"
  ></div>

  <!-- Bottom Sheet Content -->
  <div 
    use:content
    bind:this={sheetContent}
    class="fixed inset-x-0 bottom-0 z-50 bg-[color:var(--surface-base)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-2xl)] border-t border-[color:var(--border-subtle)] max-h-[85vh] flex flex-col overflow-hidden sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:bottom-4 sm:w-full sm:max-w-md sm:rounded-[var(--radius-xl)] sm:border"
    style="z-index: 9999; transform: translateY({$sheetY}%); transition: transform 0.2s ease-out;"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <!-- Drag Handle -->
    <div class="flex justify-center pt-3 pb-2 sm:hidden">
      <div class="w-10 h-1 bg-[color:var(--border-primary)] rounded-full"></div>
    </div>

    <!-- Header with Breadcrumbs -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-base)]">
      <!-- Back Button (only show on level 2+) -->
      {#if currentLevel > 1}
        <button
          onclick={() => navigateToLevel(currentLevel - 1)}
          class="flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] p-1 -ml-1 rounded-[var(--radius-md)] hover:bg-[color:var(--surface-muted)] transition-colors min-h-[var(--touch-compact)]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>
      {:else}
        <div></div>
      {/if}

      <!-- Current Level Title -->
      <h2 class="text-lg font-semibold text-[color:var(--text-primary)]">
        {breadcrumbs[breadcrumbs.length - 1]?.label || allCategoriesLabel}
      </h2>

      <!-- Close Button -->
      <button
        onclick={() => open = false}
        class="p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-muted)] rounded-[var(--radius-md)] transition-colors"
        aria-label="Close"
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <!-- Level 1: Main Categories -->
      {#if currentLevel === 1}
        <div class="px-4 py-2">
          <!-- All Categories Option -->
          <button
            onclick={() => handleCategorySelect({ category: null, subcategory: null, specific: null })}
            class="w-full flex items-center gap-4 px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] {!selectedPath.category ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
          >
            <span class="text-2xl">🌍</span>
            <span class="text-base font-medium">{allLabel}</span>
          </button>
          
          <!-- Category Options -->
          {#each categoryHierarchy.categories as category}
            <button
              onclick={() => {
                const newPath = { category: category.key, subcategory: null, specific: null };
                handleCategorySelect(newPath);
              }}
              class="w-full flex items-center justify-between px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] group {selectedPath.category === category.key ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">{category.icon}</span>
                <span class="text-base font-medium">{category.name}</span>
              </div>
              
              {#if categoryHierarchy.subcategories[category.key]?.length > 0}
                <svg class="w-5 h-5 text-[color:var(--text-muted)] group-hover:text-[color:var(--text-secondary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Level 2: Subcategories -->
      {#if currentLevel === 2 && selectedPath.category && categoryHierarchy.subcategories[selectedPath.category]}
        <div class="px-4 py-2">
          <!-- All Subcategories Option -->
          <button
            onclick={() => handleCategorySelect({ ...selectedPath, subcategory: null, specific: null })}
            class="w-full flex items-center gap-4 px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] {!selectedPath.subcategory ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
          >
            <span class="text-2xl">📦</span>
            <span class="text-base font-medium">{allLabel} {categoryHierarchy.categories.find(c => c.key === selectedPath.category)?.name}</span>
          </button>
          
          <!-- Subcategory Options -->
          {#each categoryHierarchy.subcategories[selectedPath.category] as subcategory}
            <button
              onclick={() => {
                const newPath = { ...selectedPath, subcategory: subcategory.key, specific: null };
                handleCategorySelect(newPath);
              }}
              class="w-full flex items-center justify-between px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] group {selectedPath.subcategory === subcategory.key ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">{subcategory.icon}</span>
                <span class="text-base font-medium">{subcategory.name}</span>
              </div>
              
              {#if categoryHierarchy.specifics[`${selectedPath.category}-${subcategory.key}`]?.length > 0}
                <svg class="w-5 h-5 text-[color:var(--text-muted)] group-hover:text-[color:var(--text-secondary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Level 3: Specific Categories -->
      {#if currentLevel === 3 && selectedPath.category && selectedPath.subcategory && categoryHierarchy.specifics[`${selectedPath.category}-${selectedPath.subcategory}`]}
        <div class="px-4 py-2">
          <!-- All Specific Categories Option -->
          <button
            onclick={() => handleCategorySelect({ ...selectedPath, specific: null })}
            class="w-full flex items-center gap-4 px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] {!selectedPath.specific ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
          >
            <span class="text-2xl">📄</span>
            <span class="text-base font-medium">{allLabel} {categoryHierarchy.subcategories[selectedPath.category]?.find(s => s.key === selectedPath.subcategory)?.name}</span>
          </button>
          
          <!-- Specific Category Options -->
          {#each categoryHierarchy.specifics[`${selectedPath.category}-${selectedPath.subcategory}`] as specific}
            <button
              onclick={() => {
                const newPath = { ...selectedPath, specific: specific.key };
                handleCategorySelect(newPath);
              }}
              class="w-full flex items-center gap-4 px-4 py-4 rounded-[var(--radius-lg)] hover:bg-[color:var(--surface-muted)] text-left transition-colors min-h-[var(--touch-primary)] {selectedPath.specific === specific.key ? 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]' : ''}"
            >
              <span class="text-2xl">{specific.icon}</span>
              <span class="text-base font-medium">{specific.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Safe Area Bottom Padding -->
    <div class="h-[env(safe-area-inset-bottom)] bg-[color:var(--surface-base)]"></div>
  </div>
{/if}

<style>
  /* Enhanced animations for mobile */
  @media (max-width: 640px) {
    [data-dialog-content] {
      animation: slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1);
    }
  }
  
  @media (min-width: 641px) {
    [data-dialog-content] {
      animation: fade-scale-in 250ms cubic-bezier(0.16, 1, 0.3, 1);
    }
  }
  
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fade-scale-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  /* Smooth scrolling for category lists */
  .overflow-y-auto {
    scroll-behavior: smooth;
  }
  
  /* Enhanced touch targets */
  button {
    -webkit-tap-highlight-color: transparent;
  }
</style>