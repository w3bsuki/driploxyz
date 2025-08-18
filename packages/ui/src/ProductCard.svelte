<script lang="ts">
  import type { Product } from './types.js';
  import Card from './Card.svelte';
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
  
  let showSellerName = $state(false);

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }

  function handleClick() {
    onclick?.(product);
  }

  const conditionColors = {
    'new': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'like-new': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'good': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'fair': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200'
  };
  
  const conditionLabels = {
    'new': translations.new || 'New',
    'like-new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'fair': translations.fair || 'Fair'
  };
</script>

<Card class={`overflow-hidden ${className}`} padding={false} hover={true} onclick={handleClick}>
  <div class="relative">
    <img 
      src={product.images[0] || '/placeholder-product.svg'} 
      alt={product.title}
      class="w-full aspect-square object-cover"
    />
    
    <!-- Sold Overlay -->
    <SoldOverlay 
      show={product.is_sold || false} 
      soldAt={product.sold_at} 
    />
    
    <div class="absolute top-2 left-2 right-2 flex items-center justify-between">
      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm {conditionColors[product.condition]}">
        {conditionLabels[product.condition] || product.condition}
      </span>
      
      {#if onFavorite}
        <button 
          onclick={handleFavorite}
          class="p-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
          aria-label={translations.addToFavorites}
        >
          <svg 
            class="w-4 h-4 transition-colors {favorited ? 'text-red-500 fill-current' : 'text-gray-700 hover:text-red-500'}" 
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
    
    <!-- Seller Avatar on Image with expandable name -->
    <div class="absolute bottom-2 left-2">
      <button 
        class="flex items-center bg-white/90 backdrop-blur rounded-full shadow-sm transition-all duration-200 ease-out {showSellerName ? 'pr-3' : ''}"
        onmouseenter={() => showSellerName = true}
        onmouseleave={() => showSellerName = false}
        onclick={(e) => e.stopPropagation()}
      >
        <div class="p-0.5">
          <Avatar 
            src={product.sellerAvatar} 
            name={product.sellerName} 
            size="xs" 
          />
        </div>
        {#if showSellerName}
          <span class="text-xs font-medium text-gray-700 ml-1.5 whitespace-nowrap overflow-hidden">
            {product.sellerName || translations.unknownSeller}
            {#if product.sellerRating !== undefined && product.sellerRating !== null}
              <span class="text-amber-600 ml-1">★{product.sellerRating.toFixed(1)}</span>
            {/if}
          </span>
        {/if}
      </button>
    </div>
  </div>
  
  <div class="px-3 py-2.5">
    <!-- Product Title -->
    <h3 class="font-semibold text-[13px] text-gray-900 leading-tight truncate">{product.title}</h3>
    
    <!-- Brand, Size, Category - SINGLE ROW -->
    <div class="text-[11px] text-gray-500 mt-1 truncate">
      {#if product.brand}<span class="font-medium text-gray-600">{product.brand}</span>{/if}{#if product.brand && (product.size || product.category)}<span class="mx-1">•</span>{/if}{#if product.size}Size {product.size}{/if}{#if product.size && product.category}<span class="mx-1">•</span>{/if}{#if product.category}<span class="uppercase">{product.category}</span>{/if}
    </div>
    
    <!-- Price -->
    <div class="mt-1.5">
      <span class="text-[15px] font-bold text-gray-900">
        {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}
      </span>
    </div>
  </div>
</Card>