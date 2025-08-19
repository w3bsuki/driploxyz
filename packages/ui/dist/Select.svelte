<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options: Option[] | string[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    onchange?: (event: Event) => void;
  }

  let { 
    value = $bindable(),
    options,
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    required = false,
    class: className = '',
    id,
    name,
    onchange
  }: Props = $props();

  const selectId = $derived(id || `select-${Math.random().toString(36).substr(2, 9)}`);

  const normalizedOptions = $derived(
    options.map(opt => 
      typeof opt === 'string' 
        ? { value: opt, label: opt }
        : opt
    )
  );

  const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm bg-white transition-colors focus:outline-hidden focus:ring-1 appearance-none cursor-pointer';
  const stateClasses = $derived(error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500');
  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

<div class="space-y-1">
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="relative">
    <select
      bind:value
      {disabled}
      {required}
      {name}
      id={selectId}
      class={classes}
      {onchange}
    >
      <option value="" disabled selected={!value}>
        {placeholder}
      </option>
      {#each normalizedOptions as option}
        <option value={option.value}>
          {option.label}
        </option>
      {/each}
    </select>
    
    <!-- Dropdown arrow -->
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
  
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>