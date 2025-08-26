<script lang="ts">
  import { PriceInput, TagInput } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  
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
      label={i18n.sell_priceLabel()}
      error={showError('price') ? errors.price : ''}
      required
      suggestion={priceSuggestion}
      onchange={() => onFieldChange('price', formData.price)}
      name="price"
    />
    
    {#if priceSuggestion?.suggested}
      <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="text-sm">
          <p class="font-medium text-blue-900">
            {i18n.sell_suggested()}: {i18n.currency_symbol()}{priceSuggestion.suggested.toFixed(2)}
          </p>
          {#if priceSuggestion.range}
            <p class="text-blue-700 text-xs mt-1">
              {i18n.sell_similarItems()}: {i18n.currency_symbol()}{priceSuggestion.range.min} - {i18n.currency_symbol()}{priceSuggestion.range.max}
            </p>
          {/if}
          <p class="text-xs text-blue-600 mt-1">
            {i18n.sell_confidence()}: {priceSuggestion.confidence}
          </p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Shipping Cost -->
  <div>
    <PriceInput
      bind:value={formData.shipping_cost}
      label={i18n.sell_shippingCostLabel()}
      error={showError('shipping_cost') ? errors.shipping_cost : ''}
      placeholder="0.00"
      name="shipping_cost"
      onchange={() => onFieldChange('shipping_cost', formData.shipping_cost)}
    />
    <p class="text-xs text-gray-500 mt-1">
      {i18n.sell_freeShippingAttractsBuyers()}
    </p>
  </div>
  
  <!-- Tags -->
  <div>
    <TagInput
      bind:tags={formData.tags}
      label={i18n.sell_tagsOptional()}
      placeholder={i18n.sell_tagsPlaceholder()}
      maxTags={5}
    />
    <p class="text-xs text-gray-500 mt-1">
      {i18n.sell_tagsHelp()}
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
            <span class="font-semibold text-purple-900">{i18n.sell_premiumBoost()}</span>
            {#if profile?.subscription_tier !== 'premium' && profile?.premium_boosts_remaining}
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {profile.premium_boosts_remaining} {i18n.sell_premiumLeft()}
              </span>
            {/if}
          </div>
          <p class="text-sm text-purple-700 mt-1">
            {i18n.sell_getVisibility()}
          </p>
          <ul class="text-xs text-purple-600 mt-2 space-y-1">
            <li>• {i18n.sell_featuredSearch()}</li>
            <li>• {i18n.sell_homepageSpotlight()}</li>
            <li>• {i18n.sell_pushNotifications()}</li>
          </ul>
        </div>
      </label>
    </div>
  {/if}
  
  <!-- Pricing Summary - Cleaner Design -->
  <div class="bg-white border border-gray-200 rounded-lg">
    <div class="px-4 py-3 border-b border-gray-100">
      <h4 class="text-sm font-medium text-gray-900">{i18n.sell_estimatedEarnings()}</h4>
    </div>
    <div class="p-4 space-y-3">
      <!-- Item pricing -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{i18n.sell_listingPrice()}</span>
          <span class="font-medium">{i18n.currency_symbol()}{safePrice.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{i18n.sell_shippingCost()}</span>
          <span class="font-medium">
            {#if formData.shipping_cost === 0}
              <span class="text-green-600">{i18n.sell_free()}</span>
            {:else}
              {i18n.currency_symbol()}{safeShippingCost.toFixed(2)}
            {/if}
          </span>
        </div>
      </div>
      
      <!-- Total -->
      <div class="pt-3 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-900">{i18n.sell_totalBuyerPays()}</span>
          <span class="text-lg font-bold text-gray-900">
            {i18n.currency_symbol()}{(safePrice + safeShippingCost).toFixed(2)}
          </span>
        </div>
      </div>
      
      <!-- Earnings breakdown -->
      <div class="pt-3 border-t border-gray-100 space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">{i18n.sell_driploFee()} (10%)</span>
          <span class="text-gray-500">-{i18n.currency_symbol()}{(safePrice * 0.1).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700">{i18n.sell_yourEarnings()}</span>
          <span class="text-base font-semibold text-green-600">{i18n.currency_symbol()}{(safePrice * 0.9).toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
</div>