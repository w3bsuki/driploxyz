<script lang="ts">
  import { Input } from '@repo/ui';
  import { POPULAR_BRANDS } from '$lib/validation/product';
  import type { SizeOption } from '$lib/types/product';
  
  interface Props {
    formData: {
      brand: string;
      size: string;
      condition: 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
      color: string;
      material: string;
      [key: string]: any; // Allow other fields to be present
    };
    sizeOptions: SizeOption[];
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    onFieldChange: (field: string, value: any) => void;
    onFieldBlur: (field: string) => void;
  }
  
  let { 
    formData = $bindable(),
    sizeOptions,
    errors,
    touched,
    onFieldChange,
    onFieldBlur
  }: Props = $props();
  
  function showError(field: string): boolean {
    return touched[field] && !!errors[field];
  }

  // Condition options - professional without emojis
  const conditions = [
    {
      value: 'brand_new_with_tags' as const,
      label: 'New with tags',
      description: 'Never worn',
      color: 'green'
    },
    {
      value: 'new_without_tags' as const,
      label: 'New no tags',
      description: 'Never worn',
      color: 'teal'
    },
    {
      value: 'like_new' as const,
      label: 'Like new',
      description: 'Worn 1-2x',
      color: 'blue'
    },
    {
      value: 'good' as const,
      label: 'Good',
      description: 'Minor wear',
      color: 'indigo'
    },
    {
      value: 'worn' as const,
      label: 'Worn',
      description: 'Visible wear',
      color: 'purple'
    },
    {
      value: 'fair' as const,
      label: 'Fair',
      description: 'Heavy wear',
      color: 'yellow'
    }
  ];


  // Size groups
  const sizeGroups = $derived(() => {
    const groups: Record<string, SizeOption[]> = {
      'XS-XL': [],
      'Numbers': [],
      'UK/EU': [],
      'Other': []
    };
    
    sizeOptions.forEach(size => {
      if (['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(size.value)) {
        groups['XS-XL'].push(size);
      } else if (/^\d+$/.test(size.value)) {
        groups['Numbers'].push(size);
      } else if (size.value.includes('UK') || size.value.includes('EU')) {
        groups['UK/EU'].push(size);
      } else {
        groups['Other'].push(size);
      }
    });
    
    return Object.entries(groups).filter(([_, sizes]) => sizes.length > 0);
  });

  let showCustomBrand = $state(false);
  let customBrand = $state('');

  function selectBrand(brand: string) {
    if (brand === 'Other') {
      showCustomBrand = true;
      formData.brand = '';
      customBrand = '';
    } else {
      showCustomBrand = false;
      formData.brand = brand;
      customBrand = '';
    }
    onFieldChange('brand', formData.brand);
  }

  function handleCustomBrandInput(e: Event) {
    const target = e.target as HTMLInputElement;
    customBrand = target.value;
    formData.brand = target.value;
    onFieldChange('brand', formData.brand);
  }

  function selectCondition(value: typeof formData.condition) {
    formData.condition = value;
    onFieldChange('condition', value);
  }

  function selectSize(size: string) {
    formData.size = size;
    onFieldChange('size', size);
  }

  // Initialize custom brand if value doesn't match popular brands
  $effect(() => {
    if (formData.brand && !POPULAR_BRANDS.includes(formData.brand)) {
      showCustomBrand = true;
      customBrand = formData.brand;
    }
  });

  // Common colors for color picker
  const commonColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Brown', hex: '#92400E' },
    { name: 'Beige', hex: '#D6B693' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Purple', hex: '#9333EA' },
    { name: 'Multi', hex: 'linear-gradient(to right, #ff0000, #00ff00, #0000ff)' }
  ];

  // Common materials
  const commonMaterials = [
    'Cotton',
    'Polyester',
    'Leather',
    'Denim',
    'Wool',
    'Silk'
  ];
</script>

<div class="space-y-3">
  <!-- Condition Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-2 block">
      Condition <span class="text-red-500">*</span>
    </label>
    
    <div class="grid grid-cols-3 gap-1.5">
      {#each conditions as condition}
        <button
          type="button"
          onclick={() => selectCondition(condition.value)}
          class="relative px-2 py-2 text-center rounded-md border transition-all text-xs {
            formData.condition === condition.value 
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }"
          aria-pressed={formData.condition === condition.value}
        >
          <div class="font-medium">{condition.label}</div>
          <div class="text-[10px] opacity-70">{condition.description}</div>
        </button>
      {/each}
    </div>
    
    {#if showError('condition')}
      <p class="text-xs text-red-600 mt-1">{errors.condition}</p>
    {/if}
  </div>

  <!-- Brand Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-2 block">
      Brand <span class="text-red-500">*</span>
    </label>
    
    <div class="grid grid-cols-3 gap-1.5">
      {#each POPULAR_BRANDS as brand}
        <button
          type="button"
          onclick={() => selectBrand(brand)}
          class="px-2 py-2 text-xs font-medium rounded-md border transition-all {
            formData.brand === brand || (brand === 'Other' && showCustomBrand)
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }"
          aria-pressed={formData.brand === brand || (brand === 'Other' && showCustomBrand)}
        >
          {brand}
        </button>
      {/each}
    </div>

    <!-- Custom brand input -->
    {#if showCustomBrand}
      <div class="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
        <input
          type="text"
          value={customBrand}
          oninput={handleCustomBrandInput}
          placeholder="Type brand name..."
          class="w-full px-3 py-2.5 text-sm border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          aria-label="Custom brand name"
        />
      </div>
    {/if}
    
    {#if showError('brand')}
      <p class="text-xs text-red-600 mt-1">{errors.brand}</p>
    {/if}
  </div>

  <!-- Size Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-2 block">
      Size <span class="text-red-500">*</span>
    </label>
    
    <div class="space-y-2">
      {#each sizeGroups() as [group, sizes]}
        <div>
          <span class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{group}</span>
          <div class="grid grid-cols-4 gap-1 mt-1">
            {#each sizes as size}
              <button
                type="button"
                onclick={() => selectSize(size.value)}
                class="px-1 py-1.5 text-xs font-medium rounded-md border transition-all {
                  formData.size === size.value 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }"
                aria-pressed={formData.size === size.value}
              >
                {size.label}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    
    {#if showError('size')}
      <p class="text-xs text-red-600 mt-1">{errors.size}</p>
    {/if}
  </div>

  <!-- Step 4: Color (optional) - Visual color picker + custom -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Color <span class="text-gray-400 text-xs">(optional)</span>
    </label>
    
    <div class="grid grid-cols-6 gap-2 mb-2">
      {#each commonColors as color}
        <button
          type="button"
          onclick={() => { formData.color = color.name; onFieldChange('color', color.name); }}
          class="relative group"
          aria-label="Select {color.name}"
        >
          <div 
            class="w-full aspect-square rounded-lg border-2 transition-all {
              formData.color === color.name 
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                : 'border-gray-200 hover:border-gray-300'
            }"
            style="background: {color.hex}; {color.hex === '#FFFFFF' ? 'box-shadow: inset 0 0 0 1px #e5e7eb;' : ''}"
          >
            {#if formData.color === color.name}
              <svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </div>
          <span class="text-[10px] text-gray-600 mt-0.5 block">{color.name}</span>
        </button>
      {/each}
    </div>
    
    <!-- Custom color input -->
    <input
      type="text"
      placeholder="Or type custom color..."
      bind:value={formData.color}
      onblur={() => onFieldBlur('color')}
      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      maxlength={30}
    />
  </div>

  <!-- Step 5: Material (optional) - Common materials -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Material <span class="text-gray-400 text-xs">(optional)</span>
    </label>
    
    <div class="grid grid-cols-3 gap-2 mb-2">
      {#each commonMaterials as material}
        <button
          type="button"
          onclick={() => { formData.material = material; onFieldChange('material', material); }}
          class="flex items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg border transition-all {
            formData.material === material 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }"
        >
          {material}
        </button>
      {/each}
    </div>
    
    <!-- Custom material input -->
    <input
      type="text"
      placeholder="Or type custom material..."
      bind:value={formData.material}
      onblur={() => onFieldBlur('material')}
      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      maxlength={50}
    />
  </div>

  <!-- Summary of selections -->
  {#if formData.condition && formData.brand && formData.size}
    <div class="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
      <span class="font-medium">Summary:</span>
      {conditions.find(c => c.value === formData.condition)?.label}
      • {formData.brand}
      • Size {formData.size}
      {#if formData.color}
        • {formData.color}
      {/if}
      {#if formData.material}
        • {formData.material}
      {/if}
    </div>
  {/if}
</div>

<!-- Hidden fallback for form submission -->
<div class="hidden">
  <select name="condition" bind:value={formData.condition} class="sr-only">
    <option value="">Select condition</option>
    <option value="brand_new_with_tags">New with tags</option>
    <option value="new_without_tags">New without tags</option>
    <option value="like_new">Like new</option>
    <option value="good">Good</option>
    <option value="worn">Worn</option>
    <option value="fair">Fair</option>
  </select>
  <input type="hidden" name="brand" value={formData.brand} />
  <input type="hidden" name="size" value={formData.size} />
</div>

<style>
  /* Fade in animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-in {
    animation: fadeIn 0.2s ease-out;
  }
</style>