<script lang="ts">
  import * as i18n from '@repo/i18n';
  import type { CategorySuggestion } from '$lib/utils/imageAnalysis';
  import { translateCategory, getCategoryIcon } from '$lib/categories/mapping';

  interface Category {
    id: string;
    name: string;
    parent_id: string | null;
  }

  interface Props {
    categories: Category[];
    formData: {
      gender_category_id?: string;
      type_category_id?: string;
      category_id?: string;
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

  // Category derivations
  const genderCategories = $derived(categories.filter(c => !c.parent_id));
  const typeCategories = $derived(
    formData.gender_category_id 
      ? categories.filter(c => c.parent_id === formData.gender_category_id) 
      : []
  );
  const specificCategories = $derived(
    formData.type_category_id
      ? categories.filter(c => c.parent_id === formData.type_category_id) 
      : []
  );

  // Category emoji helper - uses centralized getCategoryIcon
  function getEmoji(name: string): string {
    return getCategoryIcon(name);
  }

  function selectGender(id: string) {
    formData.gender_category_id = id;
    formData.type_category_id = ''; // Reset dependent selections
    formData.category_id = '';
    onFieldChange('gender', id);
  }

  function selectType(id: string) {
    formData.type_category_id = id;
    formData.category_id = ''; // Reset dependent selection
    onFieldChange('type', id);
  }

  function selectSpecific(id: string) {
    formData.category_id = id;
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
  <!-- AI Suggestions Banner - Compact Version -->
  {#if showSuggestions && suggestions && suggestions.confidence > 0}
    <div class="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top duration-200">
      <div class="flex items-center justify-between gap-2">
        <!-- Left side: Icon and suggested categories -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <svg class="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          
          <div class="flex items-center gap-1.5 overflow-x-auto">
            <span class="text-xs text-gray-600 flex-shrink-0">AI suggests:</span>
            {#if suggestions.gender}
              <span class="px-2 py-0.5 bg-white border border-purple-300 rounded text-xs font-medium text-purple-900 flex-shrink-0">
                {suggestions.gender}
              </span>
            {/if}
            {#if suggestions.type}
              <span class="px-2 py-0.5 bg-white border border-purple-300 rounded text-xs font-medium text-purple-900 flex-shrink-0">
                {suggestions.type}
              </span>
            {/if}
            {#if suggestions.specific}
              <span class="px-2 py-0.5 bg-white border border-purple-300 rounded text-xs font-medium text-purple-900 flex-shrink-0">
                {suggestions.specific}
              </span>
            {/if}
          </div>
        </div>
        
        <!-- Right side: Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onclick={onApplySuggestions}
            class="px-2.5 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors"
          >
            Apply
          </button>
          <button 
            type="button"
            onclick={onDismissSuggestions}
            class="p-1 hover:bg-purple-100 rounded transition-colors"
            aria-label="{i18n.sell_dismissSuggestions()}"
          >
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Gender Selection Card -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-2 block">
      {i18n.sell_whoIsItFor()} <span class="text-red-500">*</span>
    </label>
    
    <div class="grid grid-cols-4 gap-1.5">
      {#each genderCategories as category}
        <button
          type="button"
          onclick={() => selectGender(category.id)}
          class="flex flex-col items-center px-2 py-2.5 text-xs font-medium rounded-lg border transition-all {
            formData.gender_category_id === category.id 
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }"
          aria-pressed={formData.gender_category_id === category.id}
        >
          <span class="text-base mb-0.5">{getEmoji(category.name)}</span>
          <span class="text-[10px]">{translateCategory(category.name)}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Type Selection Card -->
  {#if typeCategories.length > 0}
    <div class="bg-white rounded-lg border-2 border-gray-200 p-3 animate-in fade-in slide-in-from-top duration-200">
      <label class="text-sm font-medium text-gray-700 mb-2 block">
        {i18n.sell_category()} <span class="text-red-500">*</span>
      </label>
      
      <div class="grid grid-cols-2 gap-1.5">
        {#each typeCategories as category}
          <button
            type="button"
            onclick={() => selectType(category.id)}
            class="flex items-center gap-2 px-2.5 py-2.5 text-xs font-medium rounded-lg border transition-all text-left {
              formData.type_category_id === category.id 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }"
            aria-pressed={formData.type_category_id === category.id}
          >
            <span class="text-sm">{getEmoji(category.name)}</span>
            <span class="flex-1">{translateCategory(category.name)}</span>
            {#if formData.type_category_id === category.id}
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Specific Category Selection Card (Optional) -->
  {#if specificCategories.length > 0}
    <div class="bg-white rounded-lg border-2 border-gray-200 p-3 animate-in fade-in slide-in-from-top duration-200">
      <label class="text-sm font-medium text-gray-700 mb-2 block">
        {i18n.sell_beMoreSpecific()} <span class="text-gray-400 text-xs">{i18n.sell_optional()}</span>
      </label>
      
      <div class="max-h-32 overflow-y-auto">
        <div class="grid grid-cols-2 gap-1.5">
          {#each specificCategories as category}
            <button
              type="button"
              onclick={() => selectSpecific(category.id)}
              class="px-2.5 py-2.5 text-xs font-medium rounded-lg border transition-all text-left {
                formData.category_id === category.id 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }"
              aria-pressed={formData.category_id === category.id}
            >
              {translateCategory(category.name)}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Condition Selection Card -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-2 block">
      {i18n.sell_condition()} <span class="text-red-500">*</span>
    </label>
    
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5">
      {#each conditions as condition}
        <button
          type="button"
          onclick={() => selectCondition(condition.value)}
          class="px-2.5 py-2.5 text-center rounded-lg border transition-all text-xs {
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

  <!-- Selection Summary -->
  {#if formData.gender_category_id && formData.type_category_id}
    <div class="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
      <span class="font-medium">{i18n.sell_selected()}</span>
      {translateCategory(genderCategories.find(c => c.id === formData.gender_category_id)?.name || '')}
      → {translateCategory(typeCategories.find(c => c.id === formData.type_category_id)?.name || '')}
      {#if formData.category_id}
        → {translateCategory(specificCategories.find(c => c.id === formData.category_id)?.name || '')}
      {/if}
      {#if formData.condition}
        • {conditions.find(c => c.value === formData.condition)?.label}
      {/if}
    </div>
  {/if}
</div>