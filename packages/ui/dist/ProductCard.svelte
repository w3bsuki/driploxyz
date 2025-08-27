<script lang="ts">
  import type { Product } from '../types';
  import ProductImage from './ProductImage.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import ProductPrice from './ProductPrice.svelte';
  import FavoriteButton from './FavoriteButton.svelte';
  import UserBadge from './UserBadge.svelte';
  
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
</script>

<div 
  class="product-card cursor-pointer transition-shadow duration-150 hover:shadow-md {highlighted ? 'highlighted' : ''} {className}"
  onclick={handleClick}
  onkeydown={(e) => {
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
    
    <!-- Condition badge -->
    {#if product.condition}
      <ConditionBadge 
        condition={product.condition}
        translations={{
          brandNewWithTags: translations.brandNewWithTags,
          newWithoutTags: translations.newWithoutTags || translations.new,
          likeNew: translations.likeNew,
          good: translations.good,
          worn: translations.worn,
          fair: translations.fair
        }}
      />
    {/if}
    
    <!-- Favorite button -->
    <FavoriteButton 
      {product}
      {favorited}
      onFavorite={() => onFavorite?.(product.id)}
      addToFavoritesText={translations.addToFavorites}
      removeFromFavoritesText={translations.removeFromFavorites}
    />
  </div>
  
  <!-- Content -->
  <div class="px-2 pt-1.5 pb-1.5">
    <div class="flex items-center gap-1.5 min-h-[14px]">
      {#if product.main_category_name || product.category_name}
        <p class="text-[11px] font-medium text-gray-600 uppercase tracking-wider leading-none flex-1 truncate">
          {translations.categoryTranslation ? translations.categoryTranslation(product.main_category_name || product.category_name || '') : (product.main_category_name || product.category_name)}
        </p>
      {/if}
      {#if product.is_promoted}
        <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-yellow-50 border border-yellow-200/60">
          <span class="text-yellow-600 font-bold">PRO</span>
        </span>
      {/if}
    </div>
    
    <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none">
      {product.title}
    </h3>
    
    {#if product.subcategory_name || product.brand || product.size}
      <p class="text-xs text-gray-500 line-clamp-1 leading-none">
        {#if product.subcategory_name}
          <span class="font-medium text-gray-600">{translations.categoryTranslation ? translations.categoryTranslation(product.subcategory_name) : product.subcategory_name}</span>
        {/if}
        {#if product.subcategory_name && product.brand} • {/if}
        {#if product.brand}
          <span class="text-gray-600">{product.brand}</span>
        {/if}
        {#if (product.subcategory_name || product.brand) && product.size} • {/if}
        {#if product.size}
          <span class="text-gray-500">{translations.size} {product.size}</span>
        {/if}
      </p>
    {/if}
    
    <div class="-mt-1">
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
    padding: 3px;
    background: linear-gradient(135deg, 
      oklch(0.9 0.15 85),  /* Yellow highlight */
      oklch(0.95 0.1 85)   /* Lighter yellow */
    );
    border-radius: 0.75rem;
  }
  
  .product-card.highlighted::before {
    content: '';
    position: absolute;
    inset: 3px;
    background: white;
    border-radius: 0.5rem;
    z-index: -1;
  }
  
  .product-card.highlighted > div:first-child {
    box-shadow: 0 4px 12px oklch(0.8 0.12 85 / 0.2);
  }
</style>