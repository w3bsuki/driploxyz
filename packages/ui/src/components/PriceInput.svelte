<script lang="ts">
  interface Props {
    value?: number;
    label?: string;
    error?: string | string[];
    required?: boolean;
    helpText?: string;
    showCalculation?: boolean;
    feePercentage?: number;
    currency?: string;
  }

  let {
    value = $bindable(0),
    label = 'Price',
    error,
    required = false,
    helpText,
    showCalculation = false,
    feePercentage = 5,
    currency = '$'
  }: Props = $props();

  // Handle input change directly
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const numValue = parseFloat(target.value);
    if (!isNaN(numValue)) {
      value = numValue;
    } else if (target.value === '') {
      value = 0;
    }
  }

  const fee = $derived(value * (feePercentage / 100));
  const earnings = $derived(value - fee);
</script>

<div class="w-full">
  {#if label}
    <label for="price-input" class="block text-sm font-medium text-gray-900 mb-2">
      {label}{required ? '*' : ''}
    </label>
  {/if}

  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
      {currency}
    </span>
    <input
      id="price-input"
      type="number"
      value={value || ''}
      oninput={handleInput}
      step="0.01"
      min="0.01"
      placeholder="0.00"
      class="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
        {error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
    />
  </div>

  {#if showCalculation && value > 0}
    <div class="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
      <div class="flex justify-between text-gray-500">
        <span>Listing price:</span>
        <span class="font-medium">{currency}{value.toFixed(2)}</span>
      </div>
      <div class="flex justify-between text-gray-500 mt-1">
        <span>Service fee ({feePercentage}%):</span>
        <span>-{currency}{fee.toFixed(2)}</span>
      </div>
      <div class="flex justify-between text-gray-900 font-medium mt-2 pt-2 border-t border-gray-200">
        <span>You'll receive:</span>
        <span>{currency}{earnings.toFixed(2)}</span>
      </div>
    </div>
  {/if}

  {#if helpText && !error}
    <p class="mt-2 text-sm text-gray-500">{helpText}</p>
  {/if}

  {#if error}
    <p class="mt-2 text-sm text-red-600">{Array.isArray(error) ? error[0] : error}</p>
  {/if}
</div>