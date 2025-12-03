<script lang="ts">
  import * as m from '@repo/i18n';
  import ConditionBadge from '../../primitives/badge/ConditionBadge.svelte';

  interface Seller {
    username?: string;
    avatar_url?: string;
    rating?: number;
    full_name?: string;
  }

  interface Props {
    price?: number;
    currency?: string;
    isOwner?: boolean;
    isSold?: boolean;
    onBuyNow?: () => void;
    onMessage?: () => void;
    onMakeOffer?: () => void;
    className?: string;
    // New props for compact layout
    seller?: Seller;
    productTitle?: string;
    productDescription?: string;
    showSellerInfo?: boolean;
    condition?: string;
  }

  let {
    price,
    currency = '€',
    isOwner = false,
    isSold = false,
    onBuyNow,
    onMessage,
    onMakeOffer,
    className = '',
    seller,
    productTitle,
    productDescription,
    showSellerInfo = true,
    condition
  }: Props = $props();

  // State for loading actions
  let isLoading = $state(false);
  let loadingAction = $state<string | null>(null);

  async function handleAction(action: string, handler?: () => void | Promise<void>) {
    if (!handler || isLoading) return;
    
    try {
      isLoading = true;
      loadingAction = action;
      await handler();
    } catch (error) {
      
    } finally {
      isLoading = false;
      loadingAction = null;
    }
  }

  const canBuy = $derived(!isOwner && !isSold);
  const canMessage = $derived(!isOwner);
  const canMakeOffer = $derived(!isOwner && !isSold && onMakeOffer);

  // Truncate text helper
  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  }
</script>

<!-- Compact bottom sheet with seller info and action buttons -->
<div class={[className, { 'opacity-75': isLoading }]}>
{#if showSellerInfo && (seller || productTitle)}
    <!-- Seller Info Section -->
    <div class="bg-white/95 backdrop-blur-sm p-4 mb-2">
      <div class="flex gap-4">
        <!-- Product Thumbnail -->
        {#if seller?.avatar_url}
          <img 
            src={seller.avatar_url} 
            alt={seller.full_name || seller.username || 'Seller'}
            class="w-20 h-20 rounded-lg object-cover bg-(--gray-100) shrink-0"
            loading="lazy"
          />
        {:else}
          <div class="w-20 h-20 rounded-lg bg-(--gray-200) flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-(--gray-500)" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
        {/if}

        <!-- Info Column -->
        <div class="flex flex-col justify-center min-w-0 flex-1 gap-1">
          <!-- Condition Badge -->
          {#if condition}
            <div class="flex mb-1">
              <ConditionBadge {condition} />
            </div>
          {/if}

          <!-- Title -->
          {#if productTitle}
            <h3 class="text-base font-bold text-(--gray-900) leading-tight truncate pr-16 mb-1">
              {productTitle}
            </h3>
          {/if}

          <!-- Seller -->
          <div class="flex items-center gap-2 text-sm text-(--gray-600)">
            <span class="truncate font-medium">
              {seller?.full_name || seller?.username || 'Seller'}
            </span>
            {#if seller?.rating}
              <div class="flex items-center gap-1 text-(--gray-500)">
                <span>•</span>
                <svg class="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{seller.rating.toFixed(1)}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Action Buttons Row -->
  <div class="px-4 pb-4">
    {#if isSold}
      <!-- Sold State -->
      <div class="flex items-center justify-center gap-2.5 w-full h-11 px-4 
                  bg-[color:var(--status-success-bg)] 
                  border border-[color:var(--status-success-border)] 
                  text-[color:var(--status-success-text)] 
                  font-semibold rounded-lg shadow-xs" 
           role="status" 
           aria-label="Item sold">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
        <span class="text-sm font-semibold">{m.pdp_sold()}</span>
      </div>
    {:else if isOwner}
      <!-- Owner State -->
      <div class="flex items-center justify-center gap-2.5 w-full h-11 px-4 
                  bg-[color:var(--color-surface-subtle)] 
                  border border-[color:var(--color-border-default)] 
                  text-[color:var(--color-text-secondary)] 
                  font-semibold rounded-lg shadow-xs" 
           role="status" 
           aria-label="Your item">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
        </svg>
        <span class="text-sm font-semibold">{m.pdp_yourItem()}</span>
      </div>
    {:else}
      <!-- Active Actions Row -->
      <div class="flex gap-3">
        <!-- Message Button -->
        <button 
          type="button" 
          class="group relative flex items-center justify-center gap-2.5 h-11 px-5 
                 bg-[color:var(--color-surface-base)] 
                 border border-[color:var(--color-border-default)] 
                 text-[color:var(--color-text-secondary)] 
                 rounded-lg font-medium
                 hover:bg-[color:var(--color-surface-subtle)] hover:border-[color:var(--color-border-emphasis)] hover:text-[color:var(--color-text-primary)]
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1 focus:bg-[color:var(--color-surface-subtle)]
                 active:scale-95 active:bg-[color:var(--color-surface-muted)]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-[--duration-fast] ease-[--ease-out]
                 shadow-xs hover:shadow-sm"
          onclick={() => handleAction('message', onMessage)}
          disabled={!canMessage || isLoading}
          aria-label={m.pdp_messageSeller()}
        >
          {#if loadingAction === 'message'}
            <div class="w-4 h-4 border-2 border-[color:var(--color-text-muted)] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
          {:else}
            <svg class="w-4 h-4 transition-transform duration-[--duration-fast] group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
            </svg>
          {/if}
          <span class="text-sm font-medium">{m.message()}</span>
        </button>
        
        <!-- Buy Button -->
        <button 
          type="button" 
          class="group relative flex-1 flex items-center justify-center gap-2.5 h-11 px-6
                 bg-[color:var(--primary)] 
                 text-[color:var(--primary-fg)] 
                 rounded-lg font-semibold
                 hover:bg-[color:var(--primary-600)] hover:shadow-md
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-2
                 active:scale-95 active:bg-[color:var(--primary-700)]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-[--duration-fast] ease-[--ease-out]
                 shadow-sm"
          onclick={() => handleAction('buy', onBuyNow)}
          disabled={!canBuy || isLoading}
          aria-label={m.pdp_buyNow() + ` ${currency}${price}`}
        >
          {#if loadingAction === 'buy'}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
          {:else}
            <svg class="w-4 h-4 transition-transform duration-[--duration-fast] group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          {/if}
          <span class="text-sm font-semibold tracking-wide">
            {#if typeof price === 'number'}
              {m.buyNow()} • {currency}{price}
            {:else}
              {m.pdp_buyNow()}
            {/if}
          </span>
        </button>
      </div>
    {/if}
  </div>
</div>
