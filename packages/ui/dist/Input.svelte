<script lang="ts">
  import type { InputType } from './types.js';

  interface Props {
    type?: InputType;
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    autocomplete?: string;
    inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
  }

  let { 
    type = 'text',
    value = $bindable(),
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
    class: className = '',
    id,
    name,
    autocomplete,
    inputmode,
    oninput,
    onchange,
    onfocus,
    onblur
  }: Props = $props();

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  

  // Use text-base (16px) to prevent mobile zoom on focus
  const baseClasses = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500';
  const stateClasses = $derived(error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : '');
  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

<div>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    {type}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {name}
    {autocomplete}
    inputmode={inputmode || (type === 'email' ? 'email' : type === 'tel' ? 'tel' : type === 'number' ? 'numeric' : undefined)}
    id={inputId}
    class={classes}
    {oninput}
    {onchange}
    {onfocus}
    {onblur}
  />
  
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>