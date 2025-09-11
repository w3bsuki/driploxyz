<script lang="ts">
  interface CategoryL1 {
    key: string;
    label: string;
    emoji: string;
    subcategories?: CategoryL2[];
  }

  interface CategoryL2 {
    key: string;
    label: string;
    items?: CategoryL3[];
  }

  interface CategoryL3 {
    key: string;
    label: string;
  }

  interface Props {
    onCategoryClick: (category: string, level: number, path: string[]) => void;
    onClose: () => void;
    translations?: {
      women?: string;
      men?: string;
      kids?: string;
      unisex?: string;
      clothing?: string;
      shoes?: string;
      accessories?: string;
      bags?: string;
      back?: string;
    };
  }

  let { 
    onCategoryClick,
    onClose,
    translations = {
      women: 'Women',
      men: 'Men',
      kids: 'Kids',
      unisex: 'Unisex',
      clothing: 'Clothing',
      shoes: 'Shoes',
      accessories: 'Accessories',
      bags: 'Bags',
      back: 'Back'
    }
  }: Props = $props();

  // Navigation state
  let currentLevel = $state<number>(1);
  let currentPath = $state<string[]>([]);
  let selectedL1 = $state<CategoryL1 | null>(null);
  let selectedL2 = $state<CategoryL2 | null>(null);

  // Mock category data - in real app this would come from props or API
  const categories = $derived<CategoryL1[]>([
    {
      key: 'women',
      label: translations.women || 'Women',
      emoji: '👗',
      subcategories: [
        {
          key: 'clothing',
          label: translations.clothing || 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'dresses', label: 'Dresses' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'tops', label: 'Tops' },
            { key: 'sweaters', label: 'Sweaters' }
          ]
        },
        {
          key: 'shoes',
          label: translations.shoes || 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'heels', label: 'Heels' },
            { key: 'boots', label: 'Boots' },
            { key: 'sandals', label: 'Sandals' }
          ]
        },
        {
          key: 'accessories',
          label: translations.accessories || 'Accessories',
          items: [
            { key: 'jewelry', label: 'Jewelry' },
            { key: 'watches', label: 'Watches' },
            { key: 'scarves', label: 'Scarves' },
            { key: 'belts', label: 'Belts' }
          ]
        },
        {
          key: 'bags',
          label: translations.bags || 'Bags',
          items: [
            { key: 'handbags', label: 'Handbags' },
            { key: 'backpacks', label: 'Backpacks' },
            { key: 'clutches', label: 'Clutches' }
          ]
        }
      ]
    },
    {
      key: 'men',
      label: translations.men || 'Men',
      emoji: '👔',
      subcategories: [
        {
          key: 'clothing',
          label: translations.clothing || 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'shirts', label: 'Shirts' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'jackets', label: 'Jackets' },
            { key: 'sweaters', label: 'Sweaters' }
          ]
        },
        {
          key: 'shoes',
          label: translations.shoes || 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'dress-shoes', label: 'Dress Shoes' },
            { key: 'boots', label: 'Boots' },
            { key: 'sandals', label: 'Sandals' }
          ]
        },
        {
          key: 'accessories',
          label: translations.accessories || 'Accessories',
          items: [
            { key: 'watches', label: 'Watches' },
            { key: 'belts', label: 'Belts' },
            { key: 'wallets', label: 'Wallets' },
            { key: 'ties', label: 'Ties' }
          ]
        }
      ]
    },
    {
      key: 'kids',
      label: translations.kids || 'Kids',
      emoji: '👶',
      subcategories: [
        {
          key: 'clothing',
          label: translations.clothing || 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'dresses', label: 'Dresses' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'pajamas', label: 'Pajamas' }
          ]
        },
        {
          key: 'shoes',
          label: translations.shoes || 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'sandals', label: 'Sandals' },
            { key: 'boots', label: 'Boots' }
          ]
        },
        {
          key: 'accessories',
          label: translations.accessories || 'Accessories',
          items: [
            { key: 'backpacks', label: 'Backpacks' },
            { key: 'hats', label: 'Hats' },
            { key: 'toys', label: 'Toys' }
          ]
        }
      ]
    },
    {
      key: 'unisex',
      label: translations.unisex || 'Unisex',
      emoji: '👕',
      subcategories: [
        {
          key: 'clothing',
          label: translations.clothing || 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'hoodies', label: 'Hoodies' },
            { key: 'sweatshirts', label: 'Sweatshirts' }
          ]
        },
        {
          key: 'accessories',
          label: translations.accessories || 'Accessories',
          items: [
            { key: 'sunglasses', label: 'Sunglasses' },
            { key: 'hats', label: 'Hats' },
            { key: 'watches', label: 'Watches' }
          ]
        }
      ]
    }
  ]);

  // Navigation functions
  function selectL1Category(category: CategoryL1) {
    selectedL1 = category;
    selectedL2 = null;
    currentLevel = 2;
    currentPath = [category.key];
  }

  function selectL2Category(category: CategoryL2) {
    selectedL2 = category;
    currentLevel = 3;
    currentPath = [...currentPath, category.key];
  }

  function selectL3Item(item: CategoryL3) {
    const fullPath = [...currentPath, item.key];
    onCategoryClick(item.key, 3, fullPath);
    onClose();
  }

  function goBack() {
    if (currentLevel === 3) {
      selectedL2 = null;
      currentLevel = 2;
      currentPath = currentPath.slice(0, -1);
    } else if (currentLevel === 2) {
      selectedL1 = null;
      selectedL2 = null;
      currentLevel = 1;
      currentPath = [];
    }
  }

  function handleL1Click(category: CategoryL1) {
    // If no subcategories, navigate directly
    if (!category.subcategories || category.subcategories.length === 0) {
      onCategoryClick(category.key, 1, [category.key]);
      onClose();
    } else {
      selectL1Category(category);
    }
  }

  function handleL2Click(category: CategoryL2) {
    // If no items, navigate to L2 category
    if (!category.items || category.items.length === 0) {
      const fullPath = [...currentPath, category.key];
      onCategoryClick(category.key, 2, fullPath);
      onClose();
    } else {
      selectL2Category(category);
    }
  }
