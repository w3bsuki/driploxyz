<script lang="ts">
  import type { Product } from '../../types/product';
  import ProductImage from '../../compositions/product/ProductImage.svelte';
  import ConditionBadge from '../../primitives/badge/ConditionBadge.svelte';
  import ProBadge from '../../primitives/badge/ProBadge.svelte';
  import BrandBadge from '../../primitives/badge/BrandBadge.svelte';
  import { Tooltip } from '../../primitives/tooltip';
  
  // Ultrathink VINTED-STYLE DESIGN - Using semantic CSS classes with theme tokens
  
  interface Props {
    product: Product;
    onFavorite?: (productId: string) => void | Promise<void>;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    highlighted?: boolean;
    class?: string;
    priority?: boolean;
    index?: number;
    totalCount?: number;
    favoritesState?: { favoriteCounts: Record<string, number> };
    showBoostBadge?: boolean;
    showSellerBadges?: boolean;
    translations?: {
  size?: string | (() => string);
      currency?: string;
      addToFavorites?: string;
      removeFromFavorites?: string;
      brandNewWithTags?: string;
      newWithoutTags?: string;
      likeNew?: string;
      good?: string;
      worn?: string;
      fair?: string;
      new?: string;
      formatPrice?: (price: number) => string;
      categoryTranslation?: (category: string) => string;
      seller_unknown?: string;
    };
    favoriteButton?: any;
  }

  let { 
    product, 
    onFavorite, 
    onclick,
    favorited = false,
    highlighted = false,
    class: className = '',
    priority = false,
    favoriteButton,
    index = 0,
    totalCount = 1,
    favoritesState,
    showBoostBadge = true,
    showSellerBadges = true,
    translations = {
      size: 'Size',
      currency: '$',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      brandNewWithTags: 'BNWT',
      newWithoutTags: 'New',
      likeNew: 'Like New',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair',
      new: 'New'
    }
  }: Props = $props();

  function handleClick() {
    onclick?.(product);
  }

  // Tooltip content helpers
  const getConditionTooltip = (condition: string) => {
    const tooltipMap: Record<string, string> = {
      'brand_new_with_tags': 'Brand New With Tags - Never worn, still has original tags',
      'new_without_tags': 'New Without Tags - Never worn, tags removed',
      'like_new': 'Like New - Worn once or twice, excellent condition',
      'good': 'Good - Some signs of wear, good overall condition',
      'worn': 'Worn - Noticeable wear, still wearable',
      'fair': 'Fair - Significant wear, may have minor defects'
    };
    return tooltipMap[condition] || `Condition: ${condition}`;
  };

  // Check if text needs truncation tooltip (simplified check)
  const shouldShowTitleTooltip = $derived(!!(product.title && product.title.length > 50));

  // Seller display properties - use camelCase product properties
  const sellerAvatar = $derived(product.sellerAvatar ?? null);
  const sellerDisplayName = $derived(
    product.sellerName || ''
  );
  // Don't show seller chip if name is "Unknown" or empty
  const isValidSeller = $derived(
    sellerDisplayName && sellerDisplayName.trim() !== '' && sellerDisplayName !== 'Unknown'
  );
  const sellerAccessibleName = $derived(
    sellerDisplayName || translations.seller_unknown || 'Seller'
  );
  // Fix: removed arrow function wrapper - $derived should compute value directly
  const sellerInitial = $derived.by(() => {
    const source = sellerDisplayName || '';
    const trimmed = source.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '•';
  });
  const hasSellerChip = $derived(isValidSeller && Boolean(sellerAvatar || sellerDisplayName));

  const translateCategoryName = (value: string | null | undefined) => {
    if (!value) return '';
    const translator = translations.categoryTranslation;
    if (typeof translator === 'function') {
      try {
        return translator(value) || value;
      } catch {
        return value;
      }
    }
    return value;
  };

  // Strict: Only show Level 1 category above the title; never fallback to generic category_name
  const getTopCategoryLabel = () =>
    translateCategoryName(product.main_category_name ?? null);

  const getDetailCategoryLabel = () =>
    translateCategoryName(product.specific_category_name ?? null);

  const getBrandLabel = () => product.brand ?? '';

  const getSizePrefix = () => {
    const base = translations.size;
    if (typeof base === 'function') {
      try {
        return base() || 'Size';
      } catch {
        return 'Size';
      }
    }
    return base || 'Size';
  };

  const getSizeLabel = () => (product.size ? `${getSizePrefix()} ${product.size}`.trim() : '');

  const topCategory = $derived(getTopCategoryLabel());
  const detailCategory = $derived(getDetailCategoryLabel());
  const brandName = $derived(getBrandLabel());
  const sizeDisplay = $derived(getSizeLabel());
  const metadataItems = $derived([detailCategory, brandName, sizeDisplay].filter(Boolean));
  const metadataText = $derived(metadataItems.join(' • '));
  const hasMetadata = $derived(metadataItems.length > 0);
  const shouldShowMetadataTooltip = $derived(metadataText.length > 60);

