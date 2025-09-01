<script lang="ts">
  interface Props {
    value?: string;
    popularBrands?: string[];
    label?: string;
    name?: string;
    error?: string;
    required?: boolean;
  }

  let {
    value = $bindable(''),
    popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gucci', 'Prada', 'Versace'],
    label = 'Brand',
    name,
    error,
    required = false
  }: Props = $props();

  let showCustomInput = $state(false);
  let customBrand = $state('');

  function selectBrand(brand: string) {
    value = brand;
    showCustomInput = false;
    customBrand = '';
  }

  function enableCustomBrand() {
    showCustomInput = true;
    value = '';
  }

  $effect(() => {
    if (showCustomInput && customBrand) {
      value = customBrand;
    }
  });
</script>

<div class="w-full">
  {#if label}
    <div id="brand-selector-label" class="block text-sm font-medium text-gray-900 mb-2">
      {label}{required ? '*' : ''}
    </div>
  {/if}

  {#if !showCustomInput}
    <div class="space-y-3">
      <!-- Popular brands grid -->
      <div id="brand-selector" class="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-labelledby="brand-selector-label">
        {#each popularBrands as brand}
          <button
            type="button"
            onclick={() => selectBrand(brand)}
            class="px-3 py-2 text-sm rounded-lg border {value === brand 
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                : 'border-gray-200 hover:border-gray-300 text-gray-900'}"
          >
            {brand}
          </button>
        {/each}
      </div>

      <!-- Other brand button -->
      <button
        type="button"
        onclick={enableCustomBrand}
        class="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 text-gray-900 transition-colors"
      >
        Other brand...
      </button>
    </div>
  {:else}
    <!-- Custom brand input -->
    <div class="space-y-2">
      <div class="relative">
        <input
          type="text"
          bind:value={customBrand}
          placeholder="Enter brand name"
          aria-label="Custom brand name"
          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
            {error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
        />
        <button
          type="button"
          onclick={() => { showCustomInput = false; customBrand = ''; value = ''; }}
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
          aria-label="Clear custom brand input"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <button
        type="button"
        onclick={() => { showCustomInput = false; customBrand = ''; }}
        class="text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to popular brands
      </button>
    </div>
  {/if}

  <!-- Hidden input for form association -->
  <input type="hidden" {name} {value} />

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>