</script>

<div class="mega-menu-categories h-full flex flex-col">
  <!-- Header with breadcrumb and back button -->
  {#if currentLevel > 1}
    <div class="flex items-center px-4 py-3 border-b border-gray-200">
      <button
        onclick={goBack}
        class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Go back"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm font-medium">{translations.back}</span>
      </button>
    </div>
  {/if}

  <!-- Navigation Content -->
  <div class="flex-1 overflow-y-auto">
    {#if currentLevel === 1}
      <!-- Level 1: Main Categories (Women, Men, Kids, Unisex) -->
      <div class="p-4">
        <div class="grid grid-cols-2 gap-3">
          {#each categories as category}
            <button
              onclick={() => handleL1Click(category)}
              class="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-4 transition-colors min-h-20 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span class="text-2xl mb-1">{category.emoji}</span>
              <span class="text-sm font-semibold text-gray-900">{category.label}</span>
            </button>
          {/each}
        </div>
      </div>
    {:else if currentLevel === 2 && selectedL1}
      <!-- Level 2: Subcategories (Clothing, Shoes, Accessories, Bags) -->
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{selectedL1.label}</h2>
        <div class="space-y-2">
          {#each selectedL1.subcategories || [] as subcategory}
            <button
              onclick={() => handleL2Click(subcategory)}
              class="w-full flex items-center justify-between px-4 py-4 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span class="font-medium text-base">{subcategory.label}</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          {/each}
        </div>
      </div>
    {:else if currentLevel === 3 && selectedL2}
      <!-- Level 3: Specific Items (T-Shirts, Dresses, Sneakers, etc.) -->
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{selectedL2.label}</h2>
        <div class="grid grid-cols-2 gap-2">
          {#each selectedL2.items || [] as item}
            <button
              onclick={() => selectL3Item(item)}
              class="px-4 py-3 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span class="text-sm font-medium">{item.label}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .mega-menu-categories {
    /* Ensure proper scroll behavior on mobile */
    -webkit-overflow-scrolling: touch;
  }
</style>