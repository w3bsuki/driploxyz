<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    error?: string;
    required?: boolean;
  }

  let {
    value = $bindable(),
    label = 'Condition',
    error,
    required = false
  }: Props = $props();

  const conditions = [
    {
      value: 'new',
      label: 'New with tags',
      icon: '🏷️'
    },
    {
      value: 'like-new',
      label: 'Like new',
      icon: '✨'
    },
    {
      value: 'good',
      label: 'Good',
      icon: '👍'
    },
    {
      value: 'fair',
      label: 'Fair',
      icon: '👌'
    }
  ];
</script>

<div class="w-full">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {label}{required ? '*' : ''}
    </label>
  {/if}

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {#each conditions as condition}
      <button
        type="button"
        onclick={() => value = condition.value}
        class="relative rounded-lg border-2 p-3 text-center transition-all cursor-pointer
          {value === condition.value 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 bg-white'}"
      >
        <div class="flex flex-col items-center space-y-1">
          <span class="text-xl">{condition.icon}</span>
          <p class="text-xs font-medium text-gray-900">
            {condition.label}
          </p>
        </div>
        
        {#if value === condition.value}
          <div class="absolute top-1 right-1">
            <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        {/if}
      </button>
    {/each}
  </div>

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>