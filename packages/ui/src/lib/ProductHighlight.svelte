<script lang="ts">
  import type { Product } from './types/product';
  import FavoriteButton from './FavoriteButton.svelte';
  
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
    categoryTranslation?: (category: string) => string;
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
    totalCount = 1,
    categoryTranslation = (category: string) => category
  }: Props = $props();
  
  // Derived states
  const imageUrl = $derived(
    (product.product_images && product.product_images[0]?.image_url) ||
    product.images?.[0] ||
    '/placeholder-product.svg'
  );
  
  const sellerInitial = $derived(
    (product.sellerName || 'S').charAt(0).toUpperCase()
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
  <div class="shrink-0" style="width: calc(50vw - 8px);"><!-- Exactly 2 cards visible, 3rd partially hidden -->
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
        <div class="aspect-square w-full overflow-hidden rounded-[var(--card-radius)]" style="background-color: oklch(0.96 0.005 270);">
          <img
            src={imageUrl}
            alt="{product.title} product image"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <!-- Overlay row: subtle PRO badge and favorite (right) -->
        <div class="absolute top-2 left-2 right-2 z-20 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            {#if product.is_featured}
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm bg-white/85 text-gray-900 border border-gray-200">PRO</span>
            {/if}
          </div>
          <div>
            <FavoriteButton
              {product}
              favorited={isFavorite}
              onFavorite={() => onToggleFavorite?.(product.id)}
              absolute={false}
              showCount={true}
            />
          </div>
        </div>
      </div>
      
      <!-- Content - EXACT copy from ProductCard -->
      <div class="px-1 pt-1.5 pb-1.5 relative">
        
        <!-- Main Category (always show) -->
        <div class="flex items-center justify-between gap-1.5 min-h-3.5 mb-0.5 pr-12">
          {#if product.main_category_name || product.category_name}
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider leading-none flex-1 truncate">
              {categoryTranslation(product.main_category_name || product.category_name || '')}
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
              <span class="font-medium text-gray-500">{categoryTranslation(product.subcategory_name)}</span>
            {/if}
            {#if product.subcategory_name && product.brand} • {/if}
            {#if product.brand}
              <span class="text-gray-500">{product.brand}</span>
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
    {#if product.sellerName}
      <p>Sold by {product.sellerName}</p>
    {/if}
    {#if product.condition}
      <p>Condition: {product.condition}</p>
    {/if}
    {#if Array.isArray((product as any).sizes) && (product as any).sizes.length}
      <p>Available sizes: {(product as any).sizes.join(', ')}</p>
    {/if}
  </div>
</article>
