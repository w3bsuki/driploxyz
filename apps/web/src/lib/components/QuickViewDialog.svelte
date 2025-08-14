<script lang="ts">
  import { Avatar, Button, ProductCard, type Product } from '@repo/ui';
  import { goto } from '$app/navigation';
  
  interface Seller {
    id: number;
    name: string;
    avatar: string | null;
    premium: boolean;
    rating?: number;
    itemCount?: number;
    followers?: number;
    description?: string;
  }
  
  interface Props {
    seller: Seller | null;
    products?: Product[];
    onclose: () => void;
  }
  
  let { seller = null, products = [], onclose }: Props = $props();
  
  // Mock products for the seller
  const mockSellerProducts: Product[] = Array.from({ length: 4 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Premium Item ${i + 1}`,
    description: 'Exclusive item from premium seller',
    price: 45 + (i * 15),
    images: ['/placeholder-product.svg'],
    brand: ['Gucci', 'Prada', 'Louis Vuitton', 'Chanel'][i % 4],
    size: ['S', 'M', 'L', 'XL'][i % 4],
    condition: 'like-new' as const,
    category: 'Fashion',
    sellerId: `seller-${seller?.id}`,
    sellerName: seller?.name || '',
    sellerRating: 4.5,
    createdAt: new Date().toISOString(),
    location: 'New York, NY'
  }));
  
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }
  
  function viewProfile() {
    onclose();
    goto(`/profile/${seller?.id}`);
  }
  
  function viewProduct(productId: string) {
    onclose();
    goto(`/product/${productId}`);
  }
</script>

{#if seller}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 sm:pb-4"
    onclick={handleBackdropClick}
  >
    <!-- Dialog -->
    <div class="bg-white rounded-2xl max-w-md w-full max-h-[65vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="relative flex-shrink-0">
        <!-- Cover Image -->
        <div class="h-20 sm:h-28 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-400"></div>
        
        <!-- Close Button -->
        <button
          onclick={onclose}
          class="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Seller Info -->
        <div class="px-4 sm:px-6 -mt-10 sm:-mt-12">
          <div class="flex items-end space-x-3">
            <div class="relative">
              <Avatar 
                src={seller.avatar} 
                name={seller.name} 
                size="lg" 
                premium={seller.premium}
              />
              {#if seller.premium}
                <span class="absolute -top-1 left-1/2 -translate-x-1/2 text-sm bg-white rounded-full p-0.5 shadow-sm">👑</span>
              {/if}
            </div>
            <div class="flex-1 pb-1">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900">{seller.name}</h2>
              <div class="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                {#if seller.rating}
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="ml-1">{seller.rating}</span>
                  </div>
                {/if}
                {#if seller.itemCount}
                  <span>{seller.itemCount} items</span>
                {/if}
                {#if seller.followers}
                  <span>{seller.followers} followers</span>
                {/if}
              </div>
            </div>
          </div>
          
          {#if seller.description}
            <p class="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">{seller.description}</p>
          {/if}
          
          <!-- Action Buttons -->
          <div class="flex space-x-2 mt-3">
            <button onclick={viewProfile} class="flex-1 py-1.5 bg-black text-white text-sm rounded-lg">
              View Profile
            </button>
            <button class="flex-1 py-1.5 border border-gray-300 text-sm rounded-lg">
              Follow
            </button>
          </div>
        </div>
      </div>
      
      <!-- Products Section -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
        <h3 class="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Featured Items</h3>
        <div class="grid grid-cols-2 gap-2 sm:gap-3">
          {#each products.length > 0 ? products : mockSellerProducts as product}
            <div class="cursor-pointer" onclick={() => viewProduct(product.id)} role="button" tabindex="0">
              <div class="relative">
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  class="w-full aspect-square object-cover rounded-lg"
                />
                <button 
                  onclick={(e) => {
                    e.stopPropagation();
                    console.log('Add to wishlist:', product.id);
                  }}
                  class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full"
                  aria-label="Add to wishlist"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div class="mt-1.5">
                <p class="text-[10px] sm:text-xs text-gray-600 truncate">{product.brand}</p>
                <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.title}</p>
                <p class="text-xs sm:text-sm font-bold">${product.price}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- View All Link -->
        <div class="mt-3 text-center">
          <button 
            onclick={viewProfile}
            class="text-xs sm:text-sm text-gray-600 font-medium"
          >
            View all {seller.itemCount || 20}+ items →
          </button>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t px-4 py-2 bg-gray-50 flex-shrink-0">
        <p class="text-[10px] sm:text-xs text-center text-gray-500">
          <span class="inline-flex items-center">
            <span class="text-yellow-500 mr-1">👑</span>
            Promoted Seller
          </span>
        </p>
      </div>
    </div>
  </div>
{/if}