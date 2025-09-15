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

  // Sub-step navigation state
  let currentSubStep = $state(1);
  const totalSubSteps = 4;

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

  // Sub-step navigation functions
  function nextSubStep() {
    if (currentSubStep < totalSubSteps) {
      // Smart navigation: skip sub-step 3 if no specific categories
      if (currentSubStep === 2 && specificCategories.length === 0) {
        currentSubStep = 4; // Skip to condition
      } else {
        currentSubStep++;
      }
    }
  }

  function prevSubStep() {
    if (currentSubStep > 1) {
      // Smart navigation: skip sub-step 3 if no specific categories when going back
      if (currentSubStep === 4 && specificCategories.length === 0) {
        currentSubStep = 2; // Skip back to category type
      } else {
        currentSubStep--;
      }
    }
  }

  function goToSubStep(step: number) {
    currentSubStep = step;
  }

  // Enhanced selection functions with auto-advance
  function selectGender(id: string) {
    formData.gender_category_id = id;
    formData.type_category_id = ''; // Reset dependent selections
    formData.category_id = '';
    onFieldChange('gender', id);
    // Auto-advance to next sub-step
    setTimeout(() => nextSubStep(), 300);
  }

  function selectType(id: string) {
    formData.type_category_id = id;
    formData.category_id = ''; // Reset dependent selection
    onFieldChange('type', id);
    // Auto-advance to next sub-step
    setTimeout(() => nextSubStep(), 300);
  }

  function selectSpecific(id: string) {
    formData.category_id = id;
    onFieldChange('specific', id);
    // Auto-advance to condition
    setTimeout(() => nextSubStep(), 300);
  }

  function selectCondition(value: string) {
    formData.condition = value as typeof formData.condition;
    onFieldChange('condition', value);
  }

  // Validation for sub-steps
  const canAdvanceFromStep1 = $derived(!!formData.gender_category_id);
  const canAdvanceFromStep2 = $derived(!!formData.type_category_id);
  const canAdvanceFromStep3 = $derived(specificCategories.length === 0 || !!formData.category_id);
  const canAdvanceFromStep4 = $derived(!!formData.condition);

  // Show which sub-steps are accessible
  const subStepAccessible = $derived({
    1: true, // Always accessible
    2: canAdvanceFromStep1,
    3: canAdvanceFromStep1 && canAdvanceFromStep2 && specificCategories.length > 0,
    4: canAdvanceFromStep1 && canAdvanceFromStep2 && canAdvanceFromStep3
  });

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

