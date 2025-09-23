<script lang="ts">
  interface Props {
    value?: string;
    popularBrands?: string[];
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    class?: string;
    name?: string;
    onChange?: (value: string) => void;
  }

  let { 
    value = $bindable(''),
    popularBrands = [
      'Nike', 'Adidas', 'Zara', 'H&M', "Levi's", 'Gap', 
      'Uniqlo', 'Forever 21', 'Urban Outfitters', 'Mango', 'COS', 'Other'
    ],
    label = 'Brand',
    error,
    required = false,
    disabled = false,
    placeholder = 'Enter brand name',
    class: className = '',
    name,
    onChange
  }: Props = $props();

  let showCustomInput = $state(false);
  let customBrand = $state('');

  $effect(() => {
    if (value === 'Other') {
      showCustomInput = true;
    } else if (value && !popularBrands.includes(value)) {
      customBrand = value;
      showCustomInput = true;
    }
  });

  function handleBrandSelect(brand: string) {
    if (disabled) return;
    
    if (brand === 'Other') {
      value = '';
      showCustomInput = true;
      customBrand = '';
    } else {
      value = brand;
      showCustomInput = false;
      customBrand = '';
    }
    onChange?.(value);
  }

  function handleCustomInput(e: Event) {
    const target = e.target as HTMLInputElement;
    customBrand = target.value;
    value = target.value;
    onChange?.(value);
  }

  function getButtonClasses(brand: string) {
    const isSelected = value === brand || (brand === 'Other' && showCustomInput);
    const base = 'px-3 py-2 text-sm rounded-lg border-2 font-medium';
    
    if (disabled) {
      return `${base} opacity-50 cursor-not-allowed border-gray-200 bg-gray-50`;
    }
    
    if (isSelected) {
      return `${base} border-black bg-black text-white`;
    }
    
    return `${base} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50`;
  }
</script>

<div class={`brand-selector ${className}`}>
  {#if label}
    <div class="block text-sm font-medium text-gray-900 mb-2">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </div>
  {/if}

  <!-- Popular Brands Grid -->
  <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
    {#each popularBrands as brand}
      <button
        type="button"
        class={getButtonClasses(brand)}
        onclick={() => handleBrandSelect(brand)}
        {disabled}
        aria-pressed={value === brand || (brand === 'Other' && showCustomInput)}
      >
        {brand}
      </button>
    {/each}
  </div>

  <!-- Custom Brand Input -->
  {#if showCustomInput}
    <div class="mt-3 p-1">
      <input
        type="text"
        value={customBrand}
        oninput={handleCustomInput}
        {placeholder}
        {disabled}
        class="block w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500
          {error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'}"
        aria-label="Custom brand name"
      />
    </div>
  {/if}

  {#if error}
    <p class="text-sm text-red-600 mt-1">{error}</p>
  {/if}

  {#if name}
    <input type="hidden" {name} {value} />
  {/if}
</div>