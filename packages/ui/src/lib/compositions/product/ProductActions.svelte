<script lang="ts">
  import * as m from '@repo/i18n';

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
    showSellerInfo = true
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
    <div class="bg-white/95 backdrop-blur-sm border-b border-[color:var(--gray-200)] p-4 mb-4">
      <!-- Grid layout so thumbnail matches text stack height (3 rows) -->
      <div class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto_auto] gap-x-3 gap-y-1 items-start">
        <!-- Product Thumbnail (row-span to match 3 lines) -->
        {#if seller?.avatar_url}
          <img 
            src={seller.avatar_url} 
            alt={seller.full_name || seller.username || 'Seller'}
            class="row-span-3 w-16 self-stretch rounded-md object-cover bg-[color:var(--gray-100)] border border-[color:var(--gray-200)]"
            loading="lazy"
          />
        {:else}
          <div class="row-span-3 w-16 self-stretch rounded-md bg-[color:var(--gray-200)] border border-[color:var(--gray-300)] flex items-center justify-center">
            <svg class="w-5 h-5 text-[color:var(--gray-500)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
        {/if}

        <!-- Row 1: Title (single line) -->
        {#if productTitle}
          <h3 class="col-start-2 row-start-1 text-sm font-semibold text-[color:var(--gray-900)] leading-tight truncate">
            {truncateText(productTitle, 60)}
          </h3>
        {/if}

        <!-- Row 2: Seller meta (single line) -->
        <div class="col-start-2 row-start-2 min-w-0 flex items-center gap-2">
          <span class="text-xs font-medium text-[color:var(--gray-700)] truncate">
            {seller?.full_name || seller?.username || 'Seller'}
          </span>
          {#if seller?.rating}
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-xs font-medium text-[color:var(--gray-600)]">{seller.rating.toFixed(1)}</span>
            </div>
          {/if}
        </div>

        <!-- Row 3: Description (single line) -->
        {#if productDescription}
          <p class="col-start-2 row-start-3 text-xs text-[color:var(--gray-600)] leading-relaxed truncate">
            {truncateText(productDescription, 80)}
          </p>
        {/if}
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
                  bg-[color:var(--surface-subtle)] 
                  border border-[color:var(--border-default)] 
                  text-[color:var(--text-secondary)] 
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
                 bg-[color:var(--surface-base)] 
                 border border-[color:var(--border-default)] 
                 text-[color:var(--text-secondary)] 
                 rounded-lg font-medium
                 hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-emphasis)] hover:text-[color:var(--text-primary)]
                 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1 focus:bg-[color:var(--surface-subtle)]
                 active:scale-95 active:bg-[color:var(--surface-muted)]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-[--duration-fast] ease-[--ease-out]
                 shadow-xs hover:shadow-sm"
          onclick={() => handleAction('message', onMessage)}
          disabled={!canMessage || isLoading}
          aria-label={m.pdp_messageSeller()}
        >
          {#if loadingAction === 'message'}
            <div class="w-4 h-4 border-2 border-[color:var(--text-muted)] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
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
