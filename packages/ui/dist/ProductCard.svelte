<script lang="ts">
  import type { Product } from './types.js';
  import Card from './Card.svelte';
  
  interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    class?: string;
    translations?: {
      size?: string;
      currency?: string;
      addToFavorites?: string;
      removeFromFavorites?: string;
      new?: string;
      likeNew?: string;
      good?: string;
      fair?: string;
      formatPrice?: (price: number) => string;
    };
  }

  let { 
    product, 
    onFavorite, 
    onclick,
    favorited = false,
    class: className = '',
    translations = {
      size: 'Size',
      currency: '$',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair'
    }
  }: Props = $props();

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }

  function handleClick() {
    onclick?.(product);
  }

  const conditionLabels = {
    'new': translations.new || 'New',
    'like-new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'fair': translations.fair || 'Fair'
  };
</script>

<div 
  class="product-card cursor-pointer {className}"
  onclick={handleClick}
  role="button"
  tabindex={0}
>
  <!-- Image Container -->
  <div class="relative aspect-square bg-gray-50 overflow-hidden rounded-lg">
    <img 
      src={product.images[0] || '/placeholder-product.svg'} 
      alt={product.title}
      class="w-full h-full object-cover"
      loading="lazy"
    />
    
    <!-- Favorite button - top right, subtle -->
    {#if onFavorite}
      <button 
        onclick={handleFavorite}
        class="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label={favorited ? translations.removeFromFavorites : translations.addToFavorites}
      >
        <svg 
          class="w-4 h-4 {favorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
          viewBox="0 0 20 20"
        >
          <path 
            fill-rule="evenodd" 
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
            clip-rule="evenodd" 
          />
        </svg>
      </button>
    {/if}
  </div>
  
  <!-- Content - minimal spacing -->
  <div class="pt-2 space-y-0.5">
    <!-- Brand - small, muted -->
    {#if product.brand}
      <p class="text-xs text-gray-500">{product.brand}</p>
    {/if}
    
    <!-- Title - normal weight, not bold -->
    <h3 class="text-sm text-gray-900 line-clamp-1">{product.title}</h3>
    
    <!-- Size and Condition - single line, muted -->
    <p class="text-xs text-gray-500">
      {#if product.size}{translations.size} {product.size}{/if}
      {#if product.size && product.condition} · {/if}
      {#if product.condition}{conditionLabels[product.condition]}{/if}
    </p>
    
    <!-- Price - slightly larger, normal weight -->
    <p class="text-sm text-gray-900">
      {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${product.price}`}
    </p>
  </div>
</div>

<style>
  .product-card {
    /* Remove all the extra styling */
  }
  
  .product-card:hover img {
    /* Subtle scale on hover */
    transform: scale(1.02);
    transition: transform 0.2s ease-out;
  }
</style>