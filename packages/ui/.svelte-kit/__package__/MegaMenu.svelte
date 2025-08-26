<script lang="ts">
  import type { CategoryData } from '../types';

  interface Props {
    isOpen?: boolean;
    categories: CategoryData;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
    onCategorySelect?: (category: string | null) => void;
    onSubcategorySelect?: (subcategory: string | null, category: string) => void;
    onClose?: () => void;
    class?: string;
    translations?: {
      onSale?: string;
      newItems?: string;
      trending?: string;
    };
  }

  let {
    isOpen = false,
    categories,
    selectedCategory = null,
    selectedSubcategory = null,
    onCategorySelect,
    onSubcategorySelect,
    onClose,
    class: className = '',
    translations = {
      onSale: 'On Sale',
      newItems: 'New Items',
      trending: 'Trending'
    }
  }: Props = $props();

  const mainCategories = [
    { key: 'women', icon: '👗' },
    { key: 'men', icon: '👔' },
    { key: 'kids', icon: '👶' },
    { key: 'shoes', icon: '👟' },
    { key: 'bags', icon: '👜' },
    { key: 'accessories', icon: '💍' }
  ];

  function selectCategory(categoryKey: string) {
    if (selectedCategory === categoryKey) {
      // If clicking the same category, deselect it
      onCategorySelect?.(null);
      // DON'T call onSubcategorySelect here - it might trigger close
    } else {
      // Select new category
      onCategorySelect?.(categoryKey);
      // DON'T call onSubcategorySelect here - it might trigger close
    }
    // DON'T close the dropdown when selecting category
  }

  function selectSubcategory(subcategory: string, categoryKey: string) {
    onSubcategorySelect?.(subcategory, categoryKey);
    // Only close when selecting a subcategory
    onClose?.();
  }

  function clearAll() {
    onCategorySelect?.(null);
    onSubcategorySelect?.(null, '');
    onClose?.();
  }
</script>

{#if isOpen}
  <!-- Backdrop BEHIND the dropdown -->
  <button 
    class="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
    onclick={onClose}
    aria-label="Close menu"
    tabindex={-1}
  ></button>
  
  <!-- Dropdown menu ABOVE the backdrop -->
  <div class="absolute top-full left-0 right-0 mt-2 z-50">
    <div 
      class="bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[calc(100vh-200px)] sm:max-h-[70vh] overflow-y-auto {className}">
      <div class="p-4">
        <!-- Header with clear button -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-900">Shop by Category</h3>
          <div class="flex gap-2">
            {#if selectedCategory}
              <button
                onclick={clearAll}
                class="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            {/if}
            <button
              onclick={onClose}
              class="p-1 hover:bg-gray-100 rounded-lg"
              aria-label="Close menu"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Main categories -->
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {#each mainCategories as cat}
            {@const category = categories[cat.key]}
            {#if category}
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  selectCategory(cat.key);
                }}
                class="flex flex-col items-center p-3 rounded-lg transition-all {
                  selectedCategory === cat.key 
                    ? 'bg-black text-white' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }"
              >
                <span class="text-2xl mb-1">{cat.icon}</span>
                <span class="text-xs font-medium">{category.name}</span>
              </button>
            {/if}
          {/each}
        </div>

        <!-- Subcategories for selected category -->
        {#if selectedCategory && categories[selectedCategory]?.subcategories}
          <div class="border-t pt-3">
            <p class="text-xs text-gray-500 font-medium mb-2 uppercase">
              {categories[selectedCategory].name} Categories
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onclick={() => selectSubcategory(null, selectedCategory)}
                class="px-3 py-2 text-sm rounded-lg {
                  !selectedSubcategory 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }"
              >
                All {categories[selectedCategory].name}
              </button>
              {#each categories[selectedCategory].subcategories as subcat}
                <button
                  onclick={() => selectSubcategory(subcat.name, selectedCategory)}
                  class="px-3 py-2 text-sm rounded-lg truncate {
                    selectedSubcategory === subcat.name
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }"
                >
                  {subcat.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Quick actions -->
        <div class="flex gap-2 mt-4 pt-3 border-t">
          <button 
            onclick={() => { 
              onCategorySelect?.('sale'); 
              onSubcategorySelect?.(null, 'sale');
              onClose?.(); 
            }}
            class="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
          >
            🔥 {translations.onSale}
          </button>
          <button 
            onclick={() => { 
              onCategorySelect?.('new'); 
              onSubcategorySelect?.(null, 'new');
              onClose?.(); 
            }}
            class="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
          >
            ✨ {translations.newItems}
          </button>
          <button 
            onclick={() => { 
              onCategorySelect?.('trending'); 
              onSubcategorySelect?.(null, 'trending');
              onClose?.(); 
            }}
            class="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
          >
            📈 {translations.trending}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}