<script lang="ts">
  import { BrandSelector, Select, ConditionSelector, Input } from '@repo/ui';
  import { POPULAR_BRANDS } from '$lib/validation/product';
  import type { SizeOption } from '$lib/types/product';
  
  interface Props {
    formData: {
      brand: string;
      size: string;
      condition: 'new' | 'like-new' | 'good' | 'fair';
      color: string;
      material: string;
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
</script>

<div class="space-y-3">
  <!-- Brand -->
  <div>
    <BrandSelector
      bind:value={formData.brand}
      brands={POPULAR_BRANDS}
      label="Brand"
      error={showError('brand') ? errors.brand : ''}
      required
      onchange={() => onFieldChange('brand', formData.brand)}
      name="brand"
    />
  </div>

  <!-- Size -->
  <div>
    <Select
      label="Size"
      bind:value={formData.size}
      error={showError('size') ? errors.size : ''}
      required
      onchange={() => onFieldChange('size', formData.size)}
      name="size"
    >
      <option value="">Select size</option>
      {#each sizeOptions as size}
        <option value={size.value}>{size.label}</option>
      {/each}
    </Select>
  </div>

  <!-- Condition -->
  <div>
    <ConditionSelector
      bind:value={formData.condition}
      label="Condition"
      error={showError('condition') ? errors.condition : ''}
      required
      name="condition"
      onchange={() => onFieldChange('condition', formData.condition)}
    />
  </div>

  <!-- Color (optional) -->
  <div>
    <Input
      type="text"
      label="Color (optional)"
      placeholder="e.g., Black, Red, Multi"
      bind:value={formData.color}
      maxlength={30}
      name="color"
    />
  </div>

  <!-- Material (optional) -->
  <div>
    <Input
      type="text"
      label="Material (optional)"
      placeholder="e.g., Cotton, Leather, Polyester"
      bind:value={formData.material}
      maxlength={50}
      name="material"
    />
  </div>
</div>

<!-- Fallback for old browsers - hidden select for condition -->
<div class="hidden">
  <label for="condition-fallback" class="sr-only">Condition (Fallback)</label>
  <select
    id="condition-fallback"
    name="condition"
    bind:value={formData.condition}
    class="sr-only"
  >
    <option value="">Select condition</option>
    <option value="brand_new_with_tags">New with tags</option>
    <option value="new_without_tags">New without tags</option>
    <option value="like_new">Like new</option>
    <option value="good">Good</option>
    <option value="worn">Worn</option>
    <option value="fair">Fair</option>
  </select>
</div>