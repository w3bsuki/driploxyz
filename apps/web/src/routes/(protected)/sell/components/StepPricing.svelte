<script lang="ts">
  import { PriceInput, TagInput } from '@repo/ui';
  
  interface Profile {
    premium_boosts_remaining: number;
  }
  
  interface PriceSuggestion {
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  }
  
  interface Props {
    formData: {
      price: number;
      shipping_cost: number;
      tags: string[];
      use_premium_boost: boolean;
    };
    profile?: Profile | null;
    priceSuggestion: PriceSuggestion | null;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    onFieldChange: (field: string, value: any) => void;
    onFieldBlur: (field: string) => void;
  }
  
  let { 
    formData = $bindable(),
    profile = null,
    priceSuggestion,
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
  <!-- Price -->
  <div>
    <PriceInput
      bind:value={formData.price}
      label="Price"
      error={showError('price') ? errors.price : ''}
      required
      suggestion={priceSuggestion}
      onchange={() => onFieldChange('price', formData.price)}
      name="price"
    />
  </div>

  <!-- Shipping Cost -->
  <div>
    <PriceInput
      bind:value={formData.shipping_cost}
      label="Shipping Cost"
      error={showError('shipping_cost') ? errors.shipping_cost : ''}
      placeholder="0.00"
      name="shipping_cost"
      onchange={() => onFieldChange('shipping_cost', formData.shipping_cost)}
    />
  </div>

  <!-- Tags -->
  <div>
    <TagInput
      bind:tags={formData.tags}
      label="Tags (optional)"
      placeholder="Add tags for better discoverability"
      maxTags={10}
    />
  </div>

  <!-- Premium Boost -->
  {#if profile?.premium_boosts_remaining && profile.premium_boosts_remaining > 0}
    <div class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <label class="flex items-start">
        <input
          type="checkbox"
          bind:checked={formData.use_premium_boost}
          name="use_premium_boost"
          class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <div class="ml-3">
          <span class="font-medium text-gray-900">Use Premium Boost</span>
          <p class="text-sm text-gray-600 mt-0.5">
            Get 7 days of increased visibility
          </p>
          <p class="text-xs text-purple-600 mt-1">
            {profile.premium_boosts_remaining} boosts remaining
          </p>
        </div>
      </label>
    </div>
  {/if}
</div>