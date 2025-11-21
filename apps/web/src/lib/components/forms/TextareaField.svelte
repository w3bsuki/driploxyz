<script lang="ts">
  import { getFieldClasses } from '$lib/utils/form-validation.svelte';
  // getInputProps not used in TextareaField component

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
    rows?: number;
    maxlength?: number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    hint?: string;
    showCharacterCount?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  }

  let {
    label,
    fieldName,
    fieldState,
    rows = 4,
    maxlength,
    required = false,
    disabled = false,
    placeholder,
    hint,
    showCharacterCount = false,
    resize = 'vertical'
  }: Props = $props();

  // Base textarea classes
  const baseTextareaClasses = 'appearance-none block w-full px-3 py-2 border rounded-lg placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-base sm:text-sm';

  // Get dynamic classes based on field state
  const textareaClasses = $derived(
    getFieldClasses(fieldState, baseTextareaClasses)
  );

  // Generate accessible textarea props
  const accessibleTextareaProps = $derived({
    id: fieldName,
    name: fieldName,
    rows,
    maxlength,
    required,
    disabled,
    placeholder,
    'aria-invalid': fieldState.error !== null,
    'aria-describedby': getAriaDescribedBy()
  });

  // Character count
  const characterCount = $derived(
    typeof fieldState.value === 'string' ? fieldState.value.length : 0
  );

  const isNearLimit = $derived(
    maxlength ? characterCount / maxlength > 0.8 : false
  );

  const isOverLimit = $derived(
    maxlength ? characterCount > maxlength : false
  );

  // Build aria-describedby
  function getAriaDescribedBy(): string | undefined {
    const ids: string[] = [];

    if (hint) ids.push(`${fieldName}-hint`);
    if (showCharacterCount && maxlength) ids.push(`${fieldName}-count`);
    if (fieldState.error) ids.push(`${fieldName}-error`);

    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  // Handle textarea input
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    fieldState.setValue(target.value);
  }

  // Handle blur event
  function handleBlur() {
    fieldState.onBlur();
  }

  // Auto-resize textarea
  function autoResize(element: HTMLTextAreaElement) {
    if (resize === 'vertical' || resize === 'both') {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  }

  // Auto-resize on input
  function handleInputWithResize(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    handleInput(event);
    autoResize(target);
  }

  // Normalize value to a string for the textarea DOM API
  const textValue = $derived(
    fieldState.value === null || fieldState.value === undefined
      ? ''
      : typeof fieldState.value === 'string'
        ? fieldState.value
        : String(fieldState.value)
  );
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
    <textarea
      {...accessibleTextareaProps}
      value={textValue}
      class="{textareaClasses} resize-{resize}"
      oninput={handleInputWithResize}
      onblur={handleBlur}
    ></textarea>

    {#if fieldState.validating}
      <div class="absolute top-2 right-2 pointer-events-none">
        <svg class="h-4 w-4 text-[color:var(--text-muted)] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {/if}
  </div>

  <!-- Character count and error message row -->
  <div class="flex justify-between items-start mt-1">
    <div class="flex-1">
      {#if fieldState.error && fieldState.touched}
        <div
          id="{fieldName}-error"
          class="text-sm text-[color:var(--status-error-text)]"
          role="alert"
          aria-live="polite"
        >
          {fieldState.error}
        </div>
      {/if}
    </div>

    {#if showCharacterCount && maxlength}
      <div
        id="{fieldName}-count"
        class="text-xs ml-2 shrink-0 {isOverLimit
          ? 'text-[color:var(--status-error-text)]'
          : isNearLimit
            ? 'text-[color:var(--status-warning-text)]'
            : 'text-[color:var(--text-muted)]'}"
        aria-live="polite"
      >
        {characterCount}{#if maxlength} / {maxlength}{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .form-field {
    --field-spacing: 1rem;
    margin-bottom: var(--field-spacing);
  }

  .resize-none { resize: none; }
  .resize-vertical { resize: vertical; }
  .resize-horizontal { resize: horizontal; }
  .resize-both { resize: both; }
</style>