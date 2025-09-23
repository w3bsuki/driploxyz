<script lang="ts">
  import { scale, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface SizeOption {
    value: string;
    label: string;
    available: boolean;
    stock?: number;
  }

  interface Props {
    sizes: SizeOption[];
    selectedSize?: string;
    onSizeSelect?: (size: string) => void;
    showStock?: boolean;
    class?: string;
  }

  let { 
    sizes, 
    selectedSize = $bindable(),
    onSizeSelect,
    showStock = false,
    class: className = '' 
  }: Props = $props();

  let hoveredSize = $state<string | null>(null);

  function handleSizeClick(size: SizeOption) {
    if (!size.available) return;
    
    selectedSize = size.value;
    onSizeSelect?.(size.value);
  }

  function getSizeStatus(size: SizeOption) {
    if (!size.available) return 'unavailable';
    if (size.stock && size.stock <= 3) return 'low-stock';
    return 'available';
  }

  function getSizeClasses(size: SizeOption) {
    const isSelected = selectedSize === size.value;
    const isHovered = hoveredSize === size.value;
    const status = getSizeStatus(size);
    
    let classes = 'relative flex flex-col items-center justify-center min-h-14 px-3 py-2 rounded-xl border-2 font-semibold transition-colors duration-200 cursor-pointer select-none ';
    
    if (status === 'unavailable') {
      classes += 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60 ';
    } else if (isSelected) {
      classes += 'border-black bg-black text-white shadow-sm md:shadow-lg scale-105 ';
    } else if (isHovered) {
      classes += 'border-gray-400 bg-gray-50 text-gray-900 scale-102 ';
    } else {
      classes += 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 ';
    }
    
    return classes;
  }
</script>

<div class="space-y-4 {className}">
  <!-- Size Label -->
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Size</h3>
    {#if selectedSize}
      <span class="text-sm text-gray-500">Selected: {selectedSize}</span>
    {/if}
  </div>

  <!-- Size Grid -->
  <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
    {#each sizes as size, index}
      <button
        class={getSizeClasses(size)}
        onclick={() => handleSizeClick(size)}
        onmouseenter={() => hoveredSize = size.value}
        onmouseleave={() => hoveredSize = null}
        disabled={!size.available}
        aria-label="Size {size.label} {size.available ? 'available' : 'unavailable'}"
        in:fly={{ y: 20, duration: 300, delay: index * 50, easing: quintOut }}
      >
        <!-- Size Label -->
        <span class="text-sm font-semibold">{size.label}</span>
        
        <!-- Stock Indicator -->
        {#if showStock && size.available && size.stock !== undefined}
          <span class="text-xs opacity-75 mt-0.5">
            {#if size.stock <= 3}
              Only {size.stock} left
            {:else}
              In stock
            {/if}
          </span>
        {/if}

        <!-- Unavailable Overlay -->
        {#if !size.available}
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-full h-0.5 bg-gray-400 rotate-45 absolute"></div>
          </div>
        {/if}

        <!-- Selection Indicator -->
        {#if selectedSize === size.value}
          <div 
            class="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center"
            in:scale={{ duration: 200, easing: quintOut }}
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        {/if}

        <!-- Low Stock Warning -->
        {#if size.available && size.stock && size.stock <= 3 && selectedSize !== size.value}
          <div class="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Size Guide Link -->
  <div class="flex items-center justify-between text-sm">
    <button class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors">
      Size guide
    </button>
    
    {#if !selectedSize}
      <span class="text-gray-500">Select a size</span>
    {:else}
      {#key selectedSize}
        <span 
          class="text-green-600 font-medium"
          in:fly={{ x: 20, duration: 200 }}
        >
          ✓ Size selected
        </span>
      {/key}
    {/if}
  </div>

  <!-- Stock Summary -->
  {#if showStock}
    <div class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
      <div class="flex items-center justify-between">
        <span>Available sizes:</span>
        <span class="font-medium">{sizes.filter(s => s.available).length} of {sizes.length}</span>
      </div>
      {#if sizes.some(s => s.available && s.stock && s.stock <= 3)}
        <div class="mt-1 text-orange-600">
          ⚠️ Limited stock on some sizes
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .scale-102 {
    transform: scale(1.02);
  }
  
  @media (hover: hover) and (pointer: fine) {
    button:hover {
      transform: translateY(-1px);
    }
  }
</style>