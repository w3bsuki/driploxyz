<script lang="ts">
  interface Category {
    id: string;
    name: string;
    parent_id: string | null;
  }

  interface Props {
    categories: Category[];
    gender?: string;
    type?: string;
    specific?: string;
    onGenderSelect?: (id: string) => void;
    onTypeSelect?: (id: string) => void;
    onSpecificSelect?: (id: string) => void;
    // Translation props
    whoIsItForLabel?: string;
    categoryLabel?: string;
    translateCategory?: (categoryName: string) => string;
    includesText?: string;
    selectedText?: string;
    accessoriesListText?: string;
  }

  let {
    categories = [],
    gender = $bindable(),
    type = $bindable(),
    specific = $bindable(),
    onGenderSelect,
    onTypeSelect,
    onSpecificSelect,
    whoIsItForLabel = "Who's it for?",
    categoryLabel = "Category",
    translateCategory = (name: string) => name,
    includesText = "Includes:",
    selectedText = "Selected:",
    accessoriesListText = "Hats, Caps, Belts, Scarves, Sunglasses, Bags, Wallets"
  }: Props = $props();

  // Emojis for ALL categories - standardized
  const categoryEmoji: Record<string, string> = {
    // Gender
    'Men': '👔',
    'Women': '👗', 
    'Kids': '👶',
    'Unisex': '🔄',
    
    // Product Types (Level 2)
    'Clothing': '👕',
    'Shoes': '👟',
    
    // All subcategories alphabetically
    'Accessories': '🎒',
    'Activewear': '🏃',
    'Bags': '👜',
    'Bags & Purses': '👜',
    'Boots': '🥾',
    'Dresses': '👗',
    'Flats': '🥿',
    'Formal Shoes': '👞',
    'Heels': '👠',
    'Hoodies': '🧥',
    'Jackets': '🧥',
    'Jackets & Coats': '🧥',
    'Jeans': '👖',
    'Jewelry': '💍',
    'Lingerie & Underwear': '👙',
    'Pants & Jeans': '👖',
    'Pants & Trousers': '👖',
    'Sandals': '👡',
    'Sandals & Slides': '👡',
    'Shirts': '👔',
    'Shirts & Blouses': '👚',
    'Shorts': '🩳',
    'Skirts': '👗',
    'Sneakers': '👟',
    'Suits & Blazers': '🤵',
    'Sweaters & Hoodies': '🧥',
    'Swimwear': '🩱',
    'T-Shirts': '👕',
    'Tops & T-Shirts': '👕',
    'Underwear': '🩲',
    'Watches': '⌚',
    
    // Level 3 Specific items
    'Hats & Caps': '🧢',
    'Belts': '👞',
    'Scarves': '🧣',
    'Sunglasses': '🕶️',
    'Wallets': '💳',
    'Wallets & Purses': '💳',
    'Hair Accessories': '🎀',
    'Ties': '👔',
    'Cufflinks': '💎',
    'Backpacks': '🎒',
    'Gloves': '🧤',
    'Gloves & Mittens': '🧤',
    'Shawls': '🧣',
    'Bandanas': '🎭',
    'Bibs': '👶',
    'Suspenders': '👔',
    'Keychains': '🔑',
    'Phone Cases': '📱',
    'Pocket Squares': '👔',
    
    // Bag types
    'Handbags': '👜',
    'Shoulder Bags': '👜',
    'Crossbody Bags': '👜',
    'Clutches': '👛',
    'Tote Bags': '👜',
    'Makeup Bags': '💄',
    'Travel Bags': '🧳',
    'Briefcases': '💼',
    'Messenger Bags': '💼',
    'Gym Bags': '🏃',
    'Duffel Bags': '🎒',
    'Laptop Bags': '💻',
    'School Bags': '🎒',
    'Lunch Bags': '🍱',
    'Mini Bags': '👛'
  };

  // Get categories by level
  const genderCategories = $derived(categories.filter(c => !c.parent_id));
  const typeCategories = $derived(
    gender ? categories.filter(c => c.parent_id === gender) : []
  );
  const specificCategories = $derived(
    type ? categories.filter(c => c.parent_id === type) : []
  );

  function selectGender(id: string) {
    gender = id;
    type = '';
    specific = '';
    onGenderSelect?.(id);
  }

  function selectType(id: string) {
    type = id;
    specific = '';
    onTypeSelect?.(id);
  }

  function selectSpecific(id: string) {
    specific = id;
    onSpecificSelect?.(id);
  }
