<script lang="ts">
  import { formatPrice } from '$lib/utils/price';
  import { BUTTON_STYLES } from './product-constants';
  import * as i18n from '@repo/i18n';

  interface Props {
    product: any;
    user: any;
    onMakeOffer: () => void;
    onBuyNow: () => void;
  }

  let { product, user, onMakeOffer, onBuyNow }: Props = $props();

  function handleMakeOffer() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onMakeOffer();
  }

  function handleBuyNow() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onBuyNow();
  }
</script>

<!-- Modern Ecommerce Action Bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom shadow-2xl">
  <div class="max-w-md mx-auto px-4 py-4">
    {#if !product.is_sold && product.seller_id !== user?.id}
      <div>
        <!-- Price Display -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {#if product.original_price && product.original_price > product.price}
              <div class="flex items-center gap-2">
                <span class="text-lg text-gray-400 line-through font-medium">{formatPrice(product.original_price)}</span>
                <span class="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-semibold border border-green-200">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% {i18n.product_save()}
                </span>
              </div>
            {/if}
          </div>
          <div class="text-right">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
        </div>

        <!-- Primary Action Buttons -->
        <div class="flex gap-3">
          <button 
            onclick={handleMakeOffer}
            class="flex-1 min-h-[44px] bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12s-1.536-.219-2.121-.659c-1.172-.879-1.172-2.303 0-3.182C10.464 7.781 11.232 8 12 8s1.536.219 2.121.659"/>
            </svg>
            {i18n.product_makeOffer()}
          </button>
          <button 
            onclick={handleBuyNow}
            class="flex-[2] min-h-[44px] bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            {i18n.product_buyNow()}
          </button>
        </div>
      </div>
    {:else if product.is_sold}
      <div class="text-center">
        <button 
          disabled
          class="w-full min-h-[44px] bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75"/>
          </svg>
          {i18n.product_soldOut()}
        </button>
        <p class="text-sm text-gray-600 mt-2">{i18n.product_itemSold()}</p>
      </div>
    {:else if product.seller_id === user?.id}
      <div class="text-center">
        <p class="text-lg font-medium text-gray-700 mb-3">{i18n.product_yourListing()}</p>
        <div class="flex gap-3">
          <button class="flex-1 min-h-[44px] bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            {i18n.product_editListing()}
          </button>
          <button class="flex-1 min-h-[44px] bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            {i18n.product_viewAnalytics()}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>