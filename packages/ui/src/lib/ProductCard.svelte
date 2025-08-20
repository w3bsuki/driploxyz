<script lang="ts">
  import type { Product } from './types.js';
  import Card from './Card.svelte';
  import OptimizedImage from './OptimizedImage.svelte';
  
  interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    highlighted?: boolean;
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
    highlighted = false,
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
  
  const conditionColors = {
    'new': 'bg-green-500 text-white',
    'like-new': 'bg-blue-500 text-white',
    'good': 'bg-yellow-500 text-white',
    'fair': 'bg-orange-500 text-white'
  };
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
  onmouseenter={() => {
    // Prefetch product page data on hover for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/product/${product.id}`;
        document.head.appendChild(link);
      });
    }
  }}
  role="button"
  tabindex={0}
>
  <!-- Image Container -->
  <div class="relative aspect-square bg-gray-50 overflow-hidden rounded-lg">
    <OptimizedImage
      src={typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.image_url || '/placeholder-product.svg'}
      alt={product.title}
      aspectRatio="square"
      loading="lazy"
      class="rounded-lg"
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      showSkeleton={true}
    />
    
    <!-- Condition badge - top left, subtle -->
    {#if product.condition}
      <div class="absolute top-2 left-2 px-2 py-0.5 {conditionColors[product.condition]} text-xs font-medium rounded uppercase">
        {conditionLabels[product.condition]}
      </div>
    {/if}
    
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
    position: relative;
    transition: all 0.3s ease;
  }
  
  .product-card:hover img {
    transform: scale(1.02);
    transition: transform 0.2s ease-out;
  }
  
  /* Premium highlighted product border */
  .product-card.highlighted {
    padding: 3px;
    background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FFA500);
    background-size: 300% 300%;
    animation: shimmer 3s ease infinite;
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
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  
  /* Shimmer animation for premium feel */
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  /* Alternative premium border styles - uncomment to use */
  
  /* Style 2: Gradient outline with glow */
  /*
  .product-card.highlighted {
    position: relative;
    padding: 2px;
    background: linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #FFD700);
    background-size: 400% 400%;
    animation: gradient-shift 4s ease infinite;
    border-radius: 0.75rem;
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  */
  
  /* Style 3: Luxury black and gold */
  /*
  .product-card.highlighted {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #FFD700 0%, #1a1a1a 25%, #FFD700 50%, #1a1a1a 75%, #FFD700 100%) border-box;
    background-size: 100% 100%, 300% 300%;
    animation: luxury-border 3s linear infinite;
    border-radius: 0.75rem;
  }
  
  @keyframes luxury-border {
    0% { background-position: 0% 0%, 0% 50%; }
    100% { background-position: 0% 0%, 100% 50%; }
  }
  */
</style>