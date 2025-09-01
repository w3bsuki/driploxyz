<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    name?: string;
    error?: string;
    required?: boolean;
  }

  let {
    value = $bindable(),
    label = 'Condition',
    name,
    error,
    required = false
  }: Props = $props();

  const conditions = [
    {
      value: 'new',
      label: 'New'
    },
    {
      value: 'like-new',
      label: 'Like new'
    },
    {
      value: 'good',
      label: 'Good'
    },
    {
      value: 'fair',
      label: 'Fair'
    }
  ];
</script>

<div class="w-full">
  {#if label}
    <div id="condition-selector-label" class="block text-sm font-medium text-gray-900 mb-2">
      {label}{required ? '*' : ''}
    </div>
  {/if}

  <div id="condition-selector" class="grid grid-cols-4 gap-1.5" role="group" aria-labelledby="condition-selector-label">
    {#each conditions as condition}
      <button
        type="button"
        onclick={() => value = condition.value}
        class="relative rounded-md border p-2 text-center transition-colors cursor-pointer text-xs font-medium
          {value === condition.value 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}"
      >
        {condition.label}
        {#if value === condition.value}
          <div class="absolute -top-1 -right-1">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Hidden input for form association -->
  <input type="hidden" {name} {value} />

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>