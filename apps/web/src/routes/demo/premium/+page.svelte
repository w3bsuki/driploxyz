<script lang="ts">
  import { onMount, tick } from 'svelte';

  // Mock data for the premium product page
  const product = {
    id: 'premium-001',
    title: 'Stone Island Shadow Project Cargo Pants',
    brand: 'Stone Island',
    collection: 'Shadow Project',
    price: 890,
    originalPrice: 1200,
    condition: 'Like New',
    size: '32',
    measurements: {
      waist: '82cm',
      inseam: '78cm',
      thigh: '32cm',
      hem: '18cm'
    },
    seller: {
      username: 'archive_collector',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      verified: true,
      rating: 4.96,
      sales: 342,
      responseTime: '< 1 hour',
      joinedDate: '2019',
      badges: ['Power Seller', 'Fast Shipper', 'Top Rated']
    },
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop'
    ],
    description: 'Rare Stone Island Shadow Project cargo pants in excellent condition. Features the iconic compass patch, technical fabric construction, and signature detailing. No signs of wear, stored in smoke-free environment.',
    tags: ['stone-island', 'techwear', 'cargo', 'tactical', 'archive'],
    details: {
      material: '100% Cotton Gabardine with DWR coating',
      season: 'FW 2023',
      colorway: 'Military Green',
      style: 'Cargo Pants',
      fit: 'Regular Tapered'
    },
    likes: 127,
    views: 1840,
    posted: '2 days ago',
    lastPriceUpdate: '1 day ago',
    authenticity: 'Verified Authentic',
    shipping: {
      free: true,
      express: true,
      international: true,
      protection: true
    }
  };

  // State management with Svelte 5 runes
  let currentImageIndex = $state(0);
  let isLiked = $state(false);
  let showMeasurements = $state(false);
  let showShipping = $state(false);
  let showFullDescription = $state(false);
  let isImageZoomed = $state(false);
  let scrollProgress = $state(0);
  let stickyHeaderVisible = $state(false);

  // Touch/swipe handling
  let touchStartX = 0;
  let touchStartY = 0;
  let imageContainer: HTMLElement;

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e: TouchEvent) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = Math.abs(touchStartY - touchEndY);

    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX > 0 && currentImageIndex < product.images.length - 1) {
        currentImageIndex++;
      } else if (deltaX < 0 && currentImageIndex > 0) {
        currentImageIndex--;
      }
    }
  }

  function handleImageClick() {
    isImageZoomed = !isImageZoomed;
  }

  // Intersection observer for sticky header
  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyHeaderVisible = !entry.isIntersecting;
      },
      { threshold: 0 }
    );

    const target = document.querySelector('.product-header');
    if (target) observer.observe(target);

    // Scroll progress
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrollTop = window.scrollY;
      scrollProgress = scrollTop / docHeight;
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<svelte:head>
  <title>{product.title} - {product.brand} | Premium Marketplace</title>
  <meta name="description" content="{product.description.substring(0, 160)}..." />
</svelte:head>

<!-- Scroll Progress Bar -->
<div 
  class="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-all duration-300"
  style="width: {scrollProgress * 100}%"
></div>