</script>

{#snippet conditionBadgeWithTooltip(condition: any, isBoosted: boolean)}
  <Tooltip
    content={getConditionTooltip(condition)}
    positioning={{ side: 'bottom', align: 'start' }}
    openDelay={600}
    closeDelay={200}
  >
    {#snippet trigger()}
      <ConditionBadge
        condition={condition as any}
        isBoosted={isBoosted}
        translations={{
          brandNewWithTags: translations.brandNewWithTags,
          newWithoutTags: translations.newWithoutTags || translations.new,
          likeNew: translations.likeNew,
          good: translations.good,
          worn: translations.worn,
          fair: translations.fair
        }}
      />
    {/snippet}
  </Tooltip>
{/snippet}

{#snippet titleWithTooltip(title: string, showTooltip: boolean)}
  {#if showTooltip}
    <Tooltip 
      content={title}
      positioning={{ side: 'top', align: 'start' }}
      openDelay={800}
      closeDelay={200}
      triggerClass="block"
    >
      {#snippet trigger()}
        <h3 class="product-card__title">
          {title}
        </h3>
      {/snippet}
    </Tooltip>
  {:else}
    <h3 class="product-card__title">
      {title}
    </h3>
  {/if}
{/snippet}

{#snippet metadataDetails(detailCategory: string, brandName: string, sizeDisplay: string)}
  <p class="product-card__details">
    {#if detailCategory}
      <span class="product-card__details-item product-card__details-category">{detailCategory}</span>
    {/if}
    {#if brandName}
      <span class="product-card__details-item">{brandName}</span>
    {/if}
    {#if sizeDisplay}
      <span class="product-card__details-item">{sizeDisplay}</span>
    {/if}
  </p>
{/snippet}

<button
  type="button"
  class="product-card block w-full cursor-pointer bg-transparent hover:shadow-[var(--product-card-shadow-hover)] transition-shadow duration-200 {highlighted ? 'ring-2 ring-burgundy-500' : ''} {className}"
  onclick={handleClick}
  aria-label="{product.title} - {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}"
>
  <!-- Image Container with Overlaid Badges -->
  <div class="product-card__image">
    <ProductImage 
      product_images={product.product_images}
      images={product.images}
      alt={product.title}
      {priority}
    />
    
    <!-- Condition Badge - Top Left (inside image) -->
    {#if product.condition}
      <div class="product-card__badge">
  {@render conditionBadgeWithTooltip(product.condition, !!(product.is_boosted && showBoostBadge))}
      </div>
    {:else if product.is_boosted && showBoostBadge}
      <!-- Only show separate BOOST badge if no condition badge exists -->
      <div class="product-card__boost-badge">
        BOOST
      </div>
    {/if}

    <!-- Seller Badges - Top Right (inside image) -->
    {#if showSellerBadges && (product.seller_badges?.is_pro || product.seller_badges?.is_brand)}
      <div class="absolute right-2 top-0.5 z-20 flex flex-col gap-1">
        {#if product.seller_badges.is_brand}
          <BrandBadge size="sm" position="static" variant="black" />
        {:else if product.seller_badges.is_pro}
          <ProBadge size="sm" position="static" />
        {/if}
      </div>
    {/if}

    {@render favoriteButton?.()}
  </div>
  
  <!-- Content - Tightened spacing -->
  <div class="product-card__content">
    <div class="product-card__body">
      {#if topCategory}
        <p class="product-card__top-category">{topCategory}</p>
      {/if}

      {@render titleWithTooltip(product.title, shouldShowTitleTooltip)}

      {#if hasMetadata}
        {#if shouldShowMetadataTooltip}
          <Tooltip 
            content={metadataText}
            positioning={{ side: 'top', align: 'start' }}
            openDelay={800}
            closeDelay={200}
            triggerClass="block"
          >
            {#snippet trigger()}
              {@render metadataDetails(detailCategory, brandName, sizeDisplay)}
            {/snippet}
          </Tooltip>
        {:else}
          {@render metadataDetails(detailCategory, brandName, sizeDisplay)}
        {/if}
      {/if}

      <div class="product-card__price-row">
        <span class="product-card__price">
          {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}
        </span>
      </div>
    </div>

    {#if hasSellerChip}
      <div class="product-card__seller-chip" aria-label={`Seller ${sellerAccessibleName}`}>
        <div class="product-card__seller-avatar" aria-hidden="true">
          {#if sellerAvatar}
            <img src={sellerAvatar} alt="" loading="lazy" decoding="async" />
          {:else}
            <span>{sellerInitial}</span>
          {/if}
        </div>
        <span class="product-card__seller-name">{sellerAccessibleName}</span>
      </div>
    {/if}
  </div>
</button>

<style>
  /* Ensure button root doesn't center text by default */
  .product-card {
    text-align: left;
    border-radius: var(--product-card-radius);
  }

  /* Image - Full height with object-cover */
  .product-card__image {
    position: relative;
    width: 100%;
    aspect-ratio: var(--product-card-aspect);
    overflow: hidden;
    border-radius: var(--product-card-radius);
    background-color: var(--product-card-image-bg);
    margin-bottom: 6px; /* Slightly tighter gap below image */
  }

  .product-card__badge {
    position: absolute;
    top: var(--space-1);
    left: var(--space-2);
    z-index: 20;
    display: inline-flex;
    filter: drop-shadow(0 4px 10px color-mix(in oklch, var(--color-black) 20%, transparent));
  }

  /* Ensure ProductImage fills container */
  .product-card__image :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Fill entire container */
  }
  
  /* Boost Badge - Bottom Left inside image */
  .product-card__boost-badge {
    position: absolute;
    bottom: 6px;
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
  
  /* Content - Tightened spacing */
  .product-card__content {
    display: flex;
    flex-direction: column;
    gap: 0; /* We'll control tight spacing explicitly per element */
    text-align: left;
  }

  .product-card__body {
    display: flex;
    flex-direction: column;
    gap: 0; /* Remove generic gaps; use fine-grained margins below */
  }

  .product-card__top-category {
    font-size: var(--product-card-top-category-size, 0.75rem);
    font-weight: var(--product-card-top-category-weight, var(--font-weight-medium, 500));
    color: var(--product-card-details-color);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  margin: 0 0 var(--product-card-title-gap) 0; /* Controlled by token (now 0) */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Title - Single line with ellipsis */
  .product-card__title {
    font-size: calc(var(--product-card-title-size) * 1.02);
    font-weight: var(--product-card-title-weight, 900);
    color: var(--product-card-title-color);
    line-height: var(--product-card-title-leading);
  margin: 0 0 var(--product-card-details-gap) 0; /* Controlled by token (now 0) */
    display: -webkit-box;
    -webkit-line-clamp: 1; /* Single line */
    line-clamp: 1; /* Standard property */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
  }
  
  /* Details - Tight spacing from title */
  .product-card__details {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: calc(var(--space-1) - 2px);
    font-size: var(--product-card-details-size);
    font-weight: var(--product-card-details-weight);
    color: var(--product-card-details-color);
    line-height: var(--product-card-details-leading);
  margin: 0 0 var(--product-card-details-gap) 0; /* Controlled by token (now 0) */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .product-card__details-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    white-space: nowrap;
  }

  .product-card__details-item:not(:first-child)::before {
    content: '•';
    opacity: 0.55;
    font-size: 0.8em;
    margin-right: calc(var(--space-1) - 4px);
  }

  .product-card__details-category {
    font-weight: var(--font-normal); /* Make category not bold for readability balance */
    color: var(--product-card-title-color);
  }
  
  /* Price - Slightly closer to details */
  .product-card__price-row {
    display: flex;
    align-items: baseline;
  }

  .product-card__price {
    font-size: var(--product-card-price-size);
    font-weight: 700;
    color: var(--product-card-price-color);
    text-align: left;
  }

  .product-card__seller-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0 var(--space-2);
    min-height: var(--space-7);
    border-radius: var(--pill-radius, var(--radius-full));
    background-color: var(--surface-base);
      margin-top: var(--space-2);
    border: 1px solid color-mix(in oklch, var(--border-subtle) 80%, transparent);
    box-shadow: 0 4px 10px color-mix(in oklch, var(--color-black) 8%, transparent);
    max-width: 65%;
  }

  .product-card__seller-avatar {
    width: var(--space-6);
    height: var(--space-6);
    border-radius: var(--avatar-radius, var(--radius-full));
    overflow: hidden;
    background-color: color-mix(in oklch, var(--surface-subtle) 60%, transparent);
    display: grid;
    place-items: center;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--text-muted);
  }

  .product-card__seller-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .product-card__seller-name {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>