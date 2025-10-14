<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Select as MeltSelect } from '../../primitives/select/index';
  import type { SelectOption } from '../../primitives/select/index';
  
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options?: Option[] | string[];
    placeholder?: string;
    label?: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    onChange?: (event: Event) => void;
    onBlur?: (event: Event) => void;
    children?: Snippet;
    'aria-describedby'?: string; // allow explicit pass-through even though we compute it
  }

  let {
    value = $bindable(),
    options,
    placeholder = 'Select an option',
    label,
    description,
    error,
    disabled = false,
    required = false,
    class: className = '',
    id,
    name,
    onChange,
    onBlur,
    children
  }: Props = $props();

  let generatedId = $state<string | null>(null);

  $effect(() => {
    if (!id && !generatedId) {
      generatedId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `select-${Math.random().toString(36).slice(2)}`;
    }
  });

  const selectId = $derived(id ?? generatedId ?? 'select');
  const descriptionId = $derived(description ? `${selectId}-description` : undefined);
  const errorId = $derived(error ? `${selectId}-error` : undefined);
  const describedBy = $derived([
    descriptionId,
    errorId
  ].filter(Boolean).join(' ') || undefined);

  // Support both options prop and children pattern
  const normalizedOptions = $derived(
    options ? options.map(opt => 
      typeof opt === 'string' 
        ? { value: opt, label: opt }
        : opt
    ) : []
  );

  // Convert our string value to the primitive's string | null format
  let primitiveValue = $derived<string | null>(value || null);

  // Handle value change and event mapping
  function handleValueChange(newValue: string | null) {
    const stringValue = newValue || '';
    value = stringValue;
    primitiveValue = newValue;
    
    // Create synthetic events for backward compatibility
    if (onChange) {
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: { value: stringValue },
        enumerable: true
      });
      onChange(changeEvent);
    }
  }

  // Handle blur event for backward compatibility
  function handleBlur() {
    if (onBlur) {
      const blurEvent = new Event('blur', { bubbles: true });
      Object.defineProperty(blurEvent, 'target', {
        value: { value: value || '' },
        enumerable: true
      });
      onBlur(blurEvent);
    }
  }

  // Error state classes for the trigger
  const errorClasses = $derived(
    error
      ? 'border-[color:var(--status-error-border)] focus:ring-[color:var(--status-error-solid)] focus:border-[color:var(--status-error-solid)]'
      : 'border-[color:var(--input-border)] focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)]'
  );

  const triggerClasses = $derived(
    `block w-full rounded-[length:var(--input-radius)] border px-[length:var(--input-padding)] py-2 pr-10 min-h-[length:var(--input-height)] text-[length:var(--input-font)] bg-[color:var(--input-bg)] text-[color:var(--text-primary)] transition-colors duration-[var(--duration-base)] focus:outline-none focus:ring-2 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${errorClasses} ${className}`.trim()
  );
</script>

<div class="space-y-[var(--space-1)]">
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-[color:var(--text-primary)] mb-1.5">
      {label}
      {#if required}
        <span class="text-[color:var(--status-error-solid)]">*</span>
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
    aria-describedby={describedBy}
    class=""
    menuClass="z-[var(--z-50,50)] max-h-60 w-full overflow-auto rounded-[length:var(--radius-lg)] bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] shadow-[var(--shadow-lg)] py-[var(--space-1)] focus:outline-none"
    optionClass="relative w-full cursor-pointer select-none px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] focus:bg-[color:var(--surface-muted)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[length:var(--touch-standard)] flex items-center transition-colors duration-[var(--duration-base)]"
  >
    {#if children}
      {@render children()}
    {/if}
  </MeltSelect>

  {#if description}
    <p id={descriptionId} class="text-sm text-[color:var(--text-muted)]">
      {description}
    </p>
  {/if}

  {#if error}
    <p id={errorId} class="text-sm text-[color:var(--status-error-text)]" role="alert">{error}</p>
  {/if}
</div>