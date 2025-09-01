<script lang="ts">
  import { getConditionLabel, getCategoryTranslation } from './product-utils';
  import { formatPrice } from '$lib/utils/price';
  import * as i18n from '@repo/i18n';

  interface Props {
    product: any;
    showFullDescription?: boolean;
    onToggleDescription?: () => void;
  }

  let { product, showFullDescription = false, onToggleDescription }: Props = $props();

  let showSizeGuide = $state(false);
  let showShippingInfo = $state(false);

  const conditionLabel = $derived(getConditionLabel(product.condition));
  const categoryLabel = $derived(getCategoryTranslation(product.category_name));
  
  const truncatedDescription = $derived(
    !product.description ? '' :
    product.description.length > 120 && !showFullDescription 
      ? product.description.slice(0, 120) + '...'
      : product.description
  );

  const discountPercentage = $derived(
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0
  );
</script>

<!-- Product Info -->
<div class="px-4 py-3">
  
  <!-- Price and Title -->
  <div class="mb-3">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
      {#if product.original_price && product.original_price > product.price}
        <div class="text-right">
          <span class="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</span>
          <span class="text-xs text-green-600 font-medium block">
            {discountPercentage}% off
          </span>
        </div>
      {/if}
    </div>
    
    <h1 class="text-base font-medium text-gray-900 leading-tight">{product.title}</h1>
    
    {#if product.brand || product.category_name}
      <div class="text-sm text-gray-600 mt-1">
        {#if product.brand}<span class="font-medium">{product.brand}</span>{/if}
        {#if product.brand && product.category_name} • {/if}
        {#if product.category_name}{categoryLabel}{/if}
      </div>
    {/if}
  </div>

  <!-- Size and Condition -->
  <div class="flex gap-6 mb-3">
    <div class="flex-1">
      <div class="text-xs text-gray-500 mb-1">Size</div>
      <div class="text-sm font-medium text-gray-900">{product.size || 'One Size'}</div>
    </div>
    <div class="flex-1">
      <div class="text-xs text-gray-500 mb-1">Condition</div>
      <div class="text-sm font-medium text-gray-900">{conditionLabel}</div>
    </div>
  </div>

  <!-- Description -->
  {#if product.description}
    <div class="mb-4">
      <div class="text-sm text-gray-600 leading-relaxed">
        <p>{truncatedDescription}</p>
      </div>
      {#if product.description.length > 120}
        <button 
          onclick={onToggleDescription}
          class="link font-medium mt-2 text-sm"
        >
          {showFullDescription ? 'Show less' : 'Read more'}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Protection -->
  <div class="border-t border-gray-200 pt-4">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
      <span class="text-sm font-medium text-gray-900">Driplo Protection</span>
    </div>
    <p class="text-xs text-gray-600">Secure payments • Money-back guarantee • Dispute resolution</p>
  </div>
</div>

<!-- Size Guide Modal -->
{#if showSizeGuide}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 text-lg">{i18n.product_sizeGuide()}</h3>
        <button 
          onclick={() => showSizeGuide = false}
          class="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="{i18n.product_close()}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="p-4 text-center text-gray-600">
        <p class="mb-4">{i18n.product_sizeGuideComingSoon()}</p>
        <p class="text-sm">{i18n.product_sizingQuestions()}</p>
      </div>
    </div>
  </div>
{/if}

<!-- Shipping Info Modal -->
{#if showShippingInfo}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-auto">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 text-lg">{i18n.product_driploProtection()}</h3>
        <button 
          onclick={() => showShippingInfo = false}
          class="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="{i18n.product_close()}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="p-4 space-y-4 text-sm">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-medium text-blue-700 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            {i18n.product_driploProtection()}
          </h4>
          <p class="text-blue-700 text-sm">All purchases are protected by Driplo. Your money is secure until you confirm receipt.</p>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-2">{i18n.product_securePayments()}</h4>
          <p class="text-gray-600">Your payment information is encrypted and secure. We support all major payment methods.</p>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-2">{i18n.product_returnPolicy()}</h4>
          <p class="text-gray-600">{i18n.product_originalCondition()}</p>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-2">{i18n.product_disputeResolution()}</h4>
          <p class="text-gray-600">If there's an issue with your order, our support team will help resolve it quickly.</p>
        </div>
      </div>
    </div>
  </div>
{/if}