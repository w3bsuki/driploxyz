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
    beMoreSpecificLabel?: string;
    optionalText?: string;
    typeCategoryPlaceholder?: string;
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
    accessoriesListText = "Hats, Caps, Belts, Scarves, Sunglasses, Bags, Wallets",
    beMoreSpecificLabel = "Be more specific",
    optionalText = "(optional)",
    typeCategoryPlaceholder = "Type category..."
  }: Props = $props();

  // Component state
  let isExpanded = $state(false);
  let showTypeLevel = $state(false);
  let showSpecificLevel = $state(false);
  let customCategoryInput = $state('');

  // Emojis for categories
  const categoryEmoji: Record<string, string> = {
    // Gender
    'Men': '👔',
    'Women': '👗', 
    'Kids': '👶',
    'Unisex': '🔄',
    
    // Product Types (Level 2)
    'Clothing': '👕',
    'Shoes': '👟',
    'Accessories': '🎒',
    'Bags': '👜',
  };

  // Get categories by level
  const genderCategories = $derived(categories.filter(c => !c.parent_id));
  const typeCategories = $derived(
    gender ? categories.filter(c => c.parent_id === gender) : []
  );
  const specificCategories = $derived(
    type ? categories.filter(c => c.parent_id === type) : []
  );

  // Get selected names for display
  const selectedGenderName = $derived(
    gender ? genderCategories.find(c => c.id === gender)?.name : null
  );
  const selectedTypeName = $derived(
    type ? typeCategories.find(c => c.id === type)?.name : null
  );
  const selectedSpecificName = $derived(
    specific ? specificCategories.find(c => c.id === specific)?.name || specific : null
  );

  function selectGender(id: string) {
    gender = id;
    type = '';
    specific = '';
    showTypeLevel = true;
    showSpecificLevel = false;
    onGenderSelect?.(id);
  }

  function selectType(id: string) {
    type = id;
    specific = '';
    showSpecificLevel = true;
    onTypeSelect?.(id);
  }

  function selectSpecific(id: string) {
    // If custom input provided, use that instead of id
    if (customCategoryInput && id === customCategoryInput) {
      specific = customCategoryInput;
      onSpecificSelect?.(customCategoryInput);
    } else {
      specific = id;
      onSpecificSelect?.(id);
    }
    // Clear custom input
    customCategoryInput = '';
    // Auto-collapse after final selection
    setTimeout(() => {
      isExpanded = false;
      showTypeLevel = false;
      showSpecificLevel = false;
    }, 300);
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
    if (!isExpanded) {
      showTypeLevel = false;
      showSpecificLevel = false;
    } else if (gender) {
      showTypeLevel = true;
      if (type) {
        showSpecificLevel = true;
      }
    }
  }

  // Build display text
  const displayText = $derived(() => {
    if (!gender) return 'Select Category';
    
    let parts = [translateCategory(selectedGenderName || '')];
    if (type) parts.push(translateCategory(selectedTypeName || ''));
    if (specific) parts.push(translateCategory(selectedSpecificName || ''));
    
    return parts.join(' → ');
  });
</script>

<div class="space-y-2">
  <!-- Collapsible Trigger Button -->
  <button
    type="button"
    onclick={toggleExpanded}
    class="w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg transition-colors {
      isExpanded 
        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
        : gender 
          ? 'border-gray-900 ring-1 ring-gray-900' 
          : 'border-gray-300 hover:border-gray-400'
    }"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg">
        {#if selectedGenderName}
          {categoryEmoji[selectedGenderName] || '📦'}
        {:else}
          📦
        {/if}
      </span>
      <div class="text-left">
        <div class="text-sm font-medium text-gray-700">
          {whoIsItForLabel} & {categoryLabel} <span class="text-red-500">*</span>
        </div>
        <div class="text-xs {gender ? 'text-gray-900 font-medium' : 'text-gray-500'}">
          {displayText()}
        </div>
      </div>
    </div>
    <svg 
      class="w-5 h-5 text-gray-400 transition-transform {isExpanded ? 'rotate-180' : ''}" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Expandable Content -->
  {#if isExpanded}
    <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      <!-- Step 1: Gender Selection -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1.5">
          {whoIsItForLabel}
        </label>
        <div class="grid grid-cols-4 gap-1.5">
          {#each genderCategories as category}
            <button
              type="button"
              onclick={() => selectGender(category.id)}
              class="px-2 py-2 text-xs font-medium rounded-md border transition-colors {
                gender === category.id 
                  ? 'border-gray-900 bg-gray-50 text-gray-900 ring-2 ring-gray-900' 
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }"
            >
              <span class="block text-base mb-0.5">{categoryEmoji[category.name] || '📦'}</span>
              <span class="block text-xs">{translateCategory(category.name)}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Step 2: Type Selection (slides in) -->
      {#if showTypeLevel && typeCategories.length > 0}
        <div class="animate-in fade-in slide-in-from-left-2 duration-200">
          <label class="block text-xs font-medium text-gray-600 mb-1.5">
            {categoryLabel}
          </label>
          <div class="grid grid-cols-2 gap-1.5">
            {#each typeCategories as category}
              <button
                type="button"
                onclick={() => selectType(category.id)}
                class="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-md border transition-colors text-left {
                  type === category.id 
                    ? 'border-gray-900 bg-gray-50 text-gray-900 ring-2 ring-gray-900' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }"
              >
                {#if categoryEmoji[category.name]}
                  <span class="text-sm">{categoryEmoji[category.name]}</span>
                {/if}
                <span class="flex-1">{translateCategory(category.name)}</span>
                {#if type === category.id}
                  <svg class="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>

          {#if type && typeCategories.find(c => c.id === type)?.name === 'Accessories'}
            <p class="mt-1.5 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-1.5">
              <strong>{includesText}</strong> {accessoriesListText}
            </p>
          {/if}
        </div>
      {/if}

      <!-- Step 3: Specific Selection (optional, slides in) -->
      {#if showSpecificLevel && specificCategories.length > 0}
        <div class="animate-in fade-in slide-in-from-left-2 duration-200">
          <label class="block text-xs font-medium text-gray-600 mb-1.5">
            {beMoreSpecificLabel} <span class="text-gray-400">{optionalText}</span>
          </label>
          
          <!-- Specific options in compact grid FIRST -->
          <div class="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-1.5 mb-2">
            <div class="grid grid-cols-2 gap-1">
              {#each specificCategories as category}
                <button
                  type="button"
                  onclick={() => selectSpecific(category.id)}
                  class="px-3 py-2.5 text-sm font-medium rounded border transition-colors text-left {
                    specific === category.id 
                      ? 'border-gray-900 bg-gray-50 text-gray-900 ring-1 ring-gray-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }"
                >
                  {translateCategory(category.name)}
                </button>
              {/each}
            </div>
          </div>

          <!-- Quick input option BELOW the categories -->
          <div>
            <input
              type="text"
              bind:value={customCategoryInput}
              placeholder="{typeCategoryPlaceholder}"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  selectSpecific(customCategoryInput || '');
                }
              }}
              class="w-full px-2.5 py-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
            />
            <p class="mt-0.5 text-xs text-gray-500">Press Enter to confirm custom category</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  
  .slide-in-from-top-2 {
    animation: slideInFromTop 0.2s ease-out;
  }
  
  .slide-in-from-left-2 {
    animation: slideInFromLeft 0.2s ease-out;
  }
</style>