<script lang="ts">
  import type { ProductData, ProductPageEventHandlers } from '../../types';
  
  interface Props {
    products: ProductData[];
    sellerName: string;
    sellerId: string;
    title?: string;
    maxProducts?: number;
    showSellerLink?: boolean;
    onNavigate?: ProductPageEventHandlers['onNavigate'];
    formatPrice?: (price: number) => string;
    translateCondition?: (condition: string) => string;
    translations?: {
      moreFrom?: () => string;
      viewAllFrom?: () => string;
      viewProfile?: () => string;
    };
  }
  
  let {
    products = [],
    sellerName,
    sellerId,
    title,
    maxProducts = 8,
    showSellerLink = true,
    onNavigate,
    formatPrice = (price: number) => `€${price}`,
    translateCondition = (condition: string) => condition,
    translations = {}
  }: Props = $props();
  
  // Computed values
  const displayProducts = $derived(products.slice(0, maxProducts));
  const sectionTitle = $derived(title || translations.moreFrom?.() || `More from ${sellerName}`);
  const hasProducts = $derived(displayProducts.length > 0);
  
  // Event handlers
  function handleSellerLinkClick() {
    if (onNavigate) {
      onNavigate(`/profile/${sellerId}`);
    }
  }
  
  function handleProductClick(product: ProductData, event: MouseEvent) {
    if (event.metaKey || event.ctrlKey) {
      // Allow opening in new tab
      return;
    }
    
    event.preventDefault();
    if (onNavigate && product.seller?.username) {
      // Use canonical URL format if available
      const url = `/product/${product.seller.username}/${product.id}`;
      onNavigate(url);
    } else if (onNavigate) {
      // Fallback to ID-based URL
      onNavigate(`/product/${product.id}`);
    }
  }
</script>

{#if hasProducts}
  <section class="seller-products-section" aria-labelledby="seller-products-title">
    <div class="section-header">
      <h3 id="seller-products-title" class="section-title">
        {sectionTitle}
      </h3>
      
      {#if showSellerLink && onNavigate}
        <button
          type="button"
          onclick={handleSellerLinkClick}
          class="seller-link-button"
          aria-label={translations.viewProfile?.() || `View ${sellerName}'s profile`}
        >
          {translations.viewAllFrom?.() || 'View all'}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
            class="link-icon"
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      {/if}
    </div>
    
    <div class="products-grid" role="list">
      {#each displayProducts as product}
        <a
          href="/product/{product.seller?.username}/{product.id}"
          onclick={(e) => handleProductClick(product, e)}
          class="product-card"
          role="listitem"
          aria-label="View product: {product.title} - Price: {formatPrice(product.price)}"
        >
          <div class="product-image">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.title}
              loading="lazy"
              decoding="async"
              class="product-img"
            />
            
            {#if product.condition}
              <span class="condition-tag">
                {translateCondition(product.condition)}
              </span>
            {/if}
            
            {#if product.is_sold}
              <div class="sold-overlay">
                <span class="sold-badge">Sold</span>
              </div>
            {/if}
          </div>
          
          <div class="product-details">
            <h4 class="product-name">
              {product.title}
            </h4>
            <p class="product-price">
              {formatPrice(product.price)}
            </p>
          </div>
        </a>
      {/each}
    </div>
    
    <!-- Screen reader announcement -->
    <div class="sr-only" aria-live="polite">
      {displayProducts.length} products from {sellerName} displayed
    </div>
  </section>
{/if}

<style>
  .seller-products-section {
    margin-top: var(--space-6);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
    gap: var(--space-3);
  }
  
  .section-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
    flex: 1;
    min-width: 0;
  }
  
  .seller-link-button {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    min-height: var(--touch-compact);
  }
  
  .seller-link-button:hover {
    color: var(--text-primary);
    background: var(--surface-subtle);
  }
  
  .seller-link-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }
  
  .link-icon {
    transition: transform 0.2s ease;
  }
  
  .seller-link-button:hover .link-icon {
    transform: translateX(2px);
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
  
  @media (min-width: 640px) {
    .section-title {
      font-size: var(--text-xl);
    }
  }
  
  @media (min-width: 700px) {
    .products-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  
  .product-card {
    display: block;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-base);
    transition: all 0.2s ease;
    cursor: pointer;
    color: inherit;
    text-decoration: none;
  }
  
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: var(--border-emphasis);
  }
  
  .product-card:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }
  
  .product-image {
    position: relative;
    aspect-ratio: 4/5;
    background: var(--surface-subtle);
  }
  
  .product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }
  
  .product-card:hover .product-img {
    transform: scale(1.02);
  }
  
  .condition-tag {
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    background: var(--surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.125rem 0.375rem;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .sold-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
  
  .sold-badge {
    background: var(--surface-base);
    color: var(--text-primary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    border: 1px solid var(--border-subtle);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .product-details {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .product-name {
    font-size: var(--text-sm);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--font-medium);
    line-height: 1.3;
    margin: 0;
  }
  
  .product-price {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    margin: 0;
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    .seller-products-section {
      margin-top: var(--space-5);
    }
    
    .section-title {
      font-size: var(--text-base);
    }
    
    .section-header {
      margin-bottom: var(--space-2);
    }
    
    .products-grid {
      gap: var(--space-2);
    }
    
    .product-details {
      padding: 0.5rem;
    }
  }
  
  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .product-card:hover {
      transform: none;
    }
    
    .product-card:hover .product-img {
      transform: none;
    }
    
    .seller-link-button:hover {
      background: none;
      color: var(--text-secondary);
    }
  }
  
  /* Accessibility enhancements */
  @media (prefers-reduced-motion: reduce) {
    .product-card,
    .product-img,
    .link-icon,
    .seller-link-button {
      transition: none;
    }
    
    .product-card:hover {
      transform: none;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .product-card,
    .condition-tag,
    .sold-badge {
      border-width: 2px;
    }
    
    .seller-link-button:focus-visible {
      outline-width: 3px;
    }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>