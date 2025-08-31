<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Select as MeltSelect } from './primitives/select/index';
  import type { SelectOption } from './primitives/select/index';
  
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options?: Option[] | string[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    onchange?: (event: Event) => void;
    onblur?: (event: Event) => void;
    children?: Snippet;
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
    onchange,
    onblur,
    children
  }: Props = $props();

  const selectId = $derived(id || `select-${Math.random().toString(36).substr(2, 9)}`);

  // Support both options prop and children pattern
  const normalizedOptions = $derived(
    options ? options.map(opt => 
      typeof opt === 'string' 
        ? { value: opt, label: opt }
        : opt
    ) : []
  );

  // Convert our string value to the primitive's string | null format
  let primitiveValue = $state<string | null>(value || null);
  
  // Sync primitive value with our public API
  $effect(() => {
    primitiveValue = value || null;
  });

  // Handle value change and event mapping
  function handleValueChange(newValue: string | null) {
    const stringValue = newValue || '';
    value = stringValue;
    primitiveValue = newValue;
    
    // Create synthetic events for backward compatibility
    if (onchange) {
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: { value: stringValue },
        enumerable: true
      });
      onchange(changeEvent);
    }
  }

  // Handle blur event for backward compatibility
  function handleBlur() {
    if (onblur) {
      const blurEvent = new Event('blur', { bubbles: true });
      Object.defineProperty(blurEvent, 'target', {
        value: { value: value || '' },
        enumerable: true
      });
      onblur(blurEvent);
    }
  }

  // Error state classes for the trigger
  const errorClasses = $derived(error 
    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
    : 'border-gray-300 focus:ring-gray-500/20 focus:border-gray-500');
  
  const triggerClasses = $derived(`block w-full rounded-lg border px-3 py-2 pr-10 min-h-[44px] text-base bg-white transition-colors duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${errorClasses} ${className}`);
</script>

<div>
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-gray-900 mb-1.5">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <MeltSelect
    options={normalizedOptions}
    bind:value={primitiveValue}
    {placeholder}
    {disabled}
    {required}
    {name}
    id={selectId}
    onValueChange={handleValueChange}
    onBlur={handleBlur}
    triggerClass={triggerClasses}
    class=""
    menuClass="z-50 max-h-60 w-full overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg py-1 focus:outline-none"
    optionClass="relative w-full cursor-pointer select-none px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] flex items-center transition-colors duration-200"
  >
    {#if children}
      {@render children()}
    {/if}
  </MeltSelect>
  
  {#if error}
    <p class="text-sm text-red-600 mt-1">{error}</p>
  {/if}
</div>