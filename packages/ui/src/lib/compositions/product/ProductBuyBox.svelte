<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  import Badge from '../../primitives/badge/Badge.svelte';
  // No lifecycle imports needed - using $effect

  interface Product {
    price: number;
    originalPrice?: number;
    currency?: string;
    isOwner?: boolean;
    isSold?: boolean;
    acceptsOffers?: boolean;
  }

  interface Props {
    product: Product;
    isOwner?: boolean;
    isAuthenticated?: boolean;
    onBuyNow?: () => void;
    onMessage?: () => void;
    onMakeOffer?: () => void;
    className?: string;
    variant?: 'default' | 'compact' | 'floating';
  }

  let { 
    product,
    isOwner = false,
    isAuthenticated = false,
    onBuyNow,
    onMessage,
    onMakeOffer,
    className = '',
    variant = 'default'
  }: Props = $props();

  // State management
  let isLoading = $state(false);
  let loadingAction = $state<string | null>(null);
  let showPriceAnimation = $state(false);

  const currency = $derived(product.currency || '€');
  const hasDiscount = $derived(product.originalPrice && product.originalPrice > product.price);
  const discountPercentage = $derived(() => {
    if (!hasDiscount || !product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  });

  const canBuy = $derived(!isOwner && !product.isSold && isAuthenticated);
  const canMessage = $derived(!isOwner && isAuthenticated);
  const canMakeOffer = $derived(!isOwner && !product.isSold && product.acceptsOffers && isAuthenticated);

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

  function formatPrice(price: number) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  $effect(() => {
    // Trigger price animation after mount
    setTimeout(() => showPriceAnimation = true, 100);
  });
</script>

<div class="buy-box {className} buy-box--{variant}" class:buy-box--loading={isLoading}>
  <!-- Price Section -->
  <div class="price-section">
    <div class="price-main" class:price-animated={showPriceAnimation}>
      <div class="price-current">
        <span class="currency">{currency}</span>
        <span class="price-amount">{formatPrice(product.price)}</span>
        
        {#if product.isSold}
          <Badge variant="subtle" class="sold-indicator">
            <svg viewBox="0 0 16 16" class="sold-icon">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM6.5 5a.5.5 0 01.5-.5h2a.5.5 0 010 1H7a.5.5 0 00-.5.5v2.5a.5.5 0 01-1 0V5z"/>
              <path d="M8 10.5a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
            </svg>
            Sold
          </Badge>
        {/if}
      </div>
      
      {#if hasDiscount && product.originalPrice != null}
        <div class="price-original">
          <span class="original-amount">{currency}{formatPrice(product.originalPrice)}</span>
          <Badge variant="success" size="sm" class="discount-badge">
            -{discountPercentage()}%
          </Badge>
        </div>
      {/if}
    </div>
    
    {#if variant === 'default'}
      <div class="price-details">
        <div class="detail-row">
          <span class="detail-label">Price</span>
          <span class="detail-value">{currency}{formatPrice(product.price)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Shipping</span>
          <span class="detail-value detail-value--free">Free</span>
        </div>
        <div class="detail-separator"></div>
        <div class="detail-row detail-row--total">
          <span class="detail-label">Total</span>
          <span class="detail-value">{currency}{formatPrice(product.price)}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="actions-section">
    {#if isOwner}
      <!-- Owner Actions -->
      <div class="owner-state">
        <div class="state-message">
          <svg viewBox="0 0 20 20" class="state-icon">
            <path fill="currentColor" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
          </svg>
          <span>This is your listing</span>
        </div>
        <button 
          class="action-btn action-btn--secondary"
          onclick={() => handleAction('edit', () => {})}
          disabled={isLoading}
        >
          {#if loadingAction === 'edit'}
            <div class="loading-spinner"></div>
          {:else}
            <svg viewBox="0 0 20 20" class="btn-icon">
              <path fill="currentColor" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          {/if}
          Edit Listing
        </button>
      </div>
    {:else if product.isSold}
      <!-- Sold State -->
      <div class="sold-state">
        <div class="state-message">
          <svg viewBox="0 0 20 20" class="state-icon">
            <path fill="currentColor" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          <span>This item has been sold</span>
        </div>
        {#if canMessage}
          <button 
            class="action-btn action-btn--secondary"
            onclick={() => handleAction('message', onMessage)}
            disabled={isLoading}
          >
            {#if loadingAction === 'message'}
              <div class="loading-spinner"></div>
            {:else}
              <svg viewBox="0 0 20 20" class="btn-icon">
                <path fill="currentColor" d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path fill="currentColor" d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
            {/if}
            Ask About Similar Items
          </button>
        {/if}
      </div>
    {:else if !isAuthenticated}
      <!-- Auth Required -->
      <div class="auth-state">
        <div class="state-message">
          <svg viewBox="0 0 20 20" class="state-icon">
            <path fill="currentColor" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          <span>Sign in to purchase this item</span>
        </div>
        <button class="action-btn action-btn--primary action-btn--large">
          <svg viewBox="0 0 20 20" class="btn-icon">
            <path fill="currentColor" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          Sign In to Buy
        </button>
      </div>
    {:else}
      <!-- Purchase Actions -->
      <div class="purchase-actions">
        <button 
          class="action-btn action-btn--primary action-btn--large buy-now-btn"
          onclick={() => handleAction('buy', onBuyNow)}
          disabled={!canBuy || isLoading}
        >
          {#if loadingAction === 'buy'}
            <div class="loading-spinner"></div>
          {:else}
            <svg viewBox="0 0 20 20" class="btn-icon">
              <path fill="currentColor" d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
          {/if}
          <span class="btn-text">Buy Now</span>
        </button>
        
        <div class="secondary-actions">
          {#if canMakeOffer}
            <button 
              class="action-btn action-btn--secondary"
              onclick={() => handleAction('offer', onMakeOffer)}
              disabled={isLoading}
            >
              {#if loadingAction === 'offer'}
                <div class="loading-spinner"></div>
              {:else}
                <svg viewBox="0 0 20 20" class="btn-icon">
                  <path fill="currentColor" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill="currentColor" fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                </svg>
              {/if}
              Make Offer
            </button>
          {/if}
          
          <button 
            class="action-btn action-btn--secondary"
            onclick={() => handleAction('message', onMessage)}
            disabled={!canMessage || isLoading}
          >
            {#if loadingAction === 'message'}
              <div class="loading-spinner"></div>
            {:else}
              <svg viewBox="0 0 20 20" class="btn-icon">
                <path fill="currentColor" d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path fill="currentColor" d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
            {/if}
            Message
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Trust & Security (only show in default variant) -->
  {#if variant === 'default'}
    <div class="trust-section">
      <div class="trust-item">
        <div class="trust-icon">
          <svg viewBox="0 0 20 20">
            <path fill="currentColor" d="M10 2L3 7v3c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z"/>
            <path fill="currentColor" d="M8 11l2 2 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="trust-content">
          <div class="trust-title">Buyer Protection</div>
          <div class="trust-desc">Secure payments & money-back guarantee</div>
        </div>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon">
          <svg viewBox="0 0 20 20">
            <path fill="currentColor" d="M13 8V5a3 3 0 10-6 0v3H5a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2zM9 5a1 1 0 112 0v3H9V5z"/>
          </svg>
        </div>
        <div class="trust-content">
          <div class="trust-title">Fast & Secure</div>
          <div class="trust-desc">Ships within 1-2 business days</div>
        </div>
      </div>

      <div class="trust-item">
        <div class="trust-icon">
          <svg viewBox="0 0 20 20">
            <path fill="currentColor" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
        </div>
        <div class="trust-content">
          <div class="trust-title">30-Day Returns</div>
          <div class="trust-desc">Easy returns & exchanges policy</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .buy-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    transition: all 0.2s;
  }

  .buy-box--default {
    padding: var(--space-5);
    position: sticky;
    top: var(--space-4);
  }

  .buy-box--compact {
    padding: var(--space-4);
  }

  /* Compact variant typography adjustments */
  .buy-box--compact .currency {
    font-size: var(--font-size-base);
  }
  .buy-box--compact .price-amount {
    font-size: var(--font-size-2xl);
  }
  .buy-box--compact .price-details {
    padding: var(--space-2);
  }
  .buy-box--compact .action-btn {
    padding: var(--space-2-5) var(--space-3-5);
    font-size: var(--font-size-sm);
  }
  .buy-box--compact .action-btn--large {
    min-height: var(--touch-standard);
    font-size: var(--font-size-base);
  }
  .buy-box--compact .trust-section {
    padding: var(--space-2);
  }

  .buy-box--floating {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    padding: var(--space-4);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: var(--shadow-2xl);
    backdrop-filter: blur(10px);
    background: color-mix(in oklch, var(--surface-base) 95%, transparent);
  }

  .buy-box--loading {
    pointer-events: none;
    opacity: 0.8;
  }

  /* Price Section */
  .price-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .price-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .price-current {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .currency {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-subtle);
    align-self: flex-start;
    margin-top: var(--space-1);
  }

  .price-amount {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-strong);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .price-animated {
    animation: priceReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes priceReveal {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .sold-indicator {
    margin-left: auto;
  }

  .sold-icon {
    width: 12px;
    height: 12px;
    margin-right: var(--space-1);
  }

  .price-original {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .original-amount {
    font-size: var(--font-size-lg);
    color: var(--text-subtle);
    text-decoration: line-through;
    text-decoration-color: var(--text-subtle);
  }

  .discount-badge {
    animation: discountPulse 2s ease-in-out infinite;
  }

  @keyframes discountPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  /* Price Details */
  .price-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-row--total {
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    font-size: var(--font-size-base);
  }

  .detail-label {
    color: var(--text-subtle);
  }

  .detail-value {
    color: var(--text-strong);
    font-weight: var(--font-weight-medium);
  }

  .detail-value--free {
    color: var(--success);
  }

  .detail-separator {
    height: 1px;
    background: var(--border-subtle);
    margin: var(--space-2) 0;
  }

  /* Actions Section */
  .actions-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    min-height: var(--touch-standard);
    position: relative;
    overflow: hidden;
  }

  .action-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .action-btn--primary {
    background: var(--primary);
    color: var(--primary-fg);
  }

  .action-btn--primary:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  .action-btn--primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .action-btn--secondary {
    background: var(--surface-base);
    color: var(--text-strong);
    border: 1px solid var(--border-subtle);
  }

  .action-btn--secondary:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  .action-btn--large {
    padding: var(--space-4) var(--space-6);
    font-size: var(--font-size-lg);
    min-height: var(--touch-primary);
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .btn-text {
    font-weight: var(--font-weight-bold);
  }

  /* Loading Spinner */
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid currentColor;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Purchase Actions */
  .purchase-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .buy-now-btn {
    position: relative;
  }

  .buy-now-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .buy-now-btn:hover::before {
    transform: translateX(100%);
  }

  .secondary-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  /* State Messages */
  .owner-state,
  .sold-state,
  .auth-state {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
    align-items: center;
  }

  .state-message {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    color: var(--text-subtle);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .state-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--text-strong);
  }

  /* Trust Section */
  .trust-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
  }

  .trust-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .trust-icon {
    width: var(--space-8);
    height: var(--space-8);
    background: var(--success);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .trust-icon svg {
    width: 18px;
    height: 18px;
    color: var(--surface-base);
  }

  .trust-content {
    flex: 1;
    min-width: 0;
  }

  .trust-title {
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-1);
  }

  .trust-desc {
    color: var(--text-subtle);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-relaxed);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .buy-box--default {
      position: static;
      padding: var(--space-4);
    }

    .price-amount {
      font-size: var(--font-size-2xl);
    }

    .secondary-actions {
      grid-template-columns: 1fr;
    }

    .trust-section {
      padding: var(--space-2);
    }

    .trust-item {
      gap: var(--space-2);
    }

    .trust-icon {
      width: var(--space-6);
      height: var(--space-6);
    }

    .trust-icon svg {
      width: 14px;
      height: 14px;
    }
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .buy-box--floating {
      background: color-mix(in oklch, var(--surface-base) 90%, transparent);
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .action-btn {
      border-width: 2px;
    }

    .trust-icon {
      border: 2px solid var(--success);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .price-animated,
    .discount-badge,
    .action-btn,
    .buy-now-btn::before,
    .loading-spinner {
      animation: none;
      transition: none;
    }
  }
</style>
