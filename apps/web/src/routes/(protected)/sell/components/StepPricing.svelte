<script lang="ts">
  import { PriceInput, TagInput } from '@repo/ui';
  
  interface Profile {
    subscription_tier?: string;
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
      [key: string]: any;
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
  
  // Convert prices to numbers and provide safe defaults
  const safePrice = $derived(
    typeof formData.price === 'number' ? formData.price : parseFloat(formData.price) || 0
  );
  
  const safeShippingCost = $derived(
    typeof formData.shipping_cost === 'number' ? formData.shipping_cost : parseFloat(formData.shipping_cost) || 0
  );
  
  function showError(field: string): boolean {
    return touched[field] && !!errors[field];
  }

  // Premium boost feature visibility
  const canUsePremiumBoost = $derived(
    profile?.subscription_tier === 'premium' || 
    (profile?.premium_boosts_remaining ?? 0) > 0
  );

  const boostEmoji = $derived(
    formData.use_premium_boost ? '🚀' : '✨'
  );
</script>

<div class="space-y-4">
  <!-- Price Input with Suggestions -->
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
    
    {#if priceSuggestion?.suggested}
      <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="text-lg">💡</span>
          <div class="text-sm">
            <p class="font-medium text-blue-900">
              Suggested: ${priceSuggestion.suggested.toFixed(2)}
            </p>
            {#if priceSuggestion.range}
              <p class="text-blue-700 text-xs">
                Similar items: ${priceSuggestion.range.min} - ${priceSuggestion.range.max}
              </p>
            {/if}
            <p class="text-xs text-blue-600 mt-1">
              Confidence: {priceSuggestion.confidence}
            </p>
          </div>
        </div>
      </div>
    {/if}
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
    <p class="text-xs text-gray-500 mt-1">
      💡 Free shipping attracts more buyers
    </p>
  </div>
  
  <!-- Tags -->
  <div>
    <TagInput
      bind:tags={formData.tags}
      label="Tags (optional)"
      placeholder="Add tags like 'vintage', 'y2k', 'streetwear'..."
      maxTags={5}
    />
    <p class="text-xs text-gray-500 mt-1">
      🏷️ Tags help buyers find your item
    </p>
  </div>
  
  <!-- Premium Boost Option -->
  {#if canUsePremiumBoost}
    <div class="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={formData.use_premium_boost}
          name="use_premium_boost"
          class="mt-1 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{boostEmoji}</span>
            <span class="font-semibold text-purple-900">Premium Boost</span>
            {#if profile?.subscription_tier !== 'premium' && profile?.premium_boosts_remaining}
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {profile.premium_boosts_remaining} left
              </span>
            {/if}
          </div>
          <p class="text-sm text-purple-700 mt-1">
            Get 3x more visibility for 7 days
          </p>
          <ul class="text-xs text-purple-600 mt-2 space-y-1">
            <li>✅ Featured in search results</li>
            <li>✅ Homepage spotlight</li>
            <li>✅ Push notifications to followers</li>
          </ul>
        </div>
      </label>
    </div>
  {/if}
  
  <!-- Pricing Summary -->
  <div class="bg-gray-50 rounded-lg p-4">
    <h4 class="font-medium text-gray-900 mb-3">Pricing Summary</h4>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-600">Item Price</span>
        <span class="font-medium">${safePrice.toFixed(2)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Shipping</span>
        <span class="font-medium">
          {#if formData.shipping_cost === 0}
            <span class="text-green-600">FREE</span>
          {:else}
            ${safeShippingCost.toFixed(2)}
          {/if}
        </span>
      </div>
      <div class="pt-2 border-t border-gray-200">
        <div class="flex justify-between">
          <span class="font-medium text-gray-900">Buyer Pays</span>
          <span class="font-bold text-lg">
            ${(safePrice + safeShippingCost).toFixed(2)}
          </span>
        </div>
      </div>
      <div class="pt-2">
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">Platform fee (10%)</span>
          <span class="text-gray-500">-${(safePrice * 0.1).toFixed(2)}</span>
        </div>
        <div class="flex justify-between font-medium mt-1">
          <span class="text-gray-700">You'll earn</span>
          <span class="text-green-600">${(safePrice * 0.9).toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
</div>