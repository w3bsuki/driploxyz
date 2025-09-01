<script lang="ts">
  import type { Product } from '../types';
  import ProductImage from './ProductImage.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import ProductPrice from './ProductPrice.svelte';
  import FavoriteButton from './FavoriteButton.svelte';
  import UserBadge from './UserBadge.svelte';
  import Tooltip from './primitives/tooltip/Tooltip.svelte';
  
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
    translations?: {
      size?: string;
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
    };
  }

  let { 
    product, 
    onFavorite, 
    onclick,
    favorited = false,
    highlighted = false,
    class: className = '',
    priority = false,
    index = 0,
    totalCount = 1,
    favoritesState,
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
  const shouldShowTitleTooltip = $derived(product.title && product.title.length > 50);
  const shouldShowCategoryTooltip = $derived(
    product.subcategory_name && product.brand && product.size && 
    `${product.subcategory_name} • ${product.brand} • ${translations.size} ${product.size}`.length > 60
  );
</script>

{#snippet conditionBadgeWithTooltip(condition: string)}
  <Tooltip 
    content={getConditionTooltip(condition)}
    positioning={{ side: 'bottom', align: 'start' }}
    openDelay={600}
    closeDelay={200}
    triggerClass="absolute top-2 left-2 z-20"
  >
    {#snippet trigger()}
      <ConditionBadge 
        condition={condition}
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
      triggerClass="block pr-12"
    >
      {#snippet trigger()}
        <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none mb-0.5 cursor-help">
          {title}
        </h3>
      {/snippet}
    </Tooltip>
  {:else}
    <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none mb-0.5 pr-12">
      {title}
    </h3>
  {/if}
{/snippet}

{#snippet productDetailsText(fullText: string, showTooltip: boolean)}
  {#if showTooltip}
    <Tooltip 
      content={fullText}
      positioning={{ side: 'top', align: 'start' }}
      openDelay={800}
      closeDelay={200}
      triggerClass="block"
    >
      {#snippet trigger()}
        <p class="text-xs text-gray-700 line-clamp-1 leading-none mb-1 cursor-help">
          {#if product.subcategory_name}
            <span class="font-medium text-gray-700">{translations.categoryTranslation ? translations.categoryTranslation(product.subcategory_name) : product.subcategory_name}</span>
          {/if}
          {#if product.subcategory_name && product.brand} • {/if}
          {#if product.brand}
            <span class="text-gray-700">{product.brand}</span>
          {/if}
          {#if (product.subcategory_name || product.brand) && product.size} • {/if}
          {#if product.size}
            <span class="text-gray-700">{translations.size} {product.size}</span>
          {/if}
        </p>
      {/snippet}
    </Tooltip>
  {:else}
    <p class="text-xs text-gray-700 line-clamp-1 leading-none mb-1">
      {#if product.subcategory_name}
        <span class="font-medium text-gray-700">{translations.categoryTranslation ? translations.categoryTranslation(product.subcategory_name) : product.subcategory_name}</span>
      {/if}
      {#if product.subcategory_name && product.brand} • {/if}
      {#if product.brand}
        <span class="text-gray-700">{product.brand}</span>
      {/if}
      {#if (product.subcategory_name || product.brand) && product.size} • {/if}
      {#if product.size}
        <span class="text-gray-700">{translations.size} {product.size}</span>
      {/if}
    </p>
  {/if}
{/snippet}

<div 
  class="product-card cursor-pointer transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 rounded-[var(--radius-md)] {highlighted ? 'highlighted' : ''} {className}"
  onclick={handleClick}
  onkeydown={(e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabindex="0"
  aria-label="{product.title} - Price: {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}"
>
  <!-- Image Container with overlays -->
  <div class="relative">
    <ProductImage 
      product_images={product.product_images}
      images={product.images}
      alt="{product.title} product image"
      {priority}
    />
    
      <!-- Condition badge with tooltip -->
    {#if product.condition}
      {@render conditionBadgeWithTooltip(product.condition)}
    {/if}
  </div>
  
  <!-- Content -->
  <div class="px-1 pt-1.5 pb-1.5 relative">
    <!-- Favorite button positioned over content area -->
    <FavoriteButton 
      {product}
      {favorited}
      {favoritesState}
      onFavorite={() => onFavorite?.(product.id)}
      addToFavoritesText={translations.addToFavorites}
      removeFromFavoritesText={translations.removeFromFavorites}
      absolute={true}
      showCount={true}
      customPosition="absolute top-2 right-2 z-10"
    />
    
    <!-- Main Category (always show) -->
    <div class="flex items-center justify-between gap-1.5 min-h-3.5 mb-0.5 pr-12">
      {#if product.main_category_name || product.category_name}
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wider leading-none flex-1 truncate">
          {translations.categoryTranslation ? translations.categoryTranslation(product.main_category_name || product.category_name || '') : (product.main_category_name || product.category_name)}
        </p>
      {/if}
    </div>
    
    <!-- Title with tooltip for truncated text -->
    {@render titleWithTooltip(product.title, shouldShowTitleTooltip)}
    
    <!-- Subcategory • Brand • Size with tooltip for truncated text -->
    {#if product.subcategory_name || product.brand || product.size}
      {@const fullDetailsText = [
        product.subcategory_name ? (translations.categoryTranslation ? translations.categoryTranslation(product.subcategory_name) : product.subcategory_name) : null,
        product.brand,
        product.size ? `${translations.size} ${product.size}` : null
      ].filter(Boolean).join(' • ')}
      
      {@render productDetailsText(fullDetailsText, shouldShowCategoryTooltip)}
    {/if}
    
    <!-- Price -->
    <div class="-mt-0.5">
      <ProductPrice 
        price={product.price}
        currency={translations.currency}
        formatPrice={translations.formatPrice}
      />
    </div>
  </div>
</div>

<style>
  .product-card {
    position: relative;
  }
  
  .product-card.highlighted {
    border-color: var(--status-warning-solid);
    border-width: 2px;
  }
</style>