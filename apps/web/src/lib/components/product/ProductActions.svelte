<script lang="ts">
  import { shareProduct } from './product-utils';
  import { BUTTON_STYLES, COLORS } from './product-constants';
  import * as i18n from '@repo/i18n';

  interface Props {
    isFavorited: boolean;
    isLiking: boolean;
    viewCount: number;
    user: any;
    productId: string;
    showShareMenu: boolean;
    onFavorite: () => void;
    onMessage: () => void;
    onShare: () => void;
    onBuyNow: () => void;
    isProductSold?: boolean;
  }

  let { 
    isFavorited, 
    isLiking, 
    viewCount, 
    user, 
    productId,
    showShareMenu,
    onFavorite, 
    onMessage, 
    onShare,
    onBuyNow,
    isProductSold = false
  }: Props = $props();

  async function handleFavorite() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onFavorite();
  }

  function handleMessage() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    onMessage();
  }

  function handleShare() {
    onShare();
  }
</script>

<!-- Modern Action Bar -->
<div class="px-4 py-3">
  <!-- Clean Action Row -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-4">
      <!-- Like Button - 36px touch target -->
      <button 
        onclick={handleFavorite}
        disabled={!user || isLiking}
        class="min-w-[36px] min-h-[36px] flex items-center justify-center {isLiking ? 'opacity-50' : ''}"
        aria-label="{isFavorited ? i18n.product_favorite() : i18n.product_addToFavorites()}"
      >
        <svg 
          class="w-6 h-6 {isFavorited ? 'text-red-500' : 'text-gray-700'}" 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          stroke-width="{isFavorited ? '0' : '2'}"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
        </svg>
      </button>
      
      <!-- Message Button - 36px touch target -->
      <button 
        onclick={handleMessage} 
        class="min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label="{i18n.product_message()}"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
        </svg>
      </button>
      
      <!-- Share Button - 36px touch target -->
      <button 
        onclick={handleShare} 
        class="min-w-[36px] min-h-[36px] flex items-center justify-center relative"
        aria-label="{i18n.product_share()}"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
        </svg>
        {#if showShareMenu}
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
            {i18n.product_copyLink()}
            <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        {/if}
      </button>
    </div>
  </div>
  
  <!-- View Count -->
  {#if viewCount > 0}
    <p class="text-sm font-medium text-gray-700">
      {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
    </p>
  {/if}
</div>