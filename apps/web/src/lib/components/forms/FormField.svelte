<script lang="ts">
  import { getFieldClasses, getInputProps, type FormInputProps } from '$lib/utils/form-validation.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    fieldName: string;
    fieldState: {
      value: unknown;
      error: string | null;
      touched: boolean;
      dirty: boolean;
      validating: boolean;
      setValue: (value: unknown) => void;
      onBlur: () => void;
      onChange: (value: unknown) => void;
    };
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    autocomplete?: string;
    hint?: string;
    children?: Snippet;
    inputProps?: Partial<FormInputProps>;
  }

  let {
    label,
    fieldName,
    fieldState,
    type = 'text',
    required = false,
    disabled = false,
    placeholder,
    autocomplete,
    hint,
    children,
    inputProps = {}
  }: Props = $props();

  // Base input classes
  const baseInputClasses = 'appearance-none block w-full px-3 py-2 border rounded-lg placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-base sm:text-sm';

  // Get dynamic classes based on field state
  const inputClasses = $derived(
    getFieldClasses(fieldState, baseInputClasses)
  );

  // Generate accessible input props
  const accessibleInputProps = $derived(
    getInputProps(fieldName, fieldState, {
      type,
      required,
      disabled,
      placeholder,
      autocomplete,
      ...inputProps
    })
  );

  // Handle input change with proper event typing
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    fieldState.setValue(target.value);
  }

  // Handle blur event
  function handleBlur() {
    fieldState.onBlur();
  }
</script>

<div class="form-field">
  <label for={fieldName} class="block text-sm font-semibold text-[color:var(--text-primary)] mb-1 pl-1">
    {label}
    {#if required}
      <span class="text-[color:var(--status-error-text)] ml-1" aria-label="required">*</span>
    {/if}
  </label>

  {#if hint}
    <p class="text-xs text-[color:var(--text-muted)] mb-2 pl-1">{hint}</p>
  {/if}

  <div class="relative">
    {#if children}
      {@render children()}
    {:else}
      <input
        {...accessibleInputProps}
        value={fieldState.value}
        class={inputClasses}
        oninput={handleInput}
        onblur={handleBlur}
      />
    {/if}

    {#if fieldState.validating}
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="h-4 w-4 text-[color:var(--text-muted)] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {/if}
  </div>

  {#if fieldState.error && fieldState.touched}
    <div
      id="{fieldName}-error"
      class="mt-1 text-sm text-[color:var(--status-error-text)]"
      role="alert"
      aria-live="polite"
    >
      {fieldState.error}
    </div>
  {/if}
</div>

<style>
  .form-field {
    --field-spacing: 1rem;
    margin-bottom: var(--field-spacing);
  }
</style>