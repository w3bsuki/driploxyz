<script lang="ts">
  import type { Product } from './types.js';
  import SoldOverlay from './SoldOverlay.svelte';
  import Avatar from './Avatar.svelte';

  interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    class?: string;
    translations?: {
      size?: string;
      newSeller?: string;
      unknownSeller?: string;
      currency?: string;
      addToFavorites?: string;
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
      newSeller: 'New Seller',
      unknownSeller: 'Unknown Seller',
      currency: '$',
      addToFavorites: 'Add to favorites',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair'
    }
  }: Props = $props();
  
  let isHovered = $state(false);
  let showSellerInfo = $state(false);

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }

  function handleClick() {
    onclick?.(product);
  }

  function handleMouseEnter() {
    isHovered = true;
    showSellerInfo = true;
  }

  function handleMouseLeave() {
    isHovered = false;
    showSellerInfo = false;
  }

  const conditionLabels = $derived({
    'new': translations.new || 'New',
    'like-new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'fair': translations.fair || 'Fair'
  });

  const formattedPrice = $derived(
    translations.formatPrice 
      ? translations.formatPrice(product.price) 
      : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`
  );
</script>

<!-- Main Card Container -->
<div 
  class="group relative cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] {className}"
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <!-- Card Shadow and Background -->
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
    
    <!-- Image Container -->
    <div class="relative aspect-square overflow-hidden">
      <img 
        src={product.images[0] || '/placeholder-product.svg'} 
        alt={product.title}
        class="w-full h-full object-cover transition-transform duration-300 {isHovered ? 'scale-105' : 'scale-100'}"
        loading="lazy"
      />
      
      <!-- Sold Overlay -->
      <SoldOverlay 
        show={product.is_sold || false} 
        soldAt={product.sold_at} 
      />
      
      <!-- Floating Seller Badge - Glass Morphism -->
      <div class="absolute bottom-3 left-3">
        <div 
          class="flex items-center backdrop-blur-md bg-white/80 rounded-full shadow-sm border border-white/20 transition-all duration-200 {showSellerInfo ? 'pr-3' : 'pr-1'}"
          onclick={(e) => e.stopPropagation()}
        >
          <div class="p-1">
            <Avatar 
              src={product.sellerAvatar} 
              name={product.sellerName} 
              size="xs"
              onclick={(e) => e.stopPropagation()}
            />
          </div>
          {#if showSellerInfo}
            <div class="ml-2 min-w-0">
              <div class="text-xs font-medium text-gray-800 truncate">
                {product.sellerName || translations.unknownSeller}
              </div>
              {#if product.sellerRating !== undefined && product.sellerRating !== null}
                <div class="text-xs text-amber-600 font-medium">★ {product.sellerRating.toFixed(1)}</div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Favorite Button - Top Right -->
      {#if onFavorite}
        <button 
          onclick={handleFavorite}
          class="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/80 border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/90"
          aria-label={translations.addToFavorites}
        >
          <svg 
            class="w-4 h-4 transition-colors {favorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
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
    
    <!-- Content Section -->
    <div class="p-4 space-y-2">
      <!-- Brand and Category Row -->
      <div class="flex items-center justify-between min-h-[16px]">
        <div class="flex items-center gap-2 text-xs">
          {#if product.brand}
            <span class="font-medium text-gray-600 uppercase tracking-wide">{product.brand}</span>
          {/if}
          {#if product.category && product.brand}
            <span class="text-gray-300">•</span>
          {/if}
          {#if product.category}
            <span class="text-gray-400 uppercase tracking-wider">{product.category}</span>
          {/if}
        </div>
        <!-- Condition Badge - Minimal -->
        <span class="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
          {conditionLabels[product.condition] || product.condition}
        </span>
      </div>
      
      <!-- Product Title -->
      <h3 class="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm">
        {product.title}
      </h3>
      
      <!-- Size -->
      {#if product.size}
        <div class="text-xs text-gray-500">
          {translations.size} {product.size}
        </div>
      {/if}
      
      <!-- Price -->
      <div class="pt-1">
        <span class="text-lg font-bold text-gray-900">
          {formattedPrice}
        </span>
      </div>
    </div>
  </div>
</div>