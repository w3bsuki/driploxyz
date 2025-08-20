<script lang="ts">
  type ConditionValue = 'new' | 'like-new' | 'good' | 'fair';
  
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
      value: 'new',
      label: 'New with tags',
      description: 'Never worn, original tags',
      icon: '🏷️'
    },
    {
      value: 'like-new',
      label: 'Like new',
      description: 'Worn once or twice',
      icon: '✨'
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Minor signs of wear',
      icon: '👍'
    },
    {
      value: 'fair',
      label: 'Fair',
      description: 'Visible wear, still good',
      icon: '👌'
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
    const base = 'relative flex flex-col items-start p-3 rounded-lg border-2 transition-all duration-200 min-h-[60px] w-full text-left';
    
    if (disabled) {
      return `${base} opacity-50 cursor-not-allowed border-gray-200 bg-gray-50`;
    }
    
    if (isSelected) {
      return `${base} border-black bg-black text-white cursor-pointer`;
    }
    
    return `${base} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer`;
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

  <div class="grid grid-cols-2 gap-2" role="group" aria-labelledby={label ? "condition-label" : undefined}>
    {#each conditions as condition}
      <button
        type="button"
        class={getButtonClasses(condition.value)}
        onclick={() => handleSelect(condition.value)}
        {disabled}
        aria-pressed={value === condition.value}
        aria-label="{condition.label}: {condition.description}"
      >
        <div class="flex items-start justify-between w-full">
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              {#if condition.icon}
                <span class="text-base" aria-hidden="true">{condition.icon}</span>
              {/if}
              <span class="font-medium text-sm">{condition.label}</span>
            </div>
            <p class="text-xs mt-0.5 {value === condition.value ? 'text-gray-300' : 'text-gray-500'}">
              {condition.description}
            </p>
          </div>
          
          {#if value === condition.value}
            <svg class="w-4 h-4 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
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