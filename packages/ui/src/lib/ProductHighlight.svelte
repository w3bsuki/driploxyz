<script lang="ts">
  import type { Product } from './types.js';
  
  interface Props {
    product: Product;
    onProductClick?: (product: Product) => void;
    onBuy?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    isFavorite?: boolean;
    currency?: string;
    formatPrice?: (price: number) => string;
  }

  let { 
    product, 
    onProductClick,
    onBuy,
    onToggleFavorite,
    isFavorite = false,
    currency = '$', 
    formatPrice 
  }: Props = $props();
  
  function handleClick() {
    onProductClick?.(product);
  }
</script>

<button 
  onclick={handleClick}
  class="relative shrink-0 group block"
>
  <div class="group">
    <div class="relative rounded-2xl shadow-sm bg-white p-1">
      <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
        <!-- Product image -->
        <div class="w-32 h-32 sm:w-40 sm:h-40 relative">
          <img 
            src={product.images?.[0]?.image_url || product.images?.[0] || '/placeholder-product.svg'} 
            alt={product.title}
            class="w-full h-full object-cover"
          />
          
          <!-- Bottom info -->
          <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <!-- Seller avatar -->
            <div class="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
              <div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                {product.seller_name?.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>
            
            <!-- Price badge -->
            <div class="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm">
              {formatPrice ? formatPrice(product.price) : `${currency}${product.price}`}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Title below -->
    <div class="mt-1.5 px-1 w-32 sm:w-40">
      <p class="text-xs text-gray-700 truncate">
        {product.title}
      </p>
    </div>
  </div>
</button>

<style>
  button {
    transition: opacity 0.15s ease;
  }
  
  button:hover {
    opacity: 0.95;
  }
  
  button:active {
    opacity: 0.9;
  }
</style>