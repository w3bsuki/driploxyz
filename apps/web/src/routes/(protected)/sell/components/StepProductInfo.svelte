<script lang="ts">
  // import { Input } from '@repo/ui';
  import { POPULAR_BRANDS } from '$lib/validation/product';
  import type { SizeOption } from '$lib/types/product';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    formData: {
      brand: string;
      size: string;
      color: string;
      material: string;
      [key: string]: string | boolean | number | null | undefined; // Allow other fields to be present
    };
    sizeOptions: SizeOption[];
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    onFieldChange: (field: string, value: string | boolean | number | null | undefined) => void;
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

  // Size groups
  const sizeGroups = $derived.by(() => {
    const groups: Record<string, SizeOption[]> = {
      'XS-XL': [],
      'Numbers': [],
      'UK/EU': [],
      'Other': []
    };
    
    sizeOptions.forEach(size => {
      if (['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(size.value)) {
        groups['XS-XL'] = [...groups['XS-XL'], size];
      } else if (/^\d+$/.test(size.value)) {
        groups['Numbers'] = [...groups['Numbers'], size];
      } else if (size.value.includes('UK') || size.value.includes('EU')) {
        groups['UK/EU'] = [...groups['UK/EU'], size];
      } else {
        groups['Other'] = [...groups['Other'], size];
      }
    });
    
    return Object.entries(groups).filter(([, sizes]) => sizes.length > 0);
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

  // Common colors for color picker - using $derived for translations
  const commonColors = $derived([
    { name: i18n.sell_colorBlack(), hex: '#000000' },
    { name: i18n.sell_colorWhite(), hex: '#FFFFFF' },
    { name: i18n.sell_colorGray(), hex: '#6B7280' },
    { name: i18n.sell_colorNavy(), hex: '#1E3A8A' },
    { name: i18n.sell_colorBrown(), hex: '#92400E' },
    { name: i18n.sell_colorBeige(), hex: '#D6B693' },
    { name: i18n.sell_colorRed(), hex: '#DC2626' },
    { name: i18n.sell_colorBlue(), hex: '#2563EB' },
    { name: i18n.sell_colorGreen(), hex: '#16A34A' },
    { name: i18n.sell_colorPink(), hex: '#EC4899' },
    { name: i18n.sell_colorPurple(), hex: '#9333EA' },
    { name: i18n.sell_colorMulti(), hex: 'linear-gradient(to right, #ff0000, #00ff00, #0000ff)' }
  ]);

  // Common materials - using $derived for translations
  const commonMaterials = $derived([
    i18n.sell_materialCotton(),
    i18n.sell_materialPolyester(),
    i18n.sell_materialLeather(),
    i18n.sell_materialDenim(),
    i18n.sell_materialWool(),
    i18n.sell_materialSilk()
  ]);
</script>

<div class="space-y-4">
  <!-- Brand Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <div id="brand-label" class="text-sm font-medium text-gray-700 mb-2 block">
      {i18n.sell_brand()} <span class="text-red-500">*</span>
    </div>
    
    <div class="grid grid-cols-3 gap-2 sm:gap-1.5" role="group" aria-labelledby="brand-label">
      {#each POPULAR_BRANDS as brand}
        <button
          type="button"
          onclick={() => selectBrand(brand)}
          class="px-2.5 py-2.5 text-xs font-medium rounded-lg border transition-colors {
            formData.brand === brand || (brand === 'Other' && showCustomBrand)
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }"
          aria-pressed={formData.brand === brand || (brand === 'Other' && showCustomBrand)}
        >
          {brand === 'Other' ? i18n.sell_brandOther() : brand}
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
          placeholder={i18n.sell_brandCustomPlaceholder()}
          class="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
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
    <div id="size-label" class="text-sm font-medium text-gray-700 mb-2 block">
      {i18n.sell_size()} <span class="text-red-500">*</span>
    </div>
    
    <div class="space-y-2" role="group" aria-labelledby="size-label">
  {#each sizeGroups as [group, sizes]}
        <div>
          <span class="text-xs uppercase tracking-wider text-gray-500 font-semibold">{group === 'XS-XL' ? i18n.sell_sizeGroupXSXL() : group === 'Numbers' ? i18n.sell_sizeGroupNumbers() : group === 'UK/EU' ? i18n.sell_sizeGroupUKEU() : i18n.sell_sizeGroupOther()}</span>
          <div class="grid grid-cols-3 gap-1.5 mt-1 sm:grid-cols-4 sm:gap-1">
            {#each sizes as size}
              <button
                type="button"
                onclick={() => selectSize(size.value)}
                class="px-2 py-2 text-xs font-medium rounded-lg border transition-colors {
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
    <label for="color-input" class="block text-sm font-medium text-gray-700 mb-2">
      {i18n.sell_color()} <span class="text-gray-400 text-xs">{i18n.sell_optional()}</span>
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
            class="w-full aspect-square rounded-lg border-2 transition-colors {
              formData.color === color.name 
                ? 'border-[color:var(--state-focus)] ring-2 ring-[color:var(--state-focus)] ring-opacity-50' 
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
          <span class="text-xs text-gray-600 mt-0.5 block">{color.name}</span>
        </button>
      {/each}
    </div>
    
    <!-- Custom color input -->
    <input
      id="color-input"
      type="text"
      placeholder={i18n.sell_colorCustomPlaceholder()}
      bind:value={formData.color}
      onblur={() => onFieldBlur('color')}
      class="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
      maxlength={30}
    />
  </div>

  <!-- Step 5: Material (optional) - Common materials -->
  <div>
    <label for="material-input" class="block text-sm font-medium text-gray-700 mb-2">
      {i18n.sell_material()} <span class="text-gray-400 text-xs">{i18n.sell_optional()}</span>
    </label>
    
    <div class="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-3">
      {#each commonMaterials as material}
        <button
          type="button"
          onclick={() => { formData.material = material; onFieldChange('material', material); }}
          class="flex items-center justify-center px-2.5 py-2.5 text-xs font-medium rounded-lg border transition-colors {
            formData.material === material 
              ? 'border-[color:var(--state-focus)] bg-[color:var(--status-info-bg)] text-[color:var(--status-info-text)]' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }"
        >
          {material}
        </button>
      {/each}
    </div>
    
    <!-- Custom material input -->
    <input
      id="material-input"
      type="text"
      placeholder={i18n.sell_materialCustomPlaceholder()}
      bind:value={formData.material}
      onblur={() => onFieldBlur('material')}
      class="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
      maxlength={50}
    />
  </div>

  <!-- Summary of selections -->
  {#if formData.brand && formData.size}
    <div class="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
      <span class="font-medium">{i18n.sell_summary()}</span>
      {formData.brand}
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