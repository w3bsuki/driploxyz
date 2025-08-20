<script lang="ts">
  interface Props {
    value?: string;
    popularBrands?: string[];
    label?: string;
    error?: string;
    required?: boolean;
  }

  let {
    value = $bindable(''),
    popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gucci', 'Prada', 'Versace'],
    label = 'Brand',
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
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {label}{required ? '*' : ''}
    </label>
  {/if}

  {#if !showCustomInput}
    <div class="space-y-3">
      <!-- Popular brands grid -->
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {#each popularBrands as brand}
          <button
            type="button"
            onclick={() => selectBrand(brand)}
            class="px-3 py-2 text-sm rounded-lg border {value === brand 
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}"
          >
            {brand}
          </button>
        {/each}
      </div>

      <!-- Other brand button -->
      <button
        type="button"
        onclick={enableCustomBrand}
        class="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
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
          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
            {error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
        />
        <button
          type="button"
          onclick={() => { showCustomInput = false; customBrand = ''; value = ''; }}
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>