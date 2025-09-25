<script lang="ts">
  interface Props {
    type?: HTMLInputElement['type'];
    value?: string;
    placeholder?: string;
    label?: string;
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
  }

  let {
    type = 'text',
    value = $bindable(''),
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
  

  // Use text-base (16px) to prevent mobile zoom on focus - @tailwindcss/forms provides base styling
  const baseClasses = 'block w-full rounded-md border-[color:var(--border-default)] bg-[color:var(--surface-base)] px-3 py-2 min-h-11 text-base text-[color:var(--text-primary)] placeholder-[color:var(--text-tertiary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-0 focus:border-[color:var(--color-primary)] disabled:cursor-not-allowed disabled:bg-[color:var(--surface-muted)] disabled:text-[color:var(--text-disabled)]';
  const stateClasses = $derived(error
    ? 'border-[color:var(--status-error-border)] focus:ring-[color:var(--status-error-solid)] focus:border-[color:var(--status-error-solid)]'
    : '');
  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

<div>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-[color:var(--text-strong)] mb-2">
      {label}
      {#if required}
        <span class="text-[color:var(--status-error-solid)]">*</span>
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
    aria-describedby={error ? `${inputId}-error` : undefined}
    aria-invalid={error ? 'true' : 'false'}
    {oninput}
    {onchange}
    {onfocus}
    {onblur}
    />
  </div>
  
  {#if error}
    <p class="mt-2 text-sm text-[color:var(--status-error-text)]" id="{inputId}-error">{error}</p>
  {/if}
</div>