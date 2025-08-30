<script lang="ts">
  import { getRelativeTime, getConditionLabel, getCategoryTranslation, formatHashtag } from './product-utils';
  import { COLORS, BUTTON_STYLES } from './product-constants';
  import { formatPrice } from '$lib/utils/price';
  import * as i18n from '@repo/i18n';

  interface Props {
    product: any;
  }

  let { product }: Props = $props();

  const conditionLabel = $derived(getConditionLabel(product.condition));
  let showFullDescription = $state(false);
  let showSizeGuide = $state(false);
  let showShippingInfo = $state(false);

  const truncatedDescription = $derived(
    !product.description ? '' :
    product.description.length > 100 && !showFullDescription 
      ? product.description.slice(0, 100) + '...'
      : product.description
  );
</script>

<div class="px-4 py-3 space-y-4">
  <!-- Product Title & Price -->
  <div class="space-y-2">
    <div class="flex items-start justify-between gap-3">
      <h1 class="text-xl font-bold text-gray-900 leading-tight flex-1">{product.title}</h1>
      <div class="text-right flex-shrink-0">
        <p class="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
        {#if product.original_price && product.original_price > product.price}
          <p class="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</p>
        {/if}
      </div>
    </div>
    
    <!-- Brand & Category -->
    <div class="flex items-center gap-2 text-sm text-gray-600">
      {#if product.brand}
        <span class="font-medium">{product.brand}</span>
        <span class="text-gray-300">•</span>
      {/if}
      <span>{getCategoryTranslation(product.category_name)}</span>
    </div>
  </div>

  <!-- Key Details -->
  <div class="grid grid-cols-2 gap-3 py-3 border-y border-gray-100">
    <!-- Size -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">{i18n.product_size()}</span>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-900">{product.size || i18n.product_oneSize()}</span>
        <button 
          onclick={() => showSizeGuide = true}
          class="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {i18n.product_sizeGuide()}
        </button>
      </div>
    </div>
    
    <!-- Condition -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">{i18n.product_condition()}</span>
      <span class="text-sm font-medium text-gray-900">{conditionLabel}</span>
    </div>
  </div>

  <!-- Description -->
  {#if product.description}
    <div class="space-y-2">
      <p class="text-sm text-gray-700 leading-relaxed">{truncatedDescription}</p>
      {#if product.description.length > 100}
        <button 
          onclick={() => showFullDescription = !showFullDescription}
          class="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {showFullDescription ? i18n.product_showLess() : i18n.product_readMore()}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Hashtags -->
  <div class="flex flex-wrap gap-1.5">
    {#if product.brand}
      <span class="{COLORS.hashtag} text-sm">#{formatHashtag(product.brand)}</span>
    {/if}
    {#if product.size}
      <span class="{COLORS.hashtag} text-sm">#{formatHashtag(product.size)}</span>
    {/if}
    <span class="{COLORS.hashtag} text-sm">#{formatHashtag(conditionLabel)}</span>
    <span class="{COLORS.hashtag} text-sm">#{formatHashtag(getCategoryTranslation(product.category_name))}</span>
    <span class="{COLORS.hashtag} text-sm">#vintage</span>
    <span class="{COLORS.hashtag} text-sm">#thrifted</span>
    <span class="{COLORS.hashtag} text-sm">#sustainable</span>
  </div>

  <!-- Driplo Protection & Returns -->
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-blue-100">
    <h3 class="font-semibold text-gray-900 text-sm flex items-center gap-2">
      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
      {i18n.product_driploProtection()}
    </h3>
    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-gray-700">{i18n.product_securePayments()}</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-gray-700">{i18n.product_moneyBackGuarantee()}</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-gray-700">{i18n.product_disputeResolution()}</span>
      </div>
    </div>
    <button 
      onclick={() => showShippingInfo = true}
      class="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {i18n.product_viewFullShipping()}
    </button>
  </div>

  <!-- Posted time -->
  <p class="text-xs text-gray-400">{i18n.product_postedTime()} {getRelativeTime(product.created_at)}</p>
</div>

<!-- Size Guide Modal -->
{#if showSizeGuide}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">{i18n.product_sizeGuide()}</h3>
        <button 
          onclick={() => showSizeGuide = false}
          class="{BUTTON_STYLES.iconCompact} text-gray-400"
          aria-label="{i18n.product_close()}"
        >
          <svg class="{BUTTON_STYLES.iconSize.small}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
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
        <h3 class="font-semibold text-gray-900">{i18n.product_driploProtection()}</h3>
        <button 
          onclick={() => showShippingInfo = false}
          class="{BUTTON_STYLES.iconCompact} text-gray-400"
          aria-label="{i18n.product_close()}"
        >
          <svg class="{BUTTON_STYLES.iconSize.small}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="p-4 space-y-4 text-sm">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            {i18n.product_driploProtection()}
          </h4>
          <p class="text-blue-800 text-sm">All purchases are protected by Driplo. Your money is secure until you confirm receipt.</p>
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