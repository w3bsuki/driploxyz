<script lang="ts">
  import type { Product } from './types.js';
  import ProductImage from './ProductImage.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import ProductPrice from './ProductPrice.svelte';
  import FavoriteButton from './FavoriteButton.svelte';
  import ProductMeta from './ProductMeta.svelte';
  
  interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    highlighted?: boolean;
    class?: string;
    priority?: boolean;
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
      fair: 'Fair'
    }
  }: Props = $props();

  function handleClick() {
    onclick?.(product);
  }
</script>

<div 
  class="product-card cursor-pointer {highlighted ? 'highlighted' : ''} {className}"
  onclick={handleClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabindex={0}
>
  <!-- Image Container with overlays -->
  <div class="relative">
    <ProductImage 
      product_images={product.product_images}
      images={product.images}
      alt={product.title}
      {priority}
    />
    
    <!-- Condition badge -->
    {#if product.condition}
      <ConditionBadge 
        condition={product.condition}
        translations={{
          brandNewWithTags: translations.brandNewWithTags,
          newWithoutTags: translations.newWithoutTags,
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
      {onFavorite}
      addToFavoritesText={translations.addToFavorites}
      removeFromFavoritesText={translations.removeFromFavorites}
    />
  </div>
  
  <!-- Content -->
  <div class="pt-2 space-y-0.5">
    <ProductMeta 
      mainCategoryName={product.main_category_name}
      categoryName={product.category_name}
      subcategoryName={product.subcategory_name}
      size={product.size}
      brand={product.brand}
      sizeText={translations.size}
      categoryTranslation={translations.categoryTranslation}
    />
    
    <h3 class="text-sm text-gray-900 line-clamp-1">{product.title}</h3>
    
    <ProductPrice 
      price={product.price}
      currency={translations.currency}
      formatPrice={translations.formatPrice}
    />
  </div>
</div>

<style>
  .product-card {
    position: relative;
  }
  
  .product-card.highlighted {
    padding: 3px;
    background: #FFD700;
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
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }
</style>