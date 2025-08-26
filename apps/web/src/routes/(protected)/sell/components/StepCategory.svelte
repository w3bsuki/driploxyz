<script lang="ts">
  import { CollapsibleCategorySelector } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import type { CategorySuggestion } from '$lib/utils/imageAnalysis';

  interface Props {
    categories: any[];
    formData: {
      gender?: string;
      type?: string;
      specific?: string;
      condition?: 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
      [key: string]: any;
    };
    suggestions?: CategorySuggestion | null;
    showSuggestions?: boolean;
    onFieldChange: (field: string, value: any) => void;
    onDismissSuggestions?: () => void;
    onApplySuggestions?: () => void;
  }

  let { 
    categories,
    formData = $bindable(),
    suggestions = null,
    showSuggestions = false,
    onFieldChange,
    onDismissSuggestions,
    onApplySuggestions
  }: Props = $props();

  function handleGenderSelect(id: string) {
    onFieldChange('gender', id);
  }

  function handleTypeSelect(id: string) {
    onFieldChange('type', id);
  }

  function handleSpecificSelect(id: string) {
    onFieldChange('specific', id);
  }

  function selectCondition(value: string) {
    formData.condition = value as typeof formData.condition;
    onFieldChange('condition', value);
  }

  // Condition options
  const conditions = [
    {
      value: 'brand_new_with_tags' as const,
      label: i18n.sell_condition_brandNewWithTags(),
      description: i18n.sell_condition_brandNewWithTags_desc(),
      color: 'green'
    },
    {
      value: 'new_without_tags' as const,
      label: i18n.sell_condition_newWithoutTags(),
      description: i18n.sell_condition_newWithoutTags_desc(),
      color: 'teal'
    },
    {
      value: 'like_new' as const,
      label: i18n.sell_condition_likeNew(),
      description: i18n.sell_condition_likeNew_desc(),
      color: 'blue'
    },
    {
      value: 'good' as const,
      label: i18n.sell_condition_good(),
      description: i18n.sell_condition_good_desc(),
      color: 'indigo'
    },
    {
      value: 'worn' as const,
      label: i18n.sell_condition_worn(),
      description: i18n.sell_condition_worn_desc(),
      color: 'purple'
    },
    {
      value: 'fair' as const,
      label: i18n.sell_condition_fair(),
      description: i18n.sell_condition_fair_desc(),
      color: 'yellow'
    }
  ];
</script>

