<script lang="ts">
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
</script>

{#if !isOwner}
  <div class="action-bar">
    <div class="actions">
      <!-- Favorite Button -->
      <button
        class="favorite-btn {isFavorited ? 'active' : ''}" 
        onclick={onFavorite}
        aria-label={isFavorited ? removeFavorite() : addFavorite()}
        type="button"
      >
        <svg width="22" height="22" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <!-- Message Button -->
      <button
        class="message-btn"
        onclick={onMessage}
        type="button"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span>{message()}</span>
      </button>

      <!-- Buy Button -->
      {#if isSold}
        <button class="buy-btn sold" disabled>
          {soldOut()}
        </button>
      {:else}
        <button class="buy-btn primary" onclick={onBuyNow} type="button">
          <span class="buy-content">
            <span class="buy-text">{buyNow()}</span>
            <span class="price">{formattedPrice}</span>
          </span>
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-base);
    border-top: 1px solid var(--border-subtle);
    padding: var(--space-3) var(--space-4);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
    z-index: 50;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  }

  .actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    max-width: 28rem;
    margin: 0 auto;
  }

  /* Favorite Button - Clean Icon Only */
  .favorite-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1.5px solid var(--border-default);
    border-radius: var(--radius-xl);
    background: var(--surface-base);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .favorite-btn:hover {
    border-color: var(--border-emphasis);
    background: var(--surface-subtle);
    color: var(--text-secondary);
  }

  .favorite-btn.active {
    background: var(--status-error-bg);
    border-color: var(--status-error-solid);
    color: var(--status-error-solid);
  }

  .favorite-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Message Button - Clean with Text */
  .message-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    height: 48px;
    padding: 0 var(--space-4);
    border: 1.5px solid var(--border-default);
    border-radius: var(--radius-xl);
    background: var(--surface-base);
    color: var(--text-primary);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .message-btn:hover {
    border-color: var(--border-emphasis);
    background: var(--surface-subtle);
  }

  .message-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .message-btn span {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  /* Buy Button - Primary Action */
  .buy-btn {
    flex: 1;
    height: 48px;
    border: none;
    border-radius: var(--radius-xl);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    position: relative;
    overflow: hidden;
  }

  .buy-btn.primary {
    background: var(--text-primary);
    color: var(--surface-base);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .buy-btn.primary:hover {
    background: var(--text-secondary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
    transform: translateY(-1px);
  }

  .buy-btn.primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .buy-btn.sold {
    background: var(--surface-muted);
    color: var(--text-tertiary);
    cursor: not-allowed;
    border: 1px solid var(--border-subtle);
  }

  .buy-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .buy-text {
    font-size: var(--text-base);
  }

  .price {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    opacity: 0.9;
  }

  /* Mobile Optimizations - Real Marketplace Feel */
  @media (max-width: 640px) {
    .action-bar {
      padding: var(--space-3) var(--space-3);
    }

    .actions {
      gap: var(--space-2);
    }

    .favorite-btn {
      width: 44px;
      height: 44px;
    }

    .message-btn {
      height: 44px;
      padding: 0 var(--space-3);
      font-size: var(--text-xs);
    }

    .message-btn span {
      font-size: var(--text-xs);
    }

    .buy-btn {
      height: 44px;
    }

    .buy-content {
      gap: var(--space-1);
    }

    .buy-text {
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      line-height: 1.2;
    }

    .price {
      font-size: var(--text-sm);
      font-weight: var(--font-bold);
      line-height: 1.2;
    }
  }

  /* Very Small Screens */
  @media (max-width: 380px) {
    .actions {
      gap: var(--space-1);
    }

    .favorite-btn {
      width: 40px;
      height: 40px;
    }

    .message-btn {
      height: 40px;
      padding: 0 var(--space-2);
    }

    .message-btn span {
      display: none;
    }

    .buy-btn {
      height: 40px;
    }
  }

  /* Touch Device Optimizations */
  @media (pointer: coarse) {
    .favorite-btn,
    .message-btn,
    .buy-btn {
      min-height: 44px;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .favorite-btn,
    .message-btn {
      border: 2px solid;
    }
    
    .buy-btn.primary {
      border: 2px solid transparent;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .favorite-btn,
    .message-btn,
    .buy-btn {
      transition: none;
      transform: none !important;
    }
  }

  /* Dark Mode Adjustments */
  @media (prefers-color-scheme: dark) {
    .action-bar {
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.3);
    }
  }
</style>