<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    error?: string;
    placeholder?: string;
    currency?: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    showCalculation?: boolean;
    feePercentage?: number;
    class?: string;
    id?: string;
    name?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
  }

  let { 
    value = $bindable(''),
    label,
    error,
    placeholder = '0.00',
    currency = '$',
    min = 0,
    max,
    step = 0.01,
    required = false,
    disabled = false,
    helpText,
    showCalculation = false,
    feePercentage = 5,
    class: className = '',
    id,
    name,
    oninput,
    onchange
  }: Props = $props();

  const inputId = $derived(id || `price-${Math.random().toString(36).substr(2, 9)}`);
  
  const numericValue = $derived(() => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  });

  const platformFee = $derived(numericValue() * (feePercentage / 100));
  const earnings = $derived(numericValue() - platformFee);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const inputValue = target.value;
    
    // Allow empty string or valid number format
    if (inputValue === '' || /^\d*\.?\d{0,2}$/.test(inputValue)) {
      value = inputValue;
      oninput?.(e);
    } else {
      // Reset to previous valid value
      target.value = value;
    }
  }

  function formatCurrency(amount: number) {
    return amount.toFixed(2);
  }

  const baseClasses = 'block w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 pl-8';
  const stateClasses = $derived(error 
    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
    : '');
  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

<div>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
      {currency}
    </span>
    <input
      type="text"
      inputmode="decimal"
      bind:value
      {placeholder}
      {disabled}
      {required}
      {name}
      {min}
      {max}
      {step}
      id={inputId}
      class={classes}
      oninput={handleInput}
      {onchange}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
    />
  </div>
  
  {#if error}
    <p id="{inputId}-error" class="text-sm text-red-600 mt-1">{error}</p>
  {/if}
  
  {#if helpText && !error}
    <p id="{inputId}-help" class="text-xs text-gray-500 mt-1">{helpText}</p>
  {/if}
  
  {#if showCalculation && numericValue() > 0}
    <div class="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
      <div class="space-y-1.5">
        <div class="flex justify-between text-gray-600">
          <span>Item price</span>
          <span class="font-medium">{currency}{formatCurrency(numericValue())}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Platform fee ({feePercentage}%)</span>
          <span class="font-medium text-red-600">-{currency}{formatCurrency(platformFee)}</span>
        </div>
        <div class="flex justify-between pt-1.5 border-t border-gray-200">
          <span class="font-medium text-gray-900">You'll earn</span>
          <span class="font-bold text-green-600">{currency}{formatCurrency(earnings)}</span>
        </div>
      </div>
    </div>
  {/if}
</div>