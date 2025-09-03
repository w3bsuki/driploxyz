<script lang="ts">
  import type { Snippet } from 'svelte';

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

  let currentLevel = $state(1);
  let dropdownRef = $state<HTMLDivElement>();
  let navigationPath = $state<CategoryPath>({ category: null, subcategory: null, specific: null });

  function handleCategorySelect(newPath: CategoryPath) {
    onCategorySelect(newPath);
    open = false;
  }

  function navigateToCategory(category: string) {
    navigationPath = { category, subcategory: null, specific: null };
    if (categoryHierarchy.subcategories[category]?.length > 0) {
      currentLevel = 2;
    } else {
      handleCategorySelect({ category, subcategory: null, specific: null });
    }
  }

  function navigateToSubcategory(subcategory: string) {
    navigationPath = { ...navigationPath, subcategory, specific: null };
    if (categoryHierarchy.specifics[`${navigationPath.category}-${subcategory}`]?.length > 0) {
      currentLevel = 3;
    } else {
      handleCategorySelect({ ...navigationPath, subcategory, specific: null });
    }
  }

  function navigateToLevel(level: number) {
    currentLevel = level;
  }

  function toggleDropdown() {
    open = !open;
    if (open) {
      currentLevel = 1;
      navigationPath = { category: null, subcategory: null, specific: null };
    }
    onOpenChange?.(open);
  }

  // Close dropdown when clicking outside
  function handleClickOutside(e: MouseEvent) {
    if (open && dropdownRef && !dropdownRef.contains(e.target as Node)) {
      open = false;
      onOpenChange?.(false);
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative {className}" bind:this={dropdownRef}>
  {#if trigger}
    <button 
      onclick={toggleDropdown}
      class="flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors min-h-11 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {@render trigger()}
    </button>
  {/if}

  {#if open}
    <div class="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-hidden">
      <!-- Level 1: Main Categories -->
      {#if currentLevel === 1}
        <div class="p-2">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
            {allCategoriesLabel}
          </div>
          <div class="space-y-0.5 overflow-y-auto max-h-64">
            <button
              onclick={() => handleCategorySelect({ category: null, subcategory: null, specific: null })}
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors {!selectedPath.category ? 'bg-gray-100' : ''}"
            >
              <span class="text-base">🌍</span>
              <span class="text-sm font-medium text-gray-900">{allLabel}</span>
            </button>
            
            {#each categoryHierarchy.categories as category}
              <button
                onclick={() => navigateToCategory(category.key)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors group {selectedPath.category === category.key ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base">{category.icon}</span>
                  <span class="text-sm font-medium text-gray-900 {selectedPath.category === category.key ? 'text-blue-700' : ''}">{category.name}</span>
                </div>
                
                {#if categoryHierarchy.subcategories[category.key]?.length > 0}
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Level 2: Subcategories -->
      {#if currentLevel === 2 && navigationPath.category && categoryHierarchy.subcategories[navigationPath.category]}
        <div class="p-2">
          <button
            onclick={() => navigateToLevel(1)}
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </button>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
            {categoryHierarchy.categories.find(cat => cat.key === navigationPath.category)?.name}
          </div>
          <div class="space-y-0.5 overflow-y-auto max-h-56">
            <button
              onclick={() => handleCategorySelect({ ...navigationPath, subcategory: null, specific: null })}
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors {selectedPath.category === navigationPath.category && !selectedPath.subcategory ? 'bg-gray-100' : ''}"
            >
              <span class="text-base">📦</span>
              <span class="text-sm font-medium text-gray-900">{allLabel} {categoryHierarchy.categories.find(cat => cat.key === navigationPath.category)?.name}</span>
            </button>
            
            {#each categoryHierarchy.subcategories[navigationPath.category] as subcategory}
              <button
                onclick={() => navigateToSubcategory(subcategory.key)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors group {selectedPath.subcategory === subcategory.key ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base">{subcategory.icon}</span>
                  <span class="text-sm font-medium text-gray-900 {selectedPath.subcategory === subcategory.key ? 'text-blue-700' : ''}">{subcategory.name}</span>
                </div>
                
                {#if categoryHierarchy.specifics[`${selectedPath.category}-${subcategory.key}`]?.length > 0}
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Level 3: Specific Categories -->
      {#if currentLevel === 3 && navigationPath.category && navigationPath.subcategory && categoryHierarchy.specifics[`${navigationPath.category}-${navigationPath.subcategory}`]}
        <div class="p-2">
          <button
            onclick={() => navigateToLevel(2)}
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </button>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100 mb-1">
            {categoryHierarchy.subcategories[navigationPath.category]?.find(s => s.key === navigationPath.subcategory)?.name}
          </div>
          <div class="space-y-0.5 overflow-y-auto max-h-56">
            <button
              onclick={() => handleCategorySelect({ ...navigationPath, specific: null })}
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors {selectedPath.category === navigationPath.category && selectedPath.subcategory === navigationPath.subcategory && !selectedPath.specific ? 'bg-gray-100' : ''}"
            >
              <span class="text-base">📄</span>
              <span class="text-sm font-medium text-gray-900">{allLabel} {categoryHierarchy.subcategories[navigationPath.category]?.find(s => s.key === navigationPath.subcategory)?.name}</span>
            </button>
            
            {#each categoryHierarchy.specifics[`${navigationPath.category}-${navigationPath.subcategory}`] as specific}
              <button
                onclick={() => {
                  const newPath = { ...navigationPath, specific: specific.key };
                  handleCategorySelect(newPath);
                }}
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors {selectedPath.specific === specific.key ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <span class="text-base">{specific.icon}</span>
                <span class="text-sm font-medium text-gray-900 {selectedPath.specific === specific.key ? 'text-blue-700' : ''}">{specific.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>