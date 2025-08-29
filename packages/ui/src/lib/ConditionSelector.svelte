<script lang="ts">
  type ConditionValue = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  
  interface ConditionOption {
    value: ConditionValue;
    label: string;
    description: string;
    icon?: string;
  }

  interface Props {
    value?: ConditionValue;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
    name?: string;
    onchange?: (value: ConditionValue) => void;
  }

  let { 
    value = $bindable(),
    label = 'Condition',
    error,
    required = false,
    disabled = false,
    class: className = '',
    name,
    onchange
  }: Props = $props();

  const conditions: ConditionOption[] = [
    {
      value: 'brand_new_with_tags',
      label: 'New with tags',
      description: 'Never worn, original tags',
      icon: '🏷️'
    },
    {
      value: 'new_without_tags',
      label: 'New no tags',
      description: 'Never worn, no tags',
      icon: '✨'
    },
    {
      value: 'like_new',
      label: 'Like new',
      description: 'Worn once or twice',
      icon: '👍'
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Minor signs of wear',
      icon: '👌'
    },
    {
      value: 'worn',
      label: 'Worn',
      description: 'Regular wear visible',
      icon: '🔄'
    },
    {
      value: 'fair',
      label: 'Fair',
      description: 'Heavy wear, still usable',
      icon: '⚠️'
    }
  ];

  function handleSelect(condition: ConditionValue) {
    if (!disabled) {
      value = condition;
      onchange?.(condition);
    }
  }

  function getButtonClasses(condition: ConditionValue) {
    const isSelected = value === condition;
    const base = 'relative flex items-center justify-center px-4 py-2 rounded-full border-2 min-w-20 whitespace-nowrap text-sm font-medium transition-colors duration-200 scroll-snap-align-start sm:flex-col sm:items-start sm:p-3 sm:rounded-lg sm:min-h-15 sm:w-full sm:text-left sm:min-w-0 sm:whitespace-normal sm:scroll-snap-align-none';
    
    if (disabled) {
      return `${base} opacity-50 cursor-not-allowed border-gray-200 bg-gray-50`;
    }
    
    if (isSelected) {
      return `${base} border-blue-500 bg-blue-500 text-white cursor-pointer shadow-md`;
    }
    
    return `${base} border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer`;
  }
</script>

<div class={`condition-selector ${className}`}>
  {#if label}
    <div class="block text-sm font-medium text-gray-700 mb-2" id="condition-label">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </div>
  {/if}

  <!-- Mobile: horizontal pills, Desktop: 2x2 grid -->
  <div class="flex gap-2 overflow-x-auto scroll-snap-type-x scroll-snap-type-mandatory sm:grid sm:grid-cols-2 sm:gap-2" role="group" aria-labelledby={label ? "condition-label" : undefined}>
    {#each conditions as condition}
      <button
        type="button"
        class={getButtonClasses(condition.value)}
        onclick={() => handleSelect(condition.value)}
        {disabled}
        aria-pressed={value === condition.value}
        aria-label="{condition.label}: {condition.description}"
      >
        <!-- Mobile: horizontal layout -->
        <div class="flex items-center gap-1 sm:hidden">
          {#if condition.icon}
            <span class="text-base" aria-hidden="true">{condition.icon}</span>
          {/if}
          <span class="text-sm font-medium">{condition.label}</span>
        </div>
        
        <!-- Desktop: vertical layout -->
        <div class="hidden sm:flex sm:items-center sm:justify-between sm:w-full">
          <div class="flex items-center gap-2">
            {#if condition.icon}
              <span class="text-lg" aria-hidden="true">{condition.icon}</span>
            {/if}
            <div>
              <span class="font-medium text-sm block">{condition.label}</span>
              <p class="text-xs mt-0.5 {value === condition.value ? 'text-blue-200' : 'text-gray-500'}">
                {condition.description}
              </p>
            </div>
          </div>
          
          {#if value === condition.value}
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  {#if error}
    <p class="text-sm text-red-600 mt-1">{error}</p>
  {/if}

  {#if name}
    <input type="hidden" {name} {value} />
  {/if}
</div>