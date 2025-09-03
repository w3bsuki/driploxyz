<script lang="ts">
  interface Props {
    price: number
    currency?: string
    isSold?: boolean
    isOwner?: boolean
    isAuthenticated?: boolean
    isFavorited?: boolean
    isProcessing?: boolean
    productTitle?: string
    productImage?: string
    onBuyNow?: () => void
    onMessage?: () => void
    onFavorite?: () => void
    onMakeOffer?: () => void
  }

  let { 
    price,
    currency = 'EUR',
    isSold = false,
    isOwner = false,
    isAuthenticated = false,
    isFavorited = false,
    isProcessing = false,
    productTitle,
    productImage,
    onBuyNow,
    onMessage,
    onFavorite,
    onMakeOffer
  }: Props = $props()

  const formattedPrice = $derived(
    !price || price <= 0 
      ? '€0' 
      : new Intl.NumberFormat('bg-BG', {
          style: 'currency',
          currency: currency || 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(price)
  );
</script>

{#if !isOwner}
  <div class="action-bar">
    <!-- Product Preview Section -->
    {#if productTitle || productImage}
      <div class="product-preview-section">
        <div class="product-preview-card">
          {#if productImage}
            <div class="product-preview-image">
              <img 
                src={productImage} 
                alt={productTitle || 'Product'}
                class="preview-image"
              />
            </div>
          {/if}
          <div class="product-preview-info">
            {#if productTitle}
              <h3 class="product-preview-title">{productTitle}</h3>
            {/if}
            <p class="product-preview-price">{formattedPrice}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <div class="action-bar-content">
      <!-- Favorite Button -->
      <button
        class="favorite-btn {isFavorited ? 'favorited' : ''} {isProcessing ? 'processing' : ''}"
        onclick={onFavorite}
        disabled={isProcessing}
        type="button"
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg 
          class="favorite-icon" 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Message Button -->
      <button
        class="message-btn {isProcessing ? 'processing' : ''}"
        onclick={onMessage}
        disabled={isProcessing}
        type="button"
      >
        <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L5 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
        Message
      </button>

      <!-- Primary Action -->
      {#if isSold}
        <div class="sold-btn">
          SOLD OUT
        </div>
      {:else}
        <button
          class="buy-btn {isProcessing ? 'processing' : ''}"
          onclick={onBuyNow}
          disabled={isProcessing}
          type="button"
        >
          {isProcessing ? 'Processing...' : `Buy Now • ${formattedPrice}`}
        </button>
      {/if}
    </div>

    <!-- Make Offer Option -->
    {#if !isSold && onMakeOffer}
      <div class="offer-section">
        <button
          class="offer-btn {isProcessing ? 'processing' : ''}"
          onclick={onMakeOffer}
          disabled={isProcessing}
          type="button"
        >
          Make an Offer
        </button>
      </div>
    {/if}
  </div>

  <!-- Safe area spacer -->
  <div class="action-bar-spacer"></div>
{/if}

<style>
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--surface-base);
    border-top: 1px solid var(--border-subtle);
    z-index: var(--z-50);
    padding: var(--space-4);
    padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
  }

  .product-preview-section {
    max-width: 28rem;
    margin: 0 auto var(--space-3) auto;
  }

  .product-preview-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
  }

  .product-preview-image {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-preview-info {
    flex: 1;
    min-width: 0;
  }

  .product-preview-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--space-1) 0;
    line-height: var(--leading-tight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-preview-price {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--primary);
    margin: 0;
  }

  @media (max-width: 480px) {
    .product-preview-card {
      gap: var(--space-2);
      padding: var(--space-2);
    }
    
    .product-preview-image {
      width: 40px;
      height: 40px;
    }
    
    .product-preview-title {
      font-size: var(--text-xs);
    }
    
    .product-preview-price {
      font-size: var(--text-base);
    }
  }
  
  .action-bar-content {
    display: flex;
    max-width: 28rem; /* 448px - md breakpoint */
    margin-left: auto;
    margin-right: auto;
    gap: var(--space-3);
  }
  
  .favorite-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: var(--surface-base);
    border: 2px solid var(--border-default);
    border-radius: var(--radius-xl);
    transition: border-color var(--duration-fast);
    width: var(--touch-icon);
    height: var(--touch-icon);
    cursor: pointer;
  }

  .favorite-btn:hover {
    border-color: var(--border-emphasis);
  }

  .favorite-btn:focus {
    outline: none;
    border-color: var(--state-focus);
  }
  
  .favorite-btn.favorited {
    background-color: var(--status-error-bg);
    border-color: var(--status-error-border);
  }
  
  .favorite-btn.processing {
    opacity: 0.5;
  }
  
  .favorite-icon {
    color: var(--text-muted);
    width: 1.5rem;
    height: 1.5rem;
    transition: color var(--duration-fast);
  }
  
  .favorite-btn.favorited .favorite-icon {
    color: var(--status-error-solid);
  }
  
  .favorite-btn:hover .favorite-icon {
    color: var(--text-secondary);
  }
  
  .message-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: var(--surface-base);
    border: 2px solid var(--border-default);
    color: var(--text-primary);
    border-radius: var(--radius-xl);
    font-weight: var(--font-semibold);
    transition: border-color var(--duration-fast);
    height: var(--touch-standard);
    padding: 0 var(--space-4);
    cursor: pointer;
  }

  .message-btn:hover {
    border-color: var(--border-emphasis);
  }

  .message-btn:focus {
    outline: none;
    border-color: var(--state-focus);
  }
  
  .message-btn.processing {
    opacity: 0.5;
  }
  
  .message-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: var(--space-2);
  }
  
  .sold-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--surface-muted);
    color: var(--text-disabled);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    font-weight: var(--font-bold);
    height: var(--touch-primary);
  }
  
  .buy-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--primary);
    color: var(--primary-fg);
    border: none;
    border-radius: var(--radius-xl);
    font-weight: var(--font-bold);
    transition: background-color var(--duration-fast);
    height: var(--touch-primary);
    cursor: pointer;
  }

  .buy-btn:hover {
    background-color: var(--primary-600);
  }

  .buy-btn:focus {
    outline: none;
    background-color: var(--primary-700);
  }
  
  .buy-btn.processing {
    opacity: 0.5;
  }
  
  .offer-section {
    text-align: center;
    margin-top: var(--space-3);
  }
  
  .offer-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: color var(--duration-fast);
    cursor: pointer;
  }

  .offer-btn:hover {
    color: var(--text-primary);
  }

  .offer-btn:focus {
    outline: none;
    color: var(--text-primary);
  }
  
  .offer-btn.processing {
    opacity: 0.5;
  }
  
  .action-bar-spacer {
    height: var(--space-20);
  }
</style>