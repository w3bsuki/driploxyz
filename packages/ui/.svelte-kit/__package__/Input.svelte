<script lang="ts">
  import type { InputType } from '../types';

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
  const baseClasses = 'block w-full rounded-[var(--input-radius)] border-2 border-[var(--input-border)] px-[var(--input-padding)] py-2 min-h-[var(--input-height)] text-[var(--input-font)] placeholder-gray-500 transition-colors duration-[var(--duration-base)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-[var(--input-focus-border)]';
  const stateClasses = $derived(error 
    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
    : '');
  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

<div>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div>
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
  </div>
  
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>