<script lang="ts">
  import type { Product } from '../../types/product';
  import ProductImage from '../../compositions/product/ProductImage.svelte';
  import ConditionBadge from '../../primitives/badge/ConditionBadge.svelte';
  import ProBadge from '../../primitives/badge/ProBadge.svelte';
  import BrandBadge from '../../primitives/badge/BrandBadge.svelte';
  import { Tooltip } from '../../primitives/tooltip';
  
  interface Props {
    product: Product;
    onclick?: (product: Product) => void;
    highlighted?: boolean;
    class?: string;
    priority?: boolean;
    showBoostBadge?: boolean;
    showSellerBadges?: boolean;
    translations?: {
      size?: string;
      currency?: string;
      formatPrice?: (price: number) => string;
      categoryTranslation?: (category: string) => string;
      brandNewWithTags?: string;
      newWithoutTags?: string;
      likeNew?: string;
      good?: string;
      worn?: string;
      fair?: string;
    };
    favoriteButton?: any;
  }

  let { 
    product, 
    onclick,
    highlighted = false,
    class: className = '',
    priority = false,
    favoriteButton,
    showBoostBadge = true,
    showSellerBadges = true,
    translations = {
      size: 'Size',
      currency: '$',
      brandNewWithTags: 'BNWT',
      newWithoutTags: 'New',
      likeNew: 'Like New',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair'
    }
  }: Props = $props();

  function handleClick() {
    onclick?.(product);
  }

  const getConditionTooltip = (condition: string) => {
    const tooltipMap: Record<string, string> = {
      'brand_new_with_tags': 'Brand New With Tags - Never worn',
      'new_without_tags': 'New Without Tags',
      'like_new': 'Like New - Excellent condition',
      'good': 'Good condition',
      'worn': 'Worn but wearable',
      'fair': 'Fair - Shows wear'
    };
    return tooltipMap[condition] || condition;
  };
</script>

{#snippet conditionBadgeWithTooltip(condition: any)}
  <Tooltip
    content={getConditionTooltip(condition)}
    positioning={{ side: 'bottom', align: 'start' }}
    openDelay={600}
    closeDelay={200}
  >
    {#snippet trigger()}
      <ConditionBadge
        condition={condition}
        translations={{
          brandNewWithTags: translations.brandNewWithTags,
          newWithoutTags: translations.newWithoutTags,
          likeNew: translations.likeNew,
          good: translations.good,
          worn: translations.worn,
          fair: translations.fair
        }}
      />
    {/snippet}
  </Tooltip>
{/snippet}

<button
  type="button"
  class="block w-full cursor-pointer bg-[var(--card-bg)] hover:shadow-[var(--product-card-hover-shadow)] transition-shadow duration-200 {highlighted ? 'ring-2 ring-burgundy-500' : ''} {className}"
  onclick={handleClick}
  aria-label="{product.title} - {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}"
>
  <!-- Image - Full width aspect ratio -->
  <div class="product-card__image">
    <ProductImage 
      product_images={product.product_images}
      images={product.images}
      alt={product.title}
      {priority}
    />
    
    {#if product.is_boosted && showBoostBadge}
      <div class="product-card__boost-badge">
        BOOST
      </div>
    {/if}

    {#if showSellerBadges && (product.seller_badges?.is_pro || product.seller_badges?.is_brand)}
      <div class="absolute right-1.5 top-1.5 z-20 flex flex-col gap-1">
        {#if product.seller_badges.is_brand}
          <BrandBadge size="sm" position="static" variant="black" />
        {:else if product.seller_badges.is_pro}
          <ProBadge size="sm" position="static" />
        {/if}
      </div>
    {/if}

    {@render favoriteButton?.()}
  </div>
  
  <!-- Content -->
  <div class="product-card__content">
    {#if product.condition}
      <div class="product-card__badge-wrapper">
        {@render conditionBadgeWithTooltip(product.condition)}
      </div>
    {/if}

    <h3 class="product-card__title">
      {product.title}
    </h3>
    
    {#if product.specific_category_name || product.brand || product.size}
      <p class="product-card__details">
        {#if product.specific_category_name}
          <span class="product-card__details-category">{translations.categoryTranslation ? translations.categoryTranslation(product.specific_category_name) : product.specific_category_name}</span>
        {/if}
        {#if product.specific_category_name && product.brand} · {/if}
        {#if product.brand}{product.brand}{/if}
        {#if (product.specific_category_name || product.brand) && product.size} · {/if}
        {#if product.size}{translations.size} {product.size}{/if}
      </p>
    {/if}

    <div class="product-card__price">
      {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}
    </div>
  </div>
</button>

<style>
  /* Image Container - Full width, consistent aspect ratio */
  .product-card__image {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: var(--product-card-radius);
    background-color: var(--product-card-image-bg);
    margin-bottom: var(--product-card-image-gap);
  }
  
  /* Boost Badge */
  .product-card__boost-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 20;
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-sm);
    background-color: var(--product-card-boost-bg);
    padding: 2px 8px;
    font-size: var(--product-card-badge-size);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: var(--product-card-boost-text);
  }
  
  /* Content Container - Ultra-tight */
  .product-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--product-card-content-gap);
  }
  
  /* Badge Wrapper */
  .product-card__badge-wrapper {
    margin-bottom: var(--product-card-badge-gap);
  }
  
  /* Title */
  .product-card__title {
    font-size: var(--product-card-title-size);
    font-weight: var(--product-card-title-weight);
    color: var(--product-card-title-color);
    line-height: var(--product-card-title-leading);
    margin-bottom: var(--product-card-title-gap);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Details */
  .product-card__details {
    font-size: var(--product-card-details-size);
    font-weight: var(--product-card-details-weight);
    color: var(--product-card-details-color);
    line-height: var(--product-card-details-leading);
    margin-bottom: var(--product-card-details-gap);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-card__details-category {
    font-weight: var(--font-weight-medium);
    color: var(--product-card-title-color);
  }
  
  /* Price - Most prominent */
  .product-card__price {
    font-size: var(--product-card-price-size);
    font-weight: var(--product-card-price-weight);
    color: var(--product-card-price-color);
  }
</style>
