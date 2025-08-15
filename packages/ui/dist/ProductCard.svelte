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
  }

  let { 
    product, 
    onFavorite, 
    onclick,
    favorited = false,
    class: className = ''
  }: Props = $props();

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }

  function handleClick() {
    onclick?.(product);
  }

  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    'good': 'bg-yellow-100 text-yellow-800',
    'fair': 'bg-orange-100 text-orange-800'
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
    
    <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {conditionColors[product.condition]}">
        {product.condition}
      </span>
      
      {#if onFavorite}
        <button 
          onclick={handleFavorite}
          class="p-2 rounded-full bg-white/80"
          aria-label="Add to favorites"
        >
          <svg 
            class="w-5 h-5 {favorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
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
  </div>
  
  <div class="p-3 sm:p-4">
    <div class="flex justify-between items-start mb-1 sm:mb-2">
      <h3 class="font-semibold text-sm sm:text-base text-gray-900 truncate flex-1 mr-2">{product.title}</h3>
      <span class="text-base sm:text-lg font-bold text-gray-900">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
    </div>
    
    <div class="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600">
      {#if product.brand}
        <p class="truncate">{product.brand}</p>
      {/if}
      {#if product.size}
        <p>Size: {product.size}</p>
      {/if}
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 min-w-0">
          <Avatar 
            src={product.sellerAvatar} 
            name={product.sellerName} 
            size="xs" 
          />
          <span class="truncate text-xs">{product.sellerName || 'Unknown Seller'}</span>
        </div>
        {#if product.sellerRating !== undefined && product.sellerRating !== null}
          <div class="flex items-center">
            <svg class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="ml-0.5 sm:ml-1 text-xs">{product.sellerRating.toFixed(1)}</span>
          </div>
        {:else}
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            New Seller
          </span>
        {/if}
      </div>
    </div>
  </div>
</Card>