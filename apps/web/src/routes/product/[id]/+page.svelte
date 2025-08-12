<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Avatar, ProductCard, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  const productId = $page.params.id;
  
  // Mock product data
  const product: Product = {
    id: productId,
    title: 'Vintage Levi\'s Denim Jacket',
    description: 'Classic vintage Levi\'s trucker jacket from the 1990s. Excellent condition with minimal wear. Features the iconic two-pocket design with button closure. Perfect medium wash that goes with everything.\n\nMeasurements:\n• Chest: 22"\n• Length: 24"\n• Sleeve: 25"\n\nAuthenticity guaranteed. Check out my other vintage finds!',
    price: 89,
    originalPrice: 120,
    images: [
      '/placeholder-product.svg',
      '/placeholder-product.svg',
      '/placeholder-product.svg',
      '/placeholder-product.svg'
    ],
    brand: 'Levi\'s',
    size: 'M',
    condition: 'like-new' as const,
    category: 'Jackets',
    sellerId: 'seller-123',
    sellerName: 'VintageFinds',
    sellerRating: 4.8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'New York, NY',
    views: 234,
    favorites: 45
  };
  
  // Additional product details
  const productDetails = {
    color: 'Medium Wash Blue',
    material: '100% Cotton Denim',
    shippingPrice: 8.99,
    responseTime: '< 1 hour',
    sellerItemCount: 342,
    sellerFollowers: 1892,
    isPremiumSeller: true,
    isVerified: true,
    tags: ['vintage', 'denim', 'levis', '90s', 'streetwear', 'unisex']
  };
  
  // Mock similar products
  const similarProducts: Product[] = Array.from({ length: 6 }, (_, i) => ({
    id: `similar-${i + 1}`,
    title: `Similar Item ${i + 1}`,
    description: 'Great condition item',
    price: Math.floor(Math.random() * 100) + 50,
    images: ['/placeholder-product.svg'],
    brand: ['Nike', 'Adidas', 'Zara', 'H&M'][i % 4],
    size: ['S', 'M', 'L', 'XL'][i % 4],
    condition: 'good' as const,
    category: 'Jackets',
    sellerId: `seller-${i}`,
    sellerName: `Seller ${i}`,
    sellerRating: 4 + Math.random(),
    createdAt: new Date().toISOString(),
    location: 'New York, NY'
  }));
  
  // State
  let selectedImageIndex = $state(0);
  let showSizeGuide = $state(false);
  let isFavorited = $state(false);
  let showShareMenu = $state(false);
  
  function handleBuyNow() {
    console.log('Buy now:', product.id);
    window.location.href = '/checkout';
  }
  
  function handleMakeOffer() {
    console.log('Make offer:', product.id);
    window.location.href = `/offer/${product.sellerId}`;
  }
  
  function handleMessage() {
    window.location.href = '/messages';
  }
  
  function toggleFavorite() {
    isFavorited = !isFavorited;
  }
  
  function handleShare() {
    showShareMenu = !showShareMenu;
  }
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    const hours = Math.floor(seconds / (60 * 60));
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
</script>