<div class="space-y-4">
  <!-- AI Suggestions Banner -->
  {#if showSuggestions && suggestions && suggestions.confidence > 0}
    <div class="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 animate-in fade-in slide-in-from-top duration-300">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 class="text-sm font-semibold text-purple-900">Smart Category Suggestions</h3>
            {#if suggestions.confidence >= 0.7}
              <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">High confidence</span>
            {:else if suggestions.confidence >= 0.5}
              <span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Medium confidence</span>
            {:else}
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Low confidence</span>
            {/if}
          </div>
          
          <p class="text-xs text-gray-600 mb-3">Based on your image, we suggest:</p>
          
          <div class="flex flex-wrap gap-2 mb-3">
            {#if suggestions.gender}
              <div class="px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-sm font-medium text-purple-900">
                {suggestions.gender}
              </div>
            {/if}
            {#if suggestions.type}
              <div class="px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-sm font-medium text-purple-900">
                {suggestions.type}
              </div>
            {/if}
            {#if suggestions.specific}
              <div class="px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-sm font-medium text-purple-900">
                {suggestions.specific}
              </div>
            {/if}
          </div>
          
          {#if suggestions.reason}
            <p class="text-[10px] text-gray-500">Analysis: {suggestions.reason}</p>
          {/if}
        </div>
        
        <button 
          type="button"
          onclick={onDismissSuggestions}
          class="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Dismiss suggestions"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="flex gap-2 mt-4">
        <button
          type="button"
          onclick={onApplySuggestions}
          class="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Apply Suggestions
        </button>
        <button
          type="button"
          onclick={onDismissSuggestions}
          class="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Choose Manually
        </button>
      </div>
    </div>
  {/if}

  <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
    <div class="text-center mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">
        {i18n.sell_categoryTitle()}
      </h2>
      <p class="text-sm text-gray-600">
        {i18n.sell_categoryDescription()}
      </p>
    </div>

    <CollapsibleCategorySelector
    {categories}
    bind:gender={formData.gender}
    bind:type={formData.type}
    bind:specific={formData.specific}
    onGenderSelect={handleGenderSelect}
    onTypeSelect={handleTypeSelect}
    onSpecificSelect={handleSpecificSelect}
    whoIsItForLabel={i18n.sell_whoIsItFor()}
    categoryLabel={i18n.sell_category()}
    translateCategory={(name) => {
      const translations = {
        // Level 1 - Gender
        'Men': i18n.category_men(),
        'Women': i18n.category_women(),
        'Kids': i18n.category_kids(),
        'Unisex': i18n.category_unisex(),
        // Level 2 - Type
        'Clothing': i18n.category_clothing(),
        'Shoes': i18n.category_shoes(),
        'Accessories': i18n.category_accessories(),
        'Bags': i18n.category_bags(),
        // Level 3 - Clothing Specific
        'T-Shirts': i18n.category_tshirts(),
        'Shirts': i18n.category_shirts(),
        'Jeans': i18n.category_jeans(),
        'Jackets': i18n.category_jackets(),
        'Jackets & Coats': i18n.category_jacketsCoats(),
        'Dresses': i18n.category_dresses(),
        'Skirts': i18n.category_skirts(),
        'Shorts': i18n.category_shorts(),
        'Hoodies': i18n.category_hoodies(),
        'Sweaters': i18n.category_sweatersHoodies(),
        'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
        'Suits': i18n.category_suitsBlazers(),
        'Suits & Blazers': i18n.category_suitsBlazers(),
        'Pants & Trousers': i18n.category_pantsTrousers(),
        'Pants & Jeans': i18n.category_pantsJeans(),
        'Activewear': i18n.category_activewear(),
        'Swimwear': i18n.category_swimwear(),
        'Underwear': i18n.category_underwear(),
        'Lingerie': i18n.category_lingerie(),
        'Lingerie & Underwear': i18n.category_lingerie(),
        // Level 3 - Shoes Specific
        'Sneakers': i18n.category_sneakers(),
        'Boots': i18n.category_boots(),
        'Heels': i18n.category_heels(),
        'Flats': i18n.category_flats(),
        'Sandals': i18n.category_sandals(),
        'Athletic': i18n.category_activewear(),
        'Formal Shoes': i18n.category_formalShoes(),
        // Level 3 - Accessories Specific
        'Hats & Caps': i18n.category_hatsAndCaps(),
        'Belts': i18n.category_belts(),
        'Scarves': i18n.category_scarves(),
        'Sunglasses': i18n.category_sunglasses(),
        'Watches': i18n.category_watches(),
        'Jewelry': i18n.category_jewelry(),
        'Wallets': i18n.category_wallets(),
        'Ties': i18n.category_ties(),
        'Gloves': i18n.category_gloves(),
        // Level 3 - Bags Specific
        'Handbags': i18n.category_handbags(),
        'Backpacks': i18n.category_backpacks(),
        'Shoulder Bags': i18n.category_shoulderBags(),
        'Crossbody Bags': i18n.category_crossbodyBags(),
        'Clutches': i18n.category_clutches(),
        'Tote Bags': i18n.category_toteBags(),
        'Travel Bags': i18n.category_travelBags(),
        'Laptop Bags': i18n.category_laptopBags()
      };
      return translations[name] || name;
    }}
    includesText={i18n.sell_includes()}
    selectedText={i18n.sell_selected()}
    accessoriesListText={i18n.sell_accessoriesList()}
    beMoreSpecificLabel={i18n.sell_beMoreSpecific()}
    optionalText={i18n.sell_optional()}
    typeCategoryPlaceholder={i18n.sell_typeCategoryPlaceholder()}
    />
    
    <!-- Condition Selector - Added to Step 2 -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <label class="text-sm font-medium text-gray-700 mb-3 block">
        {i18n.sell_condition()} <span class="text-red-500">*</span>
      </label>
      
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5">
        {#each conditions as condition}
          <button
            type="button"
            onclick={() => selectCondition(condition.value)}
            class="relative px-2.5 py-2.5 text-center rounded-lg border transition-all text-xs {
              formData.condition === condition.value 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }"
            aria-pressed={formData.condition === condition.value}
          >
            <div class="font-medium text-[13px]">{condition.label}</div>
            <div class="text-[10px] opacity-70 mt-0.5">{condition.description}</div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>