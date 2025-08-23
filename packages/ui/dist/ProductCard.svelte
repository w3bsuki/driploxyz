<script lang="ts">
  import { browser } from '$app/environment';
  import type { Product } from './types.js';
  import ProductImage from './ProductImage.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import ProductPrice from './ProductPrice.svelte';
  import FavoriteButton from './FavoriteButton.svelte';
  import { PerformanceMonitor } from './utils/performance.js';
  
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
  
  // Performance monitoring
  const perf = browser ? PerformanceMonitor.getInstance() : null;
  let renderStartTime = $state(0);
  
  // Track component render time
  $effect(() => {
    if (perf && browser) {
      renderStartTime = performance.now();
      return () => {
        const renderTime = performance.now() - renderStartTime;
        if (renderTime > 50) {
          console.warn(`ProductCard render took ${renderTime.toFixed(2)}ms for product: ${product.title}`);
        }
      };
    }
  });

  function handleClick() {
    perf?.startTiming(`product-click-${product.id}`);
    onclick?.(product);
    perf?.endTiming(`product-click-${product.id}`);
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
      {onFavorite}
      addToFavoritesText={translations.addToFavorites}
      removeFromFavoritesText={translations.removeFromFavorites}
    />
  </div>
  
  <!-- Content -->
  <div class="pt-2 space-y-1">
    <!-- Category (top) -->
    {#if product.main_category_name || product.category_name}
      <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {translations.categoryTranslation ? translations.categoryTranslation(product.main_category_name || product.category_name || '') : (product.main_category_name || product.category_name)}
      </p>
    {/if}
    
    <!-- Title (second) -->
    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{product.title}</h3>
    
    <!-- Subcategory/Brand/Size row (third - below title) -->
    {#if product.subcategory_name || product.brand || product.size}
      <p class="text-xs text-gray-500 line-clamp-1">
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
    
    <!-- Price (bottom) -->
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