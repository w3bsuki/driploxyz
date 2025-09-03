<script lang="ts">
  import Button from './Button.svelte';
  import { getLocale, buyNow, message, soldOut, makeOffer, addFavorite, removeFavorite } from '@repo/i18n';

  interface Props {
    price: number
    isSold?: boolean
    isOwner?: boolean
    isFavorited?: boolean
    productTitle?: string
    productImage?: string
    onBuyNow?: () => void
    onMessage?: () => void
    onFavorite?: () => void
    onMakeOffer?: () => void
  }

  let { 
    price,
    isSold = false,
    isOwner = false,
    isFavorited = false,
    productTitle,
    productImage,
    onBuyNow,
    onMessage,
    onFavorite,
    onMakeOffer
  }: Props = $props()

  let showSheet = $state(false);

  const formattedPrice = $derived.by(() => {
    if (!price || price <= 0) return '€0';
    
    const locale = getLocale();
    
    if (locale === 'bg') {
      const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
      return `${roundedPrice}лв`;
    }
    
    if (locale === 'en') {
      try {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: price % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        }).format(price);
      } catch {
        return `£${price}`;
      }
    }
    
    return `€${price}`;
  });

  function openSheet() {
    showSheet = true;
  }

  function closeSheet() {
    showSheet = false;
  }

  function handleBuy() {
    onBuyNow?.();
    closeSheet();
  }

  function handleOffer() {
    onMakeOffer?.();
    closeSheet();
  }
</script>

{#if !isOwner}
  <div class="action-bar">
    <div class="actions">
      <!-- Favorite -->
      <button
        class="fav-btn {isFavorited ? 'active' : ''}" 
        onclick={onFavorite}
        aria-label={isFavorited ? removeFavorite() : addFavorite()}
      >
        <svg class="heart" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Message -->
      <Button variant="outline" onclick={onMessage}>
        <svg class="icon" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-width="2" d="M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L5 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
        {message()}
      </Button>

      <!-- Buy Now -->
      {#if isSold}
        <Button variant="secondary" disabled class="flex-1">
          {soldOut()}
        </Button>
      {:else}
        <button class="buy-btn" onclick={openSheet}>
          {buyNow()} • {formattedPrice}
        </button>
      {/if}
    </div>
  </div>

  <!-- Bottom Sheet -->
  {#if showSheet}
    <div class="sheet-backdrop" onclick={closeSheet}></div>
    <div class="sheet" class:open={showSheet}>
      <div class="handle"></div>
      
      {#if productTitle || productImage}
        <div class="product-preview">
          {#if productImage}
            <img src={productImage} alt={productTitle || 'Product'} class="preview-img" />
          {/if}
          <div class="preview-info">
            {#if productTitle}
              <h3 class="preview-title">{productTitle}</h3>
            {/if}
            <p class="preview-price">{formattedPrice}</p>
          </div>
        </div>
      {/if}

      <div class="sheet-actions">
        <Button variant="primary" size="lg" onclick={handleBuy} class="w-full">
          {buyNow()} • {formattedPrice}
        </Button>
        
        {#if onMakeOffer}
          <Button variant="outline" size="lg" onclick={handleOffer} class="w-full">
            {makeOffer()}
          </Button>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-base);
    border-top: 1px solid var(--border-subtle);
    padding: var(--space-4);
    padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
    z-index: 50;
  }

  .actions {
    display: flex;
    gap: var(--space-3);
    max-width: 28rem;
    margin: 0 auto;
  }

  .fav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 2px solid var(--border-default);
    border-radius: 12px;
    background: var(--surface-base);
    color: var(--text-muted);
    transition: all 0.2s;
    cursor: pointer;
  }

  .fav-btn:hover {
    border-color: var(--border-emphasis);
    color: var(--text-secondary);
  }

  .fav-btn.active {
    background: var(--status-error-bg);
    border-color: var(--status-error-border);
    color: var(--status-error-solid);
  }

  .heart {
    width: 20px;
    height: 20px;
  }

  :global(.actions .icon) {
    width: 18px;
    height: 18px;
    margin-right: var(--space-1);
  }

  .buy-btn {
    flex: 1;
    height: 40px;
    background: var(--primary);
    color: var(--primary-fg);
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .buy-btn:hover {
    background: var(--primary-hover);
  }

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-base);
    border-radius: 24px 24px 0 0;
    padding: var(--space-6);
    padding-bottom: max(var(--space-6), env(safe-area-inset-bottom));
    z-index: 101;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .sheet.open {
    transform: translateY(0);
  }

  .handle {
    width: 40px;
    height: 4px;
    background: var(--border-default);
    border-radius: 2px;
    margin: 0 auto var(--space-6) auto;
  }

  .product-preview {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--surface-subtle);
    border-radius: 16px;
  }

  .preview-img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
  }

  .preview-info {
    flex: 1;
  }

  .preview-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1) 0;
  }

  .preview-price {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--primary);
    margin: 0;
  }

  .sheet-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  @media (max-width: 640px) {
    .action-bar {
      padding: var(--space-3);
    }
    
    .sheet {
      padding: var(--space-5);
    }
  }
</style>