<!-- Sticky Header (appears on scroll) -->
{#if stickyHeaderVisible}
<div class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 transition-all duration-300">
  <div class="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
    <div class="flex items-center space-x-3">
      <img src={product.images[0]} alt="" class="w-12 h-12 object-cover rounded-lg" />
      <div>
        <h2 class="font-medium text-gray-900 truncate max-w-48">{product.title}</h2>
        <p class="text-sm text-gray-500">${product.price}</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      </button>
      <button class="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors">
        Buy Now
      </button>
    </div>
  </div>
</div>
{/if}

<div class="min-h-screen bg-gray-50">
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto">
    <div class="grid lg:grid-cols-2 gap-0 lg:gap-12 bg-white lg:bg-transparent">
      
      <!-- Image Gallery Section -->
      <div class="relative lg:sticky lg:top-4 lg:h-screen">
        <!-- Main Image Display -->
        <div 
          class="relative aspect-[4/5] lg:aspect-square bg-gray-100 overflow-hidden cursor-zoom-in"
          class:cursor-zoom-out={isImageZoomed}
          bind:this={imageContainer}
          ontouchstart={handleTouchStart}
          ontouchend={handleTouchEnd}
          onclick={handleImageClick}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && handleImageClick()}
        >
          <!-- Image with zoom functionality -->
          <img 
            src={product.images[currentImageIndex]} 
            alt="{product.title} - Image {currentImageIndex + 1}"
            class="w-full h-full object-cover transition-transform duration-500 ease-out"
            class:scale-150={isImageZoomed}
            loading="eager"
          />
          
          <!-- Image Navigation Arrows -->
          {#if product.images.length > 1}
            <button 
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : product.images.length - 1; }}
              disabled={currentImageIndex === 0}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); currentImageIndex = currentImageIndex < product.images.length - 1 ? currentImageIndex + 1 : 0; }}
              disabled={currentImageIndex === product.images.length - 1}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          {/if}

          <!-- Image Counter -->
          <div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentImageIndex + 1} / {product.images.length}
          </div>

          <!-- Authenticity Badge -->
          <div class="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Authenticated</span>
          </div>
        </div>

        <!-- Thumbnail Grid -->
        {#if product.images.length > 1}
          <div class="flex space-x-3 mt-4 px-4 lg:px-0 overflow-x-auto pb-2">
            {#each product.images as image, index}
              <button
                class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200"
                class:border-black={index === currentImageIndex}
                class:border-transparent={index !== currentImageIndex}
                onclick={() => currentImageIndex = index}
              >
                <img src={image} alt="Thumbnail {index + 1}" class="w-full h-full object-cover" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Product Information Section -->
      <div class="p-6 lg:p-8 space-y-8">
        
        <!-- Product Header -->
        <div class="product-header space-y-4">
          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-500 flex items-center space-x-2">
            <span>Men</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span>Bottoms</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span>Pants</span>
          </nav>

          <!-- Brand and Title -->
          <div>
            <div class="flex items-center space-x-3 mb-2">
              <h1 class="text-sm font-medium text-gray-600 uppercase tracking-wider">{product.brand}</h1>
              {#if product.collection}
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{product.collection}</span>
              {/if}
            </div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h2>
          </div>

          <!-- Price and Condition -->
          <div class="flex items-center justify-between">
            <div class="flex items-baseline space-x-3">
              <span class="text-3xl font-bold text-gray-900">${product.price}</span>
              {#if product.originalPrice && product.originalPrice > product.price}
                <span class="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                <span class="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              {/if}
            </div>
            
            <button 
              class="p-3 rounded-full transition-all duration-200 hover:bg-gray-100"
              class:text-red-500={isLiked}
              class:text-gray-400={!isLiked}
              onclick={() => isLiked = !isLiked}
            >
              <svg class="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="flex items-center space-x-6 text-sm text-gray-500">
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>{product.likes}</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>{product.views} views</span>
            </div>
            <span>Posted {product.posted}</span>
          </div>
        </div>

        <!-- Size and Condition -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-1">Size</h3>
            <p class="text-xl font-bold text-gray-900">{product.size}</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-1">Condition</h3>
            <p class="text-xl font-bold text-gray-900">{product.condition}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button class="w-full bg-black text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-colors">
            Buy Now - ${product.price}
          </button>
          
          <div class="grid grid-cols-2 gap-3">
            <button class="flex-1 border-2 border-gray-200 text-gray-900 py-3 rounded-xl font-medium hover:border-gray-300 transition-colors">
              Make Offer
            </button>
            <button class="flex-1 border-2 border-gray-200 text-gray-900 py-3 rounded-xl font-medium hover:border-gray-300 transition-colors">
              Message
            </button>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="font-medium text-green-800">Free Shipping & Protection</span>
          </div>
          <p class="text-sm text-green-700">Fast shipping • Buyer protection included • 30-day returns</p>
        </div>

        <!-- Seller Information -->
        <div class="border border-gray-200 rounded-xl p-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Seller Information
          </h3>
          
          <div class="flex items-start space-x-4">
            <img src={product.seller.avatar} alt={product.seller.username} class="w-16 h-16 rounded-full object-cover" />
            
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h4 class="font-bold text-gray-900">{product.seller.username}</h4>
                {#if product.seller.verified}
                  <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                {/if}
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                {#each product.seller.badges as badge}
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{badge}</span>
                {/each}
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Rating:</span>
                  <span class="font-medium ml-1">{product.seller.rating}/5.0</span>
                </div>
                <div>
                  <span class="text-gray-500">Sales:</span>
                  <span class="font-medium ml-1">{product.seller.sales}</span>
                </div>
                <div>
                  <span class="text-gray-500">Response:</span>
                  <span class="font-medium ml-1">{product.seller.responseTime}</span>
                </div>
                <div>
                  <span class="text-gray-500">Joined:</span>
                  <span class="font-medium ml-1">{product.seller.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="space-y-4">
          <!-- Description -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Description</h3>
            <div class="prose prose-sm max-w-none text-gray-700">
              <p class:line-clamp-3={!showFullDescription}>
                {product.description}
              </p>
              {#if product.description.length > 200}
                <button 
                  class="text-blue-600 hover:text-blue-800 font-medium mt-2"
                  onclick={() => showFullDescription = !showFullDescription}
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              {/if}
            </div>
          </div>

          <!-- Product Details -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Details</h3>
            <div class="grid grid-cols-1 gap-3">
              {#each Object.entries(product.details) as [key, value]}
                <div class="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span class="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span class="font-medium text-gray-900">{value}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Measurements -->
          <div>
            <button 
              class="flex items-center justify-between w-full py-3 text-left"
              onclick={() => showMeasurements = !showMeasurements}
            >
              <h3 class="font-bold text-gray-900">Measurements</h3>
              <svg 
                class="w-5 h-5 transition-transform duration-200"
                class:rotate-180={showMeasurements}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {#if showMeasurements}
              <div class="grid grid-cols-2 gap-3 mt-3">
                {#each Object.entries(product.measurements) as [key, value]}
                  <div class="bg-gray-50 rounded-lg p-3">
                    <span class="text-sm text-gray-600 capitalize block">{key}:</span>
                    <span class="font-bold text-gray-900">{value}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Tags -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2">
              {#each product.tags as tag}
                <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors">
                  #{tag}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
</style>