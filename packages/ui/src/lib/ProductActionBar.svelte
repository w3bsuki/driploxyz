<script lang="ts">
  import Button from './Button.svelte';
  import * as i18n from '@repo/i18n';

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

  const formattedPrice = $derived.by(() => {
    if (!price || price <= 0) return '€0';
    
    const locale = i18n.getLocale();
    
    // For Bulgarian, use simple format: "5лв"
    if (locale === 'bg') {
      const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
      return `${roundedPrice}лв`;
    }
    
    // For UK/English, use British pounds  
    if (locale === 'en') {
      try {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: price % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        }).format(price);
      } catch (error) {
        return `£${price}`;
      }
    }
    
    // Fallback
    return `€${price}`;
  });
</script>

{#if !isOwner}
  <div class="action-bar">
    <!-- Product Preview Section -->
    {#if productTitle || productImage}
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
    {/if}
    
    <div class="action-buttons">
      <!-- Favorite Button -->
      <button
        class="favorite-btn {isFavorited ? 'favorited' : ''}" 
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
      <Button
        variant="outline"
        size="md"
        disabled={isProcessing}
        onclick={onMessage}
        class="message-btn"
      >
        <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L5 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
        Message
      </Button>

      <!-- Primary Action -->
      {#if isSold}
        <Button variant="secondary" size="lg" disabled class="flex-1">
          SOLD OUT
        </Button>
      {:else}
        <Button
          variant="primary"
          size="lg"
          disabled={isProcessing}
          onclick={onBuyNow}
          class="flex-1"
        >
          {isProcessing ? 'Processing...' : `Buy Now • ${formattedPrice}`}
        </Button>
      {/if}
    </div>

    <!-- Make Offer Option -->
    {#if !isSold && onMakeOffer}
      <Button
        variant="ghost"
        size="sm"
        disabled={isProcessing}
        onclick={onMakeOffer}
        class="offer-btn-clean"
      >
        Make an Offer
      </Button>
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
    max-width: 28rem;
    margin: 0 auto;
  }

  .product-preview-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    margin-bottom: var(--space-3);
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

  .action-buttons {
    display: flex;
    gap: var(--space-3);
    align-items: center;
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
    width: var(--touch-standard);
    height: var(--touch-standard);
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
  
  .favorite-icon {
    color: var(--text-muted);
    width: 1.25rem;
    height: 1.25rem;
    transition: color var(--duration-fast);
  }
  
  .favorite-btn.favorited .favorite-icon {
    color: var(--status-error-solid);
  }
  
  .favorite-btn:hover .favorite-icon {
    color: var(--text-secondary);
  }
  
  :global(.message-btn) {
    flex-shrink: 0;
  }
  
  :global(.message-btn .message-icon) {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--space-2);
  }
  
  :global(.offer-btn-clean) {
    margin-top: var(--space-2);
    width: 100%;
  }
  
  .action-bar-spacer {
    height: var(--space-20);
  }

  @media (max-width: 480px) {
    .action-bar {
      left: var(--space-2);
      right: var(--space-2);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }
    
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
</style>