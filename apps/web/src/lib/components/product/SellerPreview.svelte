<script lang="ts">
  import { Avatar } from '@repo/ui';
  import { formatPrice } from '$lib/utils/price';
  import { getRelativeTime } from './product-utils';
  import { BUTTON_STYLES } from './product-constants';
  import * as i18n from '@repo/i18n';

  interface SellerProduct {
    id: string;
    title: string;
    price: number;
    images: string[];
    created_at: string;
    is_sold: boolean;
  }

  interface Props {
    seller: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
      rating?: number;
      total_sales?: number;
      response_rate?: number;
      avg_ship_time?: number;
      join_date?: string;
    };
    recentProducts: SellerProduct[];
    isOpen: boolean;
    onClose: () => void;
    onViewProfile: () => void;
    onMessageSeller: () => void;
  }

  let { seller, recentProducts, isOpen, onClose, onViewProfile, onMessageSeller }: Props = $props();

  // Close on backdrop click
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Close on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="seller-preview-title"
  >
    <!-- Modal Content -->
    <div class="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Avatar 
            src={seller.avatar}
            alt={seller.name}
            size="md"
            fallback={seller.name?.[0]?.toUpperCase() || 'S'}
          />
          <div>
            <h3 id="seller-preview-title" class="font-semibold text-gray-900">{seller.name}</h3>
            <p class="text-sm text-gray-500">@{seller.username}</p>
          </div>
        </div>
        <button 
          onclick={onClose}
          class="{BUTTON_STYLES.iconCompact} text-gray-400 hover:text-gray-600"
          aria-label="{i18n.product_close()}"
        >
          <svg class="{BUTTON_STYLES.iconSize.medium}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Stats -->
      <div class="p-4 bg-gray-50">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-lg font-semibold text-gray-900">{seller.total_sales || 0}</p>
            <p class="text-xs text-gray-500">{i18n.product_sales()}</p>
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900">{seller.response_rate || 95}%</p>
            <p class="text-xs text-gray-500">{i18n.product_response()}</p>
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900">{seller.avg_ship_time || 2}d</p>
            <p class="text-xs text-gray-500">{i18n.product_shipsIn()}</p>
          </div>
        </div>
        
        {#if seller.rating && seller.rating >= 4.0}
          <div class="flex items-center justify-center mt-3 gap-2">
            <div class="flex items-center gap-1">
              {#each Array(5) as _, i}
                <svg 
                  class="w-4 h-4 {i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-200'}" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              {/each}
            </div>
            <span class="text-sm text-gray-600">{seller.rating.toFixed(1)}</span>
          </div>
        {/if}
      </div>

      <!-- Recent Products -->
      <div class="p-4">
        <h4 class="font-semibold text-gray-900 mb-3">{i18n.product_recentItems()}</h4>
        <div class="space-y-3 max-h-60 overflow-y-auto">
          {#each recentProducts.slice(0, 4) as product}
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {#if product.images?.[0]}
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
                  {#if product.is_sold}
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{i18n.product_sold()}</span>
                  {/if}
                </div>
              </div>
              <span class="text-xs text-gray-400">{getRelativeTime(product.created_at)}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onclick={onMessageSeller}
          class="flex-1 {BUTTON_STYLES.secondary}"
        >
          {i18n.product_message()}
        </button>
        <button 
          onclick={onViewProfile}
          class="flex-1 {BUTTON_STYLES.primaryOutline}"
        >
          {i18n.product_viewProfile()}
        </button>
      </div>
    </div>
  </div>
{/if}