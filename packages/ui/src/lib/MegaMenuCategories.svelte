<script lang="ts">
  import type { Database } from '@repo/database';

  type Category = Database['public']['Tables']['categories']['Row'];

  interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[];
    product_count?: number;
  }

  interface Props {
    onCategoryClick: (category: string, level: number, path: string[]) => void;
    onClose: () => void;
    categories?: CategoryWithChildren[]; // Real data passed from parent
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
      items?: string;
    };
  }

  let {
    onCategoryClick,
    onClose,
    categories = [],
    translations = {
      women: 'Women',
      men: 'Men',
      kids: 'Kids',
      unisex: 'Unisex',
      clothing: 'Clothing',
      shoes: 'Shoes',
      accessories: 'Accessories',
      bags: 'Bags',
      back: 'Back',
      items: 'items'
    }
  }: Props = $props();

  // Navigation state using Svelte 5 runes
  let currentLevel = $state<number>(1);
  let currentPath = $state<string[]>([]);
  let selectedL1 = $state<CategoryWithChildren | null>(null);
  let selectedL2 = $state<CategoryWithChildren | null>(null);

  // Enhanced category data with fallback mock data
  const enhancedCategories = $derived<CategoryWithChildren[]>(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        ...cat,
        children: cat.children || [],
        product_count: cat.product_count || 0
      }));
    }

    // Fallback mock data with improved structure
    return [
      {
        id: 'women',
        name: translations.women || 'Women',
        slug: 'women',
        level: 1,
        parent_id: null,
        sort_order: 1,
        is_active: true,
        description: 'Women\'s fashion and accessories',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 1250,
        children: [
          {
            id: 'women-clothing',
            name: translations.clothing || 'Clothing',
            slug: 'women-clothing',
            level: 2,
            parent_id: 'women',
            sort_order: 1,
            is_active: true,
            description: 'Women\'s clothing',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 680,
            children: [
              { id: 'women-clothing-dresses', name: 'Dresses', slug: 'women-clothing-dresses', level: 3, parent_id: 'women-clothing', sort_order: 1, is_active: true, description: 'Dresses', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 145 },
              { id: 'women-clothing-tops', name: 'Tops & T-Shirts', slug: 'women-clothing-tops', level: 3, parent_id: 'women-clothing', sort_order: 2, is_active: true, description: 'Tops', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 198 },
              { id: 'women-clothing-jeans', name: 'Jeans', slug: 'women-clothing-jeans', level: 3, parent_id: 'women-clothing', sort_order: 3, is_active: true, description: 'Jeans', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 87 },
              { id: 'women-clothing-sweaters', name: 'Sweaters & Hoodies', slug: 'women-clothing-sweaters', level: 3, parent_id: 'women-clothing', sort_order: 4, is_active: true, description: 'Sweaters', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 125 }
            ]
          },
          {
            id: 'women-shoes',
            name: translations.shoes || 'Shoes',
            slug: 'women-shoes',
            level: 2,
            parent_id: 'women',
            sort_order: 2,
            is_active: true,
            description: 'Women\'s shoes',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 320,
            children: [
              { id: 'women-shoes-sneakers', name: 'Sneakers', slug: 'women-shoes-sneakers', level: 3, parent_id: 'women-shoes', sort_order: 1, is_active: true, description: 'Sneakers', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 98 },
              { id: 'women-shoes-heels', name: 'Heels', slug: 'women-shoes-heels', level: 3, parent_id: 'women-shoes', sort_order: 2, is_active: true, description: 'Heels', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 76 },
              { id: 'women-shoes-boots', name: 'Boots', slug: 'women-shoes-boots', level: 3, parent_id: 'women-shoes', sort_order: 3, is_active: true, description: 'Boots', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 54 },
              { id: 'women-shoes-sandals', name: 'Sandals', slug: 'women-shoes-sandals', level: 3, parent_id: 'women-shoes', sort_order: 4, is_active: true, description: 'Sandals', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 42 }
            ]
          },
          {
            id: 'women-accessories',
            name: translations.accessories || 'Accessories',
            slug: 'women-accessories',
            level: 2,
            parent_id: 'women',
            sort_order: 3,
            is_active: true,
            description: 'Women\'s accessories',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 180,
            children: [
              { id: 'women-accessories-jewelry', name: 'Jewelry', slug: 'women-accessories-jewelry', level: 3, parent_id: 'women-accessories', sort_order: 1, is_active: true, description: 'Jewelry', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 67 },
              { id: 'women-accessories-watches', name: 'Watches', slug: 'women-accessories-watches', level: 3, parent_id: 'women-accessories', sort_order: 2, is_active: true, description: 'Watches', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 34 },
              { id: 'women-accessories-scarves', name: 'Scarves & Wraps', slug: 'women-accessories-scarves', level: 3, parent_id: 'women-accessories', sort_order: 3, is_active: true, description: 'Scarves', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 28 }
            ]
          },
          {
            id: 'women-bags',
            name: translations.bags || 'Bags',
            slug: 'women-bags',
            level: 2,
            parent_id: 'women',
            sort_order: 4,
            is_active: true,
            description: 'Women\'s bags',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 70,
            children: [
              { id: 'women-bags-handbags', name: 'Handbags', slug: 'women-bags-handbags', level: 3, parent_id: 'women-bags', sort_order: 1, is_active: true, description: 'Handbags', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 32 },
              { id: 'women-bags-backpacks', name: 'Backpacks', slug: 'women-bags-backpacks', level: 3, parent_id: 'women-bags', sort_order: 2, is_active: true, description: 'Backpacks', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 23 },
              { id: 'women-bags-clutches', name: 'Clutches', slug: 'women-bags-clutches', level: 3, parent_id: 'women-bags', sort_order: 3, is_active: true, description: 'Clutches', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 15 }
            ]
          }
        ]
      },
      {
        id: 'men',
        name: translations.men || 'Men',
        slug: 'men',
        level: 1,
        parent_id: null,
        sort_order: 2,
        is_active: true,
        description: 'Men\'s fashion and accessories',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 980,
        children: [
          {
            id: 'men-clothing',
            name: translations.clothing || 'Clothing',
            slug: 'men-clothing',
            level: 2,
            parent_id: 'men',
            sort_order: 1,
            is_active: true,
            description: 'Men\'s clothing',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 560,
            children: [
              { id: 'men-clothing-shirts', name: 'Shirts & T-Shirts', slug: 'men-clothing-shirts', level: 3, parent_id: 'men-clothing', sort_order: 1, is_active: true, description: 'Shirts', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 167 },
              { id: 'men-clothing-jeans', name: 'Jeans & Pants', slug: 'men-clothing-jeans', level: 3, parent_id: 'men-clothing', sort_order: 2, is_active: true, description: 'Jeans', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 134 },
              { id: 'men-clothing-jackets', name: 'Jackets & Coats', slug: 'men-clothing-jackets', level: 3, parent_id: 'men-clothing', sort_order: 3, is_active: true, description: 'Jackets', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 89 },
              { id: 'men-clothing-sweaters', name: 'Sweaters & Hoodies', slug: 'men-clothing-sweaters', level: 3, parent_id: 'men-clothing', sort_order: 4, is_active: true, description: 'Sweaters', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 92 }
            ]
          },
          {
            id: 'men-shoes',
            name: translations.shoes || 'Shoes',
            slug: 'men-shoes',
            level: 2,
            parent_id: 'men',
            sort_order: 2,
            is_active: true,
            description: 'Men\'s shoes',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 280,
            children: [
              { id: 'men-shoes-sneakers', name: 'Sneakers', slug: 'men-shoes-sneakers', level: 3, parent_id: 'men-shoes', sort_order: 1, is_active: true, description: 'Sneakers', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 112 },
              { id: 'men-shoes-dress', name: 'Dress Shoes', slug: 'men-shoes-dress', level: 3, parent_id: 'men-shoes', sort_order: 2, is_active: true, description: 'Dress shoes', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 67 },
              { id: 'men-shoes-boots', name: 'Boots', slug: 'men-shoes-boots', level: 3, parent_id: 'men-shoes', sort_order: 3, is_active: true, description: 'Boots', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 58 },
              { id: 'men-shoes-sandals', name: 'Sandals & Slides', slug: 'men-shoes-sandals', level: 3, parent_id: 'men-shoes', sort_order: 4, is_active: true, description: 'Sandals', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 43 }
            ]
          },
          {
            id: 'men-accessories',
            name: translations.accessories || 'Accessories',
            slug: 'men-accessories',
            level: 2,
            parent_id: 'men',
            sort_order: 3,
            is_active: true,
            description: 'Men\'s accessories',
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 140,
            children: [
              { id: 'men-accessories-watches', name: 'Watches', slug: 'men-accessories-watches', level: 3, parent_id: 'men-accessories', sort_order: 1, is_active: true, description: 'Watches', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 54 },
              { id: 'men-accessories-belts', name: 'Belts', slug: 'men-accessories-belts', level: 3, parent_id: 'men-accessories', sort_order: 2, is_active: true, description: 'Belts', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 38 },
              { id: 'men-accessories-wallets', name: 'Wallets', slug: 'men-accessories-wallets', level: 3, parent_id: 'men-accessories', sort_order: 3, is_active: true, description: 'Wallets', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 32 }
            ]
          }
        ]
      },
      {
        id: 'kids',
        name: translations.kids || 'Kids',
        slug: 'kids',
        level: 1,
        parent_id: null,
        sort_order: 3,
        is_active: true,
        description: 'Kids\' fashion and accessories',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 450,
        children: []
      },
      {
        id: 'unisex',
        name: translations.unisex || 'Unisex',
        slug: 'unisex',
        level: 1,
        parent_id: null,
        sort_order: 4,
        is_active: true,
        description: 'Unisex fashion and accessories',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 280,
        children: []
      }
    ];
  });

  // Get category emoji for visual appeal
  function getCategoryEmoji(categoryName: string): string {
    const emojiMap: Record<string, string> = {
      'Women': '👗',
      'Men': '👔',
      'Kids': '👶',
      'Unisex': '🌍',
      'Clothing': '👕',
      'Shoes': '👟',
      'Accessories': '💍',
      'Bags': '👜'
    };
    return emojiMap[categoryName] || '📁';
  }

  // Format item count for display
  function formatItemCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }

  // Navigation functions
  function selectL1Category(category: CategoryWithChildren) {
    selectedL1 = category;
    selectedL2 = null;
    currentLevel = 2;
    currentPath = [category.slug];
  }

  function selectL2Category(category: CategoryWithChildren) {
    selectedL2 = category;
    currentLevel = 3;
    currentPath = [...currentPath, category.slug];
  }

  function selectL3Item(item: CategoryWithChildren) {
    const fullPath = [...currentPath, item.slug];
    onCategoryClick(item.slug, 3, fullPath);
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

  function handleL1Click(category: CategoryWithChildren) {
    // If no subcategories, navigate directly
    if (!category.children || category.children.length === 0) {
      onCategoryClick(category.slug, 1, [category.slug]);
      onClose();
    } else {
      selectL1Category(category);
    }
  }

  function handleL2Click(category: CategoryWithChildren) {
    // If no items, navigate to L2 category
    if (!category.children || category.children.length === 0) {
      const fullPath = [...currentPath, category.slug];
      onCategoryClick(category.slug, 2, fullPath);
      onClose();
    } else {
      selectL2Category(category);
    }
  }
</script>

<div class="mega-menu-categories h-full flex flex-col bg-white">
  <!-- Header with breadcrumb and back button -->
  {#if currentLevel > 1}
    <div class="flex items-center px-4 py-4 border-b border-gray-200 bg-gray-50">
      <button
        onclick={goBack}
        class="flex items-center text-gray-600 hover:text-gray-900 transition-colors rounded-lg p-2 -ml-2 touch-manipulation"
        aria-label="Go back"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm font-medium">{translations.back}</span>
      </button>

      <!-- Breadcrumb -->
      <div class="flex items-center ml-4 text-sm text-gray-500">
        {#if selectedL1}
          <span>{selectedL1.name}</span>
          {#if selectedL2}
            <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>{selectedL2.name}</span>
          {/if}
        {/if}
      </div>
    </div>
  {/if}

  <!-- Navigation Content -->
  <div class="flex-1 overflow-y-auto">
    {#if currentLevel === 1}
      <!-- Level 1: Main Categories (Women, Men, Kids, Unisex) -->
      <div class="p-4">
        <div class="space-y-3">
          {#each enhancedCategories as category}
            <button
              onclick={() => handleL1Click(category)}
              class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation min-h-[60px]"
              aria-label="Browse {category.name} - {formatItemCount(category.product_count || 0)} items"
            >
              <div class="flex items-center gap-4">
                <!-- Category Icon -->
                <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">{getCategoryEmoji(category.name)}</span>
                </div>

                <!-- Category Info -->
                <div class="flex-1 text-left">
                  <div class="font-semibold text-gray-900 text-base">{category.name}</div>
                  <div class="text-sm text-gray-500">
                    {formatItemCount(category.product_count || 0)} {translations.items}
                  </div>
                </div>
              </div>

              <!-- Arrow indicator -->
              <div class="flex-shrink-0 text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {:else if currentLevel === 2 && selectedL1}
      <!-- Level 2: Subcategories (Clothing, Shoes, Accessories, Bags) -->
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 px-2">{selectedL1.name}</h2>
        <div class="space-y-2">
          {#each selectedL1.children || [] as subcategory}
            <button
              onclick={() => handleL2Click(subcategory)}
              class="w-full flex items-center justify-between px-4 py-4 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 touch-manipulation min-h-[56px]"
              aria-label="Browse {subcategory.name} - {formatItemCount(subcategory.product_count || 0)} items"
            >
              <div class="flex items-center gap-3">
                <!-- Subcategory Icon -->
                <div class="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-lg">{getCategoryEmoji(subcategory.name)}</span>
                </div>

                <!-- Subcategory Info -->
                <div class="text-left">
                  <div class="font-medium text-base">{subcategory.name}</div>
                  <div class="text-sm text-gray-500">
                    {formatItemCount(subcategory.product_count || 0)} {translations.items}
                  </div>
                </div>
              </div>

              <!-- Arrow indicator -->
              <div class="flex-shrink-0 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {:else if currentLevel === 3 && selectedL2}
      <!-- Level 3: Specific Items (T-Shirts, Dresses, Sneakers, etc.) -->
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 px-2">{selectedL2.name}</h2>
        <div class="grid grid-cols-1 gap-2">
          {#each selectedL2.children || [] as item}
            <button
              onclick={() => selectL3Item(item)}
              class="flex items-center justify-between px-4 py-4 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm touch-manipulation min-h-[52px]"
              aria-label="Browse {item.name} - {formatItemCount(item.product_count || 0)} items"
            >
              <div class="text-left flex-1">
                <div class="font-medium text-sm">{item.name}</div>
                <div class="text-xs text-gray-500">
                  {formatItemCount(item.product_count || 0)} {translations.items}
                </div>
              </div>
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

  /* Enhanced touch targets for mobile */
  button {
    -webkit-tap-highlight-color: transparent;
  }

  /* iOS Safari specific fixes */
  @supports (-webkit-touch-callout: none) {
    button {
      -webkit-touch-callout: none;
    }
  }
</style>