<svelte:head>
  <title>{product.title} - ${product.price} | Driplo</title>
  <meta name="description" content="{product.description.substring(0, 160)}" />
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-32 lg:pb-0">
  <Header />
  
  <div class="max-w-7xl mx-auto lg:px-8">
    <div class="lg:grid lg:grid-cols-2 lg:gap-8 lg:py-8">
      <!-- Images Section -->
      <div class="bg-white lg:rounded-lg lg:shadow-sm lg:sticky lg:top-24 lg:h-fit">
        <!-- Main Image -->
        <div class="relative aspect-square bg-gray-100">
          <img 
            src={product.images[selectedImageIndex]} 
            alt={product.title}
            class="w-full h-full object-cover"
          />
          
          <!-- Image Navigation Dots -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {#each product.images as _, i}
              <button
                onclick={() => selectedImageIndex = i}
                class="w-2 h-2 rounded-full transition-colors
                  {selectedImageIndex === i ? 'bg-white' : 'bg-white/50'}"
                aria-label="View image {i + 1}"
              />
            {/each}
          </div>
          
          <!-- Mobile Favorite & Share -->
          <div class="absolute top-4 right-4 flex space-x-2 lg:hidden">
            <button
              onclick={toggleFavorite}
              class="p-2.5 bg-white rounded-full shadow-lg"
              aria-label="Add to favorites"
            >
              <svg class="w-5 h-5 {isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onclick={handleShare}
              class="p-2.5 bg-white rounded-full shadow-lg"
              aria-label="Share"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Thumbnail Images -->
        <div class="flex space-x-2 p-4 overflow-x-auto">
          {#each product.images as image, i}
            <button
              onclick={() => selectedImageIndex = i}
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                {selectedImageIndex === i ? 'border-black' : 'border-transparent'}"
            >
              <img src={image} alt="View {i + 1}" class="w-full h-full object-cover" />
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Product Info Section -->
      <div class="bg-white lg:bg-transparent">
        <div class="p-4 sm:p-6 lg:p-0">
          <!-- Title and Price -->
          <div class="mb-4">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div class="flex items-baseline space-x-3">
              <span class="text-3xl font-bold text-gray-900">${product.price}</span>
              {#if product.originalPrice}
                <span class="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                <span class="text-sm font-medium text-green-600">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              {/if}
            </div>
          </div>
          
          <!-- Desktop Favorite & Share -->
          <div class="hidden lg:flex items-center space-x-3 mb-6">
            <button
              onclick={toggleFavorite}
              class="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Add to favorites"
            >
              <svg class="w-5 h-5 {isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onclick={handleShare}
              class="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Share"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
            </button>
          </div>
          
          <!-- Product Details Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-500">Brand</p>
              <p class="font-medium">{product.brand}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Size</p>
              <p class="font-medium">{product.size}</p>
              <button onclick={() => showSizeGuide = true} class="text-xs text-blue-600 hover:underline">
                Size Guide
              </button>
            </div>
            <div>
              <p class="text-sm text-gray-500">Condition</p>
              <p class="font-medium capitalize">{product.condition.replace('-', ' ')}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Color</p>
              <p class="font-medium">{productDetails.color}</p>
            </div>
          </div>
          
          <!-- Description -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2">Description</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
          
          <!-- Tags -->
          <div class="mb-6">
            <div class="flex flex-wrap gap-2">
              {#each productDetails.tags as tag}
                <a href="/search?tag={tag}" class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                  #{tag}
                </a>
              {/each}
            </div>
          </div>
          
          <!-- Stats -->
          <div class="flex items-center space-x-6 text-sm text-gray-500 mb-6">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {product.views} views
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {product.favorites} favorites
            </span>
            <span>Posted {timeAgo(product.createdAt)}</span>
          </div>
          
          <!-- Seller Info Card -->
          <div class="border rounded-lg p-4 mb-6">
            <div class="flex items-start justify-between mb-3">
              <a href="/profile/{product.sellerId}" class="flex items-center space-x-3">
                <Avatar 
                  src="/placeholder-product.svg"
                  name={product.sellerName}
                  size="md"
                  premium={productDetails.isPremiumSeller}
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-gray-900 hover:underline">
                      {product.sellerName}
                    </span>
                    {#if productDetails.isVerified}
                      <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </div>
                  <div class="flex items-center space-x-3 text-sm text-gray-600">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 text-yellow-400 fill-current mr-1" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {product.sellerRating}
                    </span>
                    <span>{productDetails.sellerItemCount} sold</span>
                  </div>
                </div>
              </a>
              <Button onclick={() => window.location.href = `/profile/${product.sellerId}`} variant="outline" size="sm">
                View Shop
              </Button>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Response time</p>
                <p class="font-medium">{productDetails.responseTime}</p>
              </div>
              <div>
                <p class="text-gray-500">Followers</p>
                <p class="font-medium">{productDetails.sellerFollowers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <!-- Shipping Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{product.location}</p>
                <p class="text-sm text-gray-600 mt-1">Standard shipping: ${productDetails.shippingPrice}</p>
                <p class="text-xs text-gray-500 mt-1">Usually ships within 1-2 business days</p>
              </div>
            </div>
          </div>
          
          <!-- Buyer Protection -->
          <div class="bg-blue-50 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <p class="font-medium text-blue-900">Buyer Protection</p>
                <p class="text-sm text-blue-700 mt-1">Get a refund if the item isn't as described</p>
              </div>
            </div>
          </div>
          
          <!-- Desktop Actions -->
          <div class="hidden lg:block space-y-3">
            <Button onclick={handleBuyNow} size="lg" class="w-full">
              Buy Now - ${product.price + productDetails.shippingPrice}
            </Button>
            <Button onclick={handleMakeOffer} variant="outline" size="lg" class="w-full">
              Make Offer
            </Button>
            <Button onclick={handleMessage} variant="outline" size="lg" class="w-full">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message Seller
            </Button>
          </div>
        </div>
        
        <!-- Similar Items -->
        <div class="p-4 sm:p-6 lg:p-0 lg:pt-8">
          <h2 class="text-lg font-semibold mb-4">You might also like</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {#each similarProducts.slice(0, 6) as item}
              <ProductCard 
                product={item}
                onclick={() => window.location.href = `/product/${item.id}`}
              />
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Fixed Bottom Actions (Mobile) -->
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex space-x-2 lg:hidden z-40">
    <Button onclick={handleMessage} variant="outline" size="lg" class="min-h-[48px]">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </Button>
    <Button onclick={handleMakeOffer} variant="outline" size="lg" class="flex-1 min-h-[48px]">
      Make Offer
    </Button>
    <Button onclick={handleBuyNow} size="lg" class="flex-1 min-h-[48px]">
      Buy Now
    </Button>
  </div>
  
  <!-- Size Guide Modal -->
  {#if showSizeGuide}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Size Guide</h3>
          <button onclick={() => showSizeGuide = false} class="p-2 -mr-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Size</th>
              <th class="text-center py-2">Chest (in)</th>
              <th class="text-center py-2">Length (in)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-2">S</td>
              <td class="text-center">36-38</td>
              <td class="text-center">27</td>
            </tr>
            <tr class="border-b">
              <td class="py-2">M</td>
              <td class="text-center">38-40</td>
              <td class="text-center">28</td>
            </tr>
            <tr class="border-b">
              <td class="py-2">L</td>
              <td class="text-center">40-42</td>
              <td class="text-center">29</td>
            </tr>
            <tr>
              <td class="py-2">XL</td>
              <td class="text-center">42-44</td>
              <td class="text-center">30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>