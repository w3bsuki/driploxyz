<script lang="ts">
  import type { CurrencyCode, PriceFormatOptions } from '../../types/product';
  
  interface Props {
    price: number;
    currency?: CurrencyCode;
    locale?: string;
    showSymbol?: boolean;
    precision?: number;
    className?: string;
    originalPrice?: number;
    showDiscount?: boolean;
    discountType?: 'percentage' | 'amount';
  }
  
  let {
    price,
    currency = 'EUR',
    locale,
    showSymbol = true,
    precision,
    className = '',
    originalPrice,
    showDiscount = false,
    discountType = 'percentage'
  }: Props = $props();
  
  // Auto-detect locale from i18n if available
  const detectedLocale = $derived(() => {
    if (locale) return locale;
    
    // Try to get from global i18n context
    try {
      const i18n = (globalThis as any)?.i18n;
      if (i18n?.getLocale) {
        const currentLocale = i18n.getLocale();
        return currentLocale === 'bg' ? 'bg-BG' : 'en-GB';
      }
    } catch {
      // Fallback
    }
    
    // Currency-based locale detection
    switch (currency) {
      case 'BGN': return 'bg-BG';
      case 'GBP': return 'en-GB';
      case 'USD': return 'en-US';
      case 'EUR': return 'en-GB'; // European English formatting
      default: return 'en-GB';
    }
  });
  
  // Format main price
  const formattedPrice = $derived(() => {
    return formatPrice(price, {
      currency,
      locale: detectedLocale,
      showSymbol,
      precision
    });
  });
  
  // Format original price for discount display
  const formattedOriginalPrice = $derived(() => {
    if (!originalPrice || !showDiscount) return null;
    
    return formatPrice(originalPrice, {
      currency,
      locale: detectedLocale,
      showSymbol,
      precision
    });
  });
  
  // Calculate discount
  const discount = $derived(() => {
    if (!originalPrice || !showDiscount || originalPrice <= price) return null;
    
    if (discountType === 'percentage') {
      const percentage = Math.round(((originalPrice - price) / originalPrice) * 100);
      return `${percentage}%`;
    } else {
      const amount = originalPrice - price;
      return formatPrice(amount, {
        currency,
        locale: detectedLocale,
        showSymbol,
        precision
      });
    }
  });
  
  // Utility function to format prices consistently
  function formatPrice(amount: number, options: PriceFormatOptions): string {
    const {
      currency: curr = 'EUR',
      locale: loc = 'en-GB',
      showSymbol: symbol = true,
      precision: prec
    } = options;
    
    // Bulgarian Lev special formatting
    if (curr === 'BGN' || loc === 'bg-BG') {
      const roundedAmount = prec !== undefined ? 
        Number(amount.toFixed(prec)) : 
        (amount % 1 === 0 ? Math.round(amount) : amount);
      
      return symbol ? `${roundedAmount}лв` : String(roundedAmount);
    }
    
    // Use Intl.NumberFormat for other currencies
    try {
      const formatter = new Intl.NumberFormat(loc, {
        style: symbol ? 'currency' : 'decimal',
        currency: curr,
        minimumFractionDigits: prec !== undefined ? prec : (amount % 1 === 0 ? 0 : 2),
        maximumFractionDigits: prec !== undefined ? prec : 2
      });
      
      return formatter.format(amount);
    } catch (error) {
      console.warn('Price formatting error:', error);
      
      // Fallback formatting
      const roundedAmount = prec !== undefined ? 
        Number(amount.toFixed(prec)) : amount;
      
      if (!symbol) return String(roundedAmount);
      
      switch (curr) {
        case 'GBP': return `£${roundedAmount}`;
        case 'USD': return `$${roundedAmount}`;
        case 'EUR': return `€${roundedAmount}`;
        default: return `${curr} ${roundedAmount}`;
      }
    }
  }
</script>

<span class="price-formatter {className}" role="text" aria-label="Price: {formattedPrice}">
  {#if formattedOriginalPrice && discount}
    <span class="price-group">
      <span class="original-price" aria-label="Original price: {formattedOriginalPrice}">
        {formattedOriginalPrice}
      </span>
      <span class="current-price discounted" aria-label="Sale price: {formattedPrice}">
        {formattedPrice}
      </span>
      <span class="discount-badge" aria-label="{discount} off">
        -{discount}
      </span>
    </span>
  {:else}
    <span class="current-price">
      {formattedPrice}
    </span>
  {/if}
</span>

<style>
  .price-formatter {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .price-group {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  
  .current-price {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    font-size: inherit;
  }
  
  .current-price.discounted {
    color: var(--semantic-success-text);
  }
  
  .original-price {
    font-size: 0.875em;
    color: var(--text-tertiary);
    text-decoration: line-through;
    font-weight: var(--font-normal);
  }
  
  .discount-badge {
    display: inline-flex;
    align-items: center;
    background: var(--semantic-success-bg);
    color: var(--semantic-success-text);
    border: 1px solid var(--semantic-success-border);
    border-radius: var(--radius-sm);
    padding: 0.125rem 0.375rem;
    font-size: 0.75em;
    font-weight: var(--font-medium);
    line-height: 1.2;
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    .price-group {
      gap: var(--space-1);
    }
    
    .discount-badge {
      padding: 0.0625rem 0.25rem;
      font-size: 0.6875em;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .discount-badge {
      border-width: 2px;
      font-weight: var(--font-semibold);
    }
    
    .original-price {
      text-decoration-thickness: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .price-formatter * {
      transition: none;
    }
  }
</style>