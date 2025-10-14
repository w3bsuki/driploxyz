<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  // Extend native input attributes so consumers can pass standard props like min, max, maxlength, aria-*, etc.
  interface Props extends Omit<HTMLInputAttributes, 'class' | 'children' | 'value' | 'type' | 'oninput' | 'onchange' | 'onfocus' | 'onblur'> {
    type?: HTMLInputElement['type'];
    value?: string | number | boolean;
    placeholder?: string;
    label?: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    autocomplete?: HTMLInputElement['autocomplete'];
    inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    [attr: string]: unknown;
  }

  let {
    type = 'text',
  value = $bindable<string | number | boolean>(''),
    placeholder,
    label,
    description,
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
    onblur,
    ...rest
  }: Props = $props();

  const generatedId = $derived.by(() => {
    if (id) return id;
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `input-${Math.random().toString(36).slice(2)}`;
  });

  const inputId = $derived.by(() => id ?? generatedId ?? 'input');
  const descriptionId = $derived.by(() => description ? `${inputId}-description` : undefined);
  const errorId = $derived.by(() => error ? `${inputId}-error` : undefined);

  const describedBy = $derived.by(() => [
    descriptionId,
    errorId
  ].filter(Boolean).join(' ') || undefined);

  const baseClasses =
    'block w-full rounded-[length:var(--input-radius)] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-[length:var(--input-padding)] py-2 min-h-[length:var(--input-height)] text-[length:var(--input-font)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] transition-colors duration-[var(--duration-base)] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)] disabled:cursor-not-allowed disabled:bg-[color:var(--surface-muted)] disabled:text-[color:var(--text-disabled)]';

  const stateClasses = $derived(
    error
      ? 'border-[color:var(--status-error-border)] focus:ring-[color:var(--status-error-solid)] focus:border-[color:var(--status-error-solid)]'
      : ''
  );

  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`.trim());
</script>

<div>
  {#if label}
    <label
      for={inputId}
      class="block text-sm font-medium text-[color:var(--text-primary)] mb-1.5"
    >
      {label}
      {#if required}
        <span class="text-[color:var(--status-error-solid)]">*</span>
      {/if}
    </label>
  {/if}

  <div class="space-y-[var(--space-1)]">
    <input
      {type}
      bind:value
      {placeholder}
      {disabled}
      {required}
      {name}
      {autocomplete}
      inputmode={
        inputmode ||
        (type === 'email'
          ? 'email'
          : type === 'tel'
            ? 'tel'
            : type === 'number'
              ? 'numeric'
              : undefined)
      }
      id={inputId}
      class={classes}
      aria-describedby={describedBy}
      aria-invalid={error ? 'true' : 'false'}
      {oninput}
      {onchange}
      {onfocus}
      {onblur}
      {...rest}
    />

    {#if description}
      <p
        id={descriptionId}
        class="text-sm text-[color:var(--text-muted)]"
      >
        {description}
      </p>
    {/if}

    {#if error}
      <p
        id={errorId}
        class="text-sm text-[color:var(--status-error-text)]"
        role="alert"
      >
        {error}
      </p>
    {/if}
  </div>
</div>