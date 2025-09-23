<script lang="ts">
  import { getFieldClasses } from '$lib/utils/form-validation.svelte';
  // getInputProps not used in SelectField component

  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

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
    options: Option[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    emptyOption?: string;
  }

  let {
    label,
    fieldName,
    fieldState,
    options,
    placeholder,
    required = false,
    disabled = false,
    hint,
    emptyOption = 'Select an option...'
  }: Props = $props();

  // Base select classes
  const baseSelectClasses = 'appearance-none block w-full px-3 py-2 border rounded-lg placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-base sm:text-sm bg-[color:var(--surface-base)]';

  // Get dynamic classes based on field state
  const selectClasses = $derived(
    getFieldClasses(fieldState, baseSelectClasses)
  );

  // Generate accessible select props
  const accessibleSelectProps = $derived({
    id: fieldName,
    name: fieldName,
    required,
    disabled,
    'aria-invalid': fieldState.error !== null,
    'aria-describedby': fieldState.error ? `${fieldName}-error` : hint ? `${fieldName}-hint` : undefined
  });

  // Handle select change
  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
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
    <p id="{fieldName}-hint" class="text-xs text-[color:var(--text-muted)] mb-2 pl-1">{hint}</p>
  {/if}

  <div class="relative">
    <select
      {...accessibleSelectProps}
      value={fieldState.value}
      class={selectClasses}
      onchange={handleChange}
      onblur={handleBlur}
    >
      {#if emptyOption}
        <option value="" disabled={required}>
          {placeholder || emptyOption}
        </option>
      {/if}

      {#each options as option}
        <option
          value={option.value}
          disabled={option.disabled}
          selected={fieldState.value === option.value}
        >
          {option.label}
        </option>
      {/each}
    </select>

    <!-- Custom dropdown arrow -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      {#if fieldState.validating}
        <svg class="h-4 w-4 text-[color:var(--text-muted)] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {:else}
        <svg class="h-4 w-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      {/if}
    </div>
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

  select {
    background-image: none; /* Remove default browser arrow */
  }
</style>