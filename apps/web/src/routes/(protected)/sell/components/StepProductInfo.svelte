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

  // Condition options with better emojis and descriptions
  const conditions = [
    {
      value: 'brand_new_with_tags' as const,
      label: 'New with tags',
      emoji: '🏷️',
      description: 'Never worn, tags attached',
      color: 'emerald'
    },
    {
      value: 'new_without_tags' as const,
      label: 'New no tags',
      emoji: '✨',
      description: 'Never worn, tags removed',
      color: 'teal'
    },
    {
      value: 'like_new' as const,
      label: 'Like new',
      emoji: '💎',
      description: 'Worn 1-2 times',
      color: 'blue'
    },
    {
      value: 'good' as const,
      label: 'Good',
      emoji: '👍',
      description: 'Minor wear signs',
      color: 'indigo'
    },
    {
      value: 'worn' as const,
      label: 'Worn',
      emoji: '🔄',
      description: 'Regular wear visible',
      color: 'purple'
    },
    {
      value: 'fair' as const,
      label: 'Fair',
      emoji: '⚠️',
      description: 'Heavy wear, usable',
      color: 'amber'
    }
  ];

  // Brand emojis for popular brands
  const brandEmojis: Record<string, string> = {
    'Nike': '✔️',
    'Adidas': '🔺',
    'Zara': '🏢',
    'H&M': '👔',
    "Levi's": '👖',
    'Gap': '🌐',
    'Uniqlo': '🎌',
    'Forever 21': '💫',
    'Urban Outfitters': '🏙️',
    'Mango': '🥭',
    'COS': '🎨',
    'Other': '➕'
  };

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
    { name: 'Cotton', emoji: '🌿' },
    { name: 'Polyester', emoji: '🧵' },
    { name: 'Leather', emoji: '🐄' },
    { name: 'Denim', emoji: '👖' },
    { name: 'Wool', emoji: '🐑' },
    { name: 'Silk', emoji: '🦋' }
  ];
</script>

<div class="space-y-4">
  <!-- Step 1: Condition - Visual cards with emojis -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      What condition is it in? <span class="text-red-500">*</span>
    </label>
    
    <!-- Mobile: 2x3 grid, Desktop: 3x2 grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {#each conditions as condition}
        <button
          type="button"
          onclick={() => selectCondition(condition.value)}
          class="relative flex flex-col items-center p-3 text-center rounded-lg border-2 transition-all {
            formData.condition === condition.value 
              ? `border-${condition.color}-500 bg-${condition.color}-50 text-${condition.color}-700 ring-2 ring-${condition.color}-500 ring-opacity-50` 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
          }"
          aria-pressed={formData.condition === condition.value}
          aria-label="{condition.label}: {condition.description}"
        >
          <span class="text-2xl mb-1">{condition.emoji}</span>
          <span class="text-xs font-semibold">{condition.label}</span>
          <span class="text-[10px] text-gray-500 mt-0.5">{condition.description}</span>
          
          {#if formData.condition === condition.value}
            <svg class="absolute top-1 right-1 w-4 h-4 text-{condition.color}-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
    
    {#if showError('condition')}
      <p class="text-xs text-red-600 mt-1">{errors.condition}</p>
    {/if}
  </div>

  <!-- Step 2: Brand - Compact grid with emojis -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      What's the brand? <span class="text-red-500">*</span>
    </label>
    
    <!-- Popular brands in compact grid -->
    <div class="grid grid-cols-3 gap-2">
      {#each POPULAR_BRANDS as brand}
        {@const emoji = brandEmojis[brand] || '🏷️'}
        <button
          type="button"
          onclick={() => selectBrand(brand)}
          class="flex items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium rounded-lg border-2 transition-all {
            formData.brand === brand || (brand === 'Other' && showCustomBrand)
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }"
          aria-pressed={formData.brand === brand || (brand === 'Other' && showCustomBrand)}
        >
          <span class="text-sm">{emoji}</span>
          <span class="truncate">{brand}</span>
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

  <!-- Step 3: Size - Grouped selection -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      What size? <span class="text-red-500">*</span>
    </label>
    
    <!-- Size groups -->
    <div class="space-y-2">
      {#each sizeGroups() as [group, sizes]}
        <div>
          <span class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{group}</span>
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mt-1">
            {#each sizes as size}
              <button
                type="button"
                onclick={() => selectSize(size.value)}
                class="px-2 py-2 text-xs font-medium rounded-md border-2 transition-all {
                  formData.size === size.value 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
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
          onclick={() => { formData.material = material.name; onFieldChange('material', material.name); }}
          class="flex items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg border transition-all {
            formData.material === material.name 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }"
        >
          <span class="text-sm">{material.emoji}</span>
          <span>{material.name}</span>
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
      {conditions.find(c => c.value === formData.condition)?.emoji}
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
  /* Tailwind doesn't support dynamic classes, so we need to define them */
  .border-emerald-500 { border-color: rgb(16 185 129); }
  .bg-emerald-50 { background-color: rgb(236 253 245); }
  .text-emerald-700 { color: rgb(4 120 87); }
  .ring-emerald-500 { --tw-ring-color: rgb(16 185 129); }
  .text-emerald-600 { color: rgb(5 150 105); }
  
  .border-teal-500 { border-color: rgb(20 184 166); }
  .bg-teal-50 { background-color: rgb(240 253 250); }
  .text-teal-700 { color: rgb(15 118 110); }
  .ring-teal-500 { --tw-ring-color: rgb(20 184 166); }
  .text-teal-600 { color: rgb(13 148 136); }
  
  .border-indigo-500 { border-color: rgb(99 102 241); }
  .bg-indigo-50 { background-color: rgb(238 242 255); }
  .text-indigo-700 { color: rgb(67 56 202); }
  .ring-indigo-500 { --tw-ring-color: rgb(99 102 241); }
  .text-indigo-600 { color: rgb(79 70 229); }
  
  .border-purple-500 { border-color: rgb(168 85 247); }
  .bg-purple-50 { background-color: rgb(250 245 255); }
  .text-purple-700 { color: rgb(126 34 206); }
  .ring-purple-500 { --tw-ring-color: rgb(168 85 247); }
  .text-purple-600 { color: rgb(147 51 234); }
  
  .border-amber-500 { border-color: rgb(245 158 11); }
  .bg-amber-50 { background-color: rgb(255 251 235); }
  .text-amber-700 { color: rgb(180 83 9); }
  .ring-amber-500 { --tw-ring-color: rgb(245 158 11); }
  .text-amber-600 { color: rgb(217 119 6); }
  
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