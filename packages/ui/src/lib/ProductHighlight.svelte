<script lang="ts">
  import type { Product } from '../types';
  
  interface Props {
    product: Product;
    onProductClick?: (product: Product) => void;
    onBuy?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorite?: boolean;
    isLoadingFavorite?: boolean;
    currency?: string;
    formatPrice?: (price: number) => string;
    index?: number;
    totalCount?: number;
  }

  let { 
    product, 
    onProductClick,
    onBuy,
    onToggleFavorite,
    isFavorite = false,
    isLoadingFavorite = false,
    currency = '$', 
    formatPrice = (price: number) => `${currency}${price.toFixed(2)}`,
    index = 0,
    totalCount = 1
  }: Props = $props();
  
  // Derived states
  const imageUrl = $derived(
    product.images?.[0]?.image_url || 
    product.images?.[0] || 
    '/placeholder-product.svg'
  );
  
  const sellerInitial = $derived(
    product.seller_name?.charAt(0).toUpperCase() || 'S'
  );
  
  const formattedPrice = $derived(
    formatPrice(product.price)
  );
  
  function handleClick() {
    onProductClick?.(product);
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<article 
  class="relative shrink-0 group"
  aria-label="Product: {product.title}"
>
  <!-- Product Card -->
  <div class="w-40 shrink-0">
    <!-- Main Card Container -->
    <div class="product-card cursor-pointer w-full">
      
      <!-- Main Product Button -->
      <button 
        onclick={handleClick}
        onkeydown={handleKeyDown}
        class="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 z-10 min-h-[44px]"
        aria-label="View {product.title} - {formattedPrice}"
        aria-describedby="product-{product.id}-info"
        tabindex={index === 0 ? 0 : -1}
      >
        <span class="sr-only">View product details</span>
      </button>
      
      <!-- Image Container with overlays -->
      <div class="relative w-full">
        <!-- Product Image -->
        <div class="aspect-square w-full overflow-hidden rounded-lg" style="background-color: oklch(0.96 0.005 270);">
          <img 
            src={imageUrl} 
            alt="{product.title} product image"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <!-- PRO Badge -->
        {#if product.is_promoted}
          <div class="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wide" style="background-color: oklch(0.15 0.015 270); color: oklch(1 0 0);">
            PRO
          </div>
        {/if}
      </div>
      
      <!-- Content - EXACT copy from ProductCard -->
      <div class="px-1 pt-1.5 pb-1.5 relative">
        <!-- Favorite button positioned over content area -->
        <div class="absolute top-1 right-1 z-10">
          <button
            onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
            class="w-7 h-7 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 pointer-events-auto"
            aria-label={isFavorite ? 'Add to favorites' : 'Remove from favorites'}
          >
            <svg class="w-3 h-3 {isFavorite ? 'text-red-500' : 'text-gray-600'}" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <!-- Main Category (always show) -->
        <div class="flex items-center justify-between gap-1.5 min-h-3.5 mb-0.5 pr-12">
          {#if product.main_category_name || product.category_name}
            <p class="text-xs font-medium text-gray-600 uppercase tracking-wider leading-none flex-1 truncate">
              {product.main_category_name || product.category_name}
            </p>
          {/if}
        </div>
        
        <!-- Title -->
        <h3 class="text-sm font-medium text-gray-900 line-clamp-1 leading-none mb-0.5 pr-12">
          {product.title}
        </h3>
        
        <!-- Subcategory • Brand • Size -->
        {#if product.subcategory_name || product.brand || product.size}
          <p class="text-xs text-gray-500 line-clamp-1 leading-none mb-1">
            {#if product.subcategory_name}
              <span class="font-medium text-gray-600">{product.subcategory_name}</span>
            {/if}
            {#if product.subcategory_name && product.brand} • {/if}
            {#if product.brand}
              <span class="text-gray-600">{product.brand}</span>
            {/if}
            {#if (product.subcategory_name || product.brand) && product.size} • {/if}
            {#if product.size}
              <span class="text-gray-500">Size {product.size}</span>
            {/if}
          </p>
        {/if}
        
        <!-- Price -->
        <div class="-mt-0.5">
          <div class="text-base font-semibold text-gray-900 leading-none">
            {formattedPrice}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Screen reader info -->
  <div id="product-{product.id}-info" class="sr-only">
    <p>Product {index + 1} of {totalCount}</p>
    <p>Price: {formattedPrice}</p>
    {#if product.seller_name}
      <p>Sold by {product.seller_name}</p>
    {/if}
    {#if product.condition}
      <p>Condition: {product.condition}</p>
    {/if}
    {#if product.sizes?.length}
      <p>Available sizes: {product.sizes.join(', ')}</p>
    {/if}
  </div>
</article>