</script>

<div class="space-y-4">
  <!-- Step 1: Gender - Compact horizontal pills -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {whoIsItForLabel} <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-4 gap-2">
      {#each genderCategories as category}
        <button
          type="button"
          onclick={() => selectGender(category.id)}
          class="px-3 py-2.5 text-sm font-medium rounded-lg border transition-all {
            gender === category.id 
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }"
          aria-pressed={gender === category.id}
          aria-label="Select {category.name}"
        >
          <span class="block text-lg mb-0.5">{categoryEmoji[category.name] || '📦'}</span>
          <span class="block text-xs">{translateCategory(category.name)}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Step 2: Type - Scrollable grid with consistent sizing -->
  {#if gender && typeCategories.length > 0}
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-200">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {categoryLabel} <span class="text-red-500">*</span>
      </label>
      
      <!-- Scrollable container for many categories -->
      <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
        <div class="grid grid-cols-2 gap-2">
          {#each typeCategories as category}
            {@const emoji = categoryEmoji[category.name]}
            <button
              type="button"
              onclick={() => selectType(category.id)}
              class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all text-left {
                type === category.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }"
              aria-pressed={type === category.id}
              aria-label="Select {category.name}"
            >
              {#if emoji}
                <span class="text-base shrink-0">{emoji}</span>
                <span class="flex-1 truncate">{translateCategory(category.name)}</span>
              {:else}
                <span class="flex-1">{translateCategory(category.name)}</span>
              {/if}
              {#if type === category.id}
                <svg class="w-4 h-4 text-blue-600 shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Help text for Accessories -->
      {#if type && typeCategories.find(c => c.id === type)?.name === 'Accessories'}
        <p class="mt-2 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-2">
          <strong>{includesText}</strong> {accessoriesListText}
        </p>
      {/if}
    </div>
  {/if}

  <!-- Step 3: Specific (if exists) - Beautiful button grid like Step 2 -->
  {#if type && specificCategories.length > 0}
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-200">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Be more specific <span class="text-gray-400">(optional - helps buyers find your item)</span>
      </label>
      
      <!-- Skip option first -->
      <div class="mb-3">
        <button
          type="button"
          onclick={() => selectSpecific('')}
          class="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all text-left {
            specific === '' 
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }"
          aria-pressed={specific === ''}
          aria-label="Skip specific selection"
        >
          <span class="text-base shrink-0">⏭️</span>
          <span class="flex-1">Skip - I'll stay with {translateCategory(typeCategories.find(c => c.id === type)?.name || '')}</span>
          {#if specific === ''}
            <svg class="w-4 h-4 text-blue-600 shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
      </div>

      <!-- Specific options in scrollable grid -->
      <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
        <div class="grid grid-cols-2 gap-2">
          {#each specificCategories as category}
            <button
              type="button"
              onclick={() => selectSpecific(category.id)}
              class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all text-left {
                specific === category.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }"
              aria-pressed={specific === category.id}
              aria-label="Select {category.name}"
            >
              <span class="flex-1">{translateCategory(category.name)}</span>
              {#if specific === category.id}
                <svg class="w-4 h-4 text-blue-600 shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Selection summary - Compact -->
  {#if gender && type}
    <div class="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
      <span class="font-medium">{selectedText}</span>
      {genderCategories.find(c => c.id === gender)?.name}
      → {typeCategories.find(c => c.id === type)?.name}
      {#if specific}
        → {specificCategories.find(c => c.id === specific)?.name}
      {/if}
    </div>
  {/if}
</div>