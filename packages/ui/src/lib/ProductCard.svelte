<script lang="ts">
  import type { Product } from '../types';
  import ProductImage from './ProductImage.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import ProductPrice from './ProductPrice.svelte';
  import FavoriteButton from './FavoriteButton.svelte';
  import UserBadge from './UserBadge.svelte';
  import { Tooltip } from './primitives/tooltip';
  
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
    product.specific_category_name && product.brand && product.size && 
    `${product.specific_category_name} • ${product.brand} • ${translations.size} ${product.size}`.length > 60
  );
</script>

{#snippet conditionBadgeWithTooltip(condition: string)}
  <div class="absolute top-0 left-1 z-20">
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
            newWithoutTags: translations.newWithoutTags || translations.new,
            likeNew: translations.likeNew,
            good: translations.good,
            worn: translations.worn,
            fair: translations.fair
          }}
        />
      {/snippet}
    </Tooltip>
  </div>
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
        <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none mb-0.5 cursor-help">
          {title}
        </h3>
      {/snippet}
    </Tooltip>
  {:else}
    <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none mb-0.5">
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
          {#if product.specific_category_name}
            <span class="font-medium text-gray-700">{translations.categoryTranslation ? translations.categoryTranslation(product.specific_category_name) : product.specific_category_name}</span>
          {/if}
          {#if product.specific_category_name && product.brand} • {/if}
          {#if product.brand}
            <span class="text-gray-700">{product.brand}</span>
          {/if}
          {#if (product.specific_category_name || product.brand) && product.size} • {/if}
          {#if product.size}
            <span class="text-gray-700">{translations.size} {product.size}</span>
          {/if}
        </p>
      {/snippet}
    </Tooltip>
  {:else}
    <p class="text-xs text-gray-700 line-clamp-1 leading-none mb-1">
      {#if product.specific_category_name}
        <span class="font-medium text-gray-700">{translations.categoryTranslation ? translations.categoryTranslation(product.specific_category_name) : product.specific_category_name}</span>
      {/if}
      {#if product.specific_category_name && product.brand} • {/if}
      {#if product.brand}
        <span class="text-gray-700">{product.brand}</span>
      {/if}
      {#if (product.specific_category_name || product.brand) && product.size} • {/if}
      {#if product.size}
        <span class="text-gray-700">{translations.size} {product.size}</span>
      {/if}
    </p>
  {/if}
{/snippet}

<button
  type="button"
  class="product-card cursor-pointer transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 rounded-[var(--radius-md)] {highlighted ? 'highlighted' : ''} {className} text-left block w-full p-0 border-0 bg-transparent"
  onclick={handleClick}
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
    
    <!-- Condition badge only -->
    {#if product.condition}
      {@render conditionBadgeWithTooltip(product.condition)}
    {/if}
  </div>
  
  <!-- Content -->
  <div class="px-1 pt-1.5 pb-1.5 relative">
    
    <!-- Wishlist button positioned absolutely -->
    <div class="absolute top-1.5 right-1 z-10">
      <FavoriteButton 
        {product}
        {favorited}
        {favoritesState}
        onFavorite={() => onFavorite?.(product.id)}
        addToFavoritesText={translations.addToFavorites}
        removeFromFavoritesText={translations.removeFromFavorites}
        absolute={false}
        showCount={true}
      />
    </div>
    
    <!-- Main Category (clean layout) -->
    <div class="min-h-3.5 mb-0.5 pr-12">
      {#if product.main_category_name || product.category_name}
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wider leading-none truncate">
          {translations.categoryTranslation ? translations.categoryTranslation(product.main_category_name || product.category_name || '') : (product.main_category_name || product.category_name)}
        </p>
      {/if}
    </div>
    
    <!-- Title with tooltip for truncated text -->
    <div class="pr-12">
      {@render titleWithTooltip(product.title, shouldShowTitleTooltip)}
    </div>
    
    <!-- Specific Category • Brand • Size with tooltip for truncated text -->
    {#if product.specific_category_name || product.brand || product.size}
      {@const fullDetailsText = [
        product.specific_category_name ? (translations.categoryTranslation ? translations.categoryTranslation(product.specific_category_name) : product.specific_category_name) : null,
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
</button>

<style>
  .product-card {
    position: relative;
  }
  
  .product-card.highlighted {
    border-color: var(--status-warning-solid);
    border-width: 2px;
  }
</style>