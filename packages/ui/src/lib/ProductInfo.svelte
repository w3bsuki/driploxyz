<script lang="ts">
  import Badge from './Badge.svelte';
  import { Accordion } from './primitives';

  interface Props {
    title: string;
    condition?: string;
    brand?: string;
    size?: string;
    color?: string;
    material?: string;
    description?: string;
    favoriteCount: number;
    isFavorited: boolean;
    onFavorite?: () => void;
    showQuickFacts?: boolean;
  }

  let { 
    title,
    condition,
    brand,
    size,
    color,
    material,
    description,
    favoriteCount,
    isFavorited,
    onFavorite,
    showQuickFacts = true
  }: Props = $props();

  let showFullDescription = $state(false);

  function translateCondition(condition: string): string {
    const map: Record<string, string> = {
      brand_new_with_tags: 'New with tags',
      brand_new_without_tags: 'New without tags',
      like_new: 'Like new',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair'
    };
    return map[condition] || condition;
  }

  function toggleDescription() {
    showFullDescription = !showFullDescription;
  }

  // Accordion data for product details
  const accordionItems = $derived([
    {
      id: 'product-details',
      title: 'Product Details',
      content: `Brand: ${brand || 'Not specified'}\nCondition: ${condition ? translateCondition(condition) : 'Not specified'}${size ? `\nSize: ${size}` : ''}${color ? `\nColor: ${color}` : ''}${material ? `\nMaterial: ${material}` : ''}`
    },
    {
      id: 'shipping-returns',
      title: 'Shipping & Returns',
      content: 'Free Shipping on orders over €75\nExpress Delivery: 1-2 days - €19\nStandard Delivery: 3-5 days - €9\nReturns: 30 days free returns'
    }
  ]);
</script>

<div class="product-info">
  <!-- Header Row -->
  <div class="header-row">
    {#if condition}
      <Badge variant="success" size="sm" class="condition-badge">
        {translateCondition(condition)}
      </Badge>
    {/if}
    
    <button 
      class="favorites-button" 
      onclick={onFavorite}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span>{favoriteCount}</span>
    </button>
  </div>

  <!-- Product Title -->
  <h1 class="product-title">{title}</h1>

  <!-- Quick Facts Row -->
  {#if showQuickFacts && (brand || size || color || material)}
    <div class="quick-facts">
      {#if brand}
        <Badge variant="secondary" size="sm">{brand}</Badge>
      {/if}
      {#if size}
        <Badge variant="secondary" size="sm">Size {size}</Badge>
      {/if}
      {#if color}
        <Badge variant="secondary" size="sm">{color}</Badge>
      {/if}
      {#if material}
        <Badge variant="secondary" size="sm">{material}</Badge>
      {/if}
    </div>
  {/if}

  <!-- Description -->
  {#if description}
    <div class="description-section">
      <div class="description-text {showFullDescription ? 'expanded' : ''}">
        {description}
      </div>
      {#if description.length > 200}
        <button 
          class="show-more-button" 
          onclick={toggleDescription}
          type="button"
        >
          {showFullDescription ? 'Show less' : 'Show more'}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Product Details Accordion -->
  <div class="details-accordion">
    <Accordion items={accordionItems} />
  </div>
</div>

<style>
  .product-info {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .favorites-button {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: var(--text-xs);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
  }

  .favorites-button:hover {
    color: var(--text-secondary);
    background: var(--surface-subtle);
  }

  .favorites-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .product-title {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    line-height: var(--leading-tight);
    margin: 0;
    letter-spacing: -0.025em;
  }

  .quick-facts {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
  }

  .description-section {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .description-text {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-line;
  }

  .description-text.expanded {
    display: block;
    -webkit-line-clamp: unset;
    line-clamp: unset;
    overflow: visible;
  }

  .show-more-button {
    background: none;
    border: none;
    color: var(--primary);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    cursor: pointer;
    padding: var(--space-1) 0;
    text-align: left;
    transition: color 0.2s ease;
  }

  .show-more-button:hover {
    color: var(--primary-600);
  }

  .show-more-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .details-accordion {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-4);
    margin-top: var(--space-2);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .product-info {
      padding: var(--space-5);
    }
    
    .product-title {
      font-size: var(--text-xl);
    }
  }

  /* Improve readability on larger screens */
  @media (min-width: 768px) {
    .product-title {
      font-size: var(--text-3xl);
    }
  }
</style>