<!-- AI Suggestions Banner - Above all content -->
{#if showSuggestions && suggestions && suggestions.confidence > 0}
  <div class="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top duration-200 mb-4">
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

<!-- Sub-step Progress Indicator -->
<div class="flex justify-center items-center gap-1 mb-4">
  {#each Array(totalSubSteps) as _, i}
    {@const step = i + 1}
    {@const isAccessible = subStepAccessible[step]}
    {@const isActive = currentSubStep === step}
    {@const isCompleted =
      (step === 1 && canAdvanceFromStep1) ||
      (step === 2 && canAdvanceFromStep2) ||
      (step === 3 && canAdvanceFromStep3) ||
      (step === 4 && canAdvanceFromStep4)
    }

    <button
      type="button"
      onclick={() => isAccessible ? goToSubStep(step) : null}
      disabled={!isAccessible}
      class="w-2 h-2 rounded-full transition-all duration-200 {
        isActive
          ? 'bg-black w-6'
          : isCompleted
          ? 'bg-green-500'
          : isAccessible
          ? 'bg-gray-300 hover:bg-gray-400'
          : 'bg-gray-200'
      }"
      aria-label="Sub-step {step}"
    ></button>
  {/each}
</div>

<!-- Sub-step Content Container -->
<div class="relative min-h-[400px]">
  <!-- Sub-step Navigation Arrows -->
  <div class="absolute top-1/2 -translate-y-1/2 left-2 z-10">
    {#if currentSubStep > 1}
      <button
        type="button"
        onclick={prevSubStep}
        class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        aria-label="Previous section"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
  </div>

  <div class="absolute top-1/2 -translate-y-1/2 right-2 z-10">
    {#if currentSubStep < totalSubSteps &&
        ((currentSubStep === 1 && canAdvanceFromStep1) ||
         (currentSubStep === 2 && canAdvanceFromStep2) ||
         (currentSubStep === 3 && canAdvanceFromStep3) ||
         (currentSubStep === 4 && canAdvanceFromStep4))}
      <button
        type="button"
        onclick={nextSubStep}
        class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        aria-label="Next section"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Sub-step Content -->
  <div class="px-4">
    {#if currentSubStep === 1}
      <!-- Sub-step 2.1: Gender Selection -->
      <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div id="gender-label" class="text-lg font-semibold text-gray-900 mb-6 text-center">
          {i18n.sell_whoIsItFor()} <span class="text-red-500">*</span>
          {#if formData.gender_category_id}
            <span class="text-green-600 ml-2">✓</span>
          {/if}
        </div>

        <div class="grid grid-cols-2 gap-4" role="group" aria-labelledby="gender-label">
          {#each genderCategories as category}
            <button
              type="button"
              onclick={() => selectGender(category.id)}
              class="flex flex-col items-center px-4 py-4 text-sm font-medium rounded-xl border-2 transition-all duration-200 min-h-[44px] {
                formData.gender_category_id === category.id
                  ? 'border-black bg-black text-white shadow-lg transform scale-105'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }"
              aria-pressed={formData.gender_category_id === category.id}
            >
              <span class="text-2xl mb-2">{getEmoji(category.name)}</span>
              <span class="text-sm font-medium">{translateCategory(category.name)}</span>
            </button>
          {/each}
        </div>
      </div>

    {:else if currentSubStep === 2}
      <!-- Sub-step 2.2: Category Type Selection -->
      {#if typeCategories.length > 0}
        <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div id="type-label" class="text-lg font-semibold text-gray-900 mb-6 text-center">
            {i18n.sell_category()} <span class="text-red-500">*</span>
            {#if formData.type_category_id}
              <span class="text-green-600 ml-2">✓</span>
            {/if}
          </div>

          <div class="space-y-3" role="group" aria-labelledby="type-label">
            {#each typeCategories as category}
              <button
                type="button"
                onclick={() => selectType(category.id)}
                class="flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 text-left w-full min-h-[44px] {
                  formData.type_category_id === category.id
                    ? 'border-black bg-black text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }"
                aria-pressed={formData.type_category_id === category.id}
              >
                <span class="text-2xl">{getEmoji(category.name)}</span>
                <span class="flex-1 font-medium">{translateCategory(category.name)}</span>
                {#if formData.type_category_id === category.id}
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-500">Please select a gender category first</p>
        </div>
      {/if}

    {:else if currentSubStep === 3}
      <!-- Sub-step 2.3: Specific Category Selection (Optional) -->
      {#if specificCategories.length > 0}
        <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div id="specific-label" class="text-lg font-semibold text-gray-900 mb-6 text-center">
            {i18n.sell_beMoreSpecific()} <span class="text-gray-400 text-sm">({i18n.sell_optional()})</span>
            {#if formData.category_id}
              <span class="text-green-600 ml-2">✓</span>
            {/if}
          </div>

          <div class="space-y-3" role="group" aria-labelledby="specific-label">
            {#each specificCategories as category}
              <button
                type="button"
                onclick={() => selectSpecific(category.id)}
                class="px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 text-left w-full min-h-[44px] {
                  formData.category_id === category.id
                    ? 'border-black bg-black text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }"
                aria-pressed={formData.category_id === category.id}
              >
                {translateCategory(category.name)}
              </button>
            {/each}

            <!-- Skip option for optional step -->
            <button
              type="button"
              onclick={() => {
                formData.category_id = '';
                nextSubStep();
              }}
              class="px-4 py-3 text-sm font-medium rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 transition-all duration-200 text-center w-full min-h-[44px]"
            >
              Skip this step (not required)
            </button>
          </div>
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-500">No additional subcategories available</p>
          <button
            type="button"
            onclick={nextSubStep}
            class="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue to condition
          </button>
        </div>
      {/if}

    {:else if currentSubStep === 4}
      <!-- Sub-step 2.4: Condition Selection -->
      <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div id="condition-label" class="text-lg font-semibold text-gray-900 mb-6 text-center">
          {i18n.sell_condition()} <span class="text-red-500">*</span>
          {#if formData.condition}
            <span class="text-green-600 ml-2">✓</span>
          {/if}
        </div>

        <div class="grid grid-cols-1 gap-3" role="group" aria-labelledby="condition-label">
          {#each conditions as condition}
            <button
              type="button"
              onclick={() => selectCondition(condition.value)}
              class="px-4 py-3 text-center rounded-xl border-2 transition-all duration-200 text-sm min-h-[44px] {
                formData.condition === condition.value
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }"
              aria-pressed={formData.condition === condition.value}
            >
              <div class="font-semibold text-sm">{condition.label}</div>
              <div class="text-xs opacity-80 mt-1">{condition.description}</div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Selection Summary - Always visible -->
{#if formData.gender_category_id || formData.type_category_id || formData.category_id || formData.condition}
  <div class="mt-6 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
    <span class="font-medium">{i18n.sell_selected()}: </span>
    {#if formData.gender_category_id}
      {translateCategory(genderCategories.find(c => c.id === formData.gender_category_id)?.name || '')}
    {/if}
    {#if formData.type_category_id}
      → {translateCategory(typeCategories.find(c => c.id === formData.type_category_id)?.name || '')}
    {/if}
    {#if formData.category_id}
      → {translateCategory(specificCategories.find(c => c.id === formData.category_id)?.name || '')}
    {/if}
    {#if formData.condition}
      • {conditions.find(c => c.value === formData.condition)?.label}
    {/if}
  </div>
{/if}