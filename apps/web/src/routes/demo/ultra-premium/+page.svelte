<script lang="ts">
  import { onMount, tick } from 'svelte';

  // Enhanced premium product with advanced features
  const product = {
    id: 'ultra-premium-001',
    title: 'Rick Owens DRKSHDW Abstract Ramones High',
    brand: 'Rick Owens',
    collection: 'DRKSHDW SS24',
    price: 1450,
    originalPrice: 1800,
    priceHistory: [
      { date: '2024-01-15', price: 1800 },
      { date: '2024-02-01', price: 1650 },
      { date: '2024-02-15', price: 1500 },
      { date: '2024-03-01', price: 1450 }
    ],
    condition: 'Brand New',
    size: 'EU 42 / US 9',
    measurements: {
      length: '31cm',
      width: '11cm',
      height: '12cm',
      weight: '850g'
    },
    seller: {
      username: 'avantgarde_archive',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      verified: true,
      rating: 4.98,
      sales: 1247,
      responseTime: '< 15 mins',
      joinedDate: '2018',
      badges: ['Power Seller', 'Verified Seller', 'Fast Shipper', 'Top Rated', 'Grail Specialist'],
      location: 'Tokyo, Japan',
      languages: ['English', 'Japanese', 'Korean']
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9739b8f9eb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop'
    ],
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    ar3dModel: 'https://example.com/rick-owens-ramones.glb',
    description: 'Pristine Rick Owens DRKSHDW Abstract Ramones High sneakers from the SS24 collection. Features the signature toecap, premium leather construction, and abstract geometric details. Completely unworn with original box, dustbag, and receipt. A true grail piece for any serious collector.',
    tags: ['rick-owens', 'drkshdw', 'ramones', 'high-top', 'avant-garde', 'goth-ninja', 'grail'],
    details: {
      material: 'Premium Leather with Rubber Sole',
      season: 'Spring/Summer 2024',
      colorway: 'Black/Milk Abstract',
      style: 'High-Top Sneaker',
      artNumber: 'DU02A3889-LHQB',
      retailPrice: '$1,800',
      releaseDate: 'March 2024',
      madein: 'Italy'
    },
    likes: 342,
    views: 4250,
    watchers: 89,
    posted: '3 hours ago',
    lastPriceUpdate: '2 hours ago',
    authenticity: {
      status: 'Verified Authentic',
      service: 'Legit Check by Ch',
      certificate: 'LC-RO-2024-03-0789',
      confidence: 99.8
    },
    shipping: {
      free: true,
      express: true,
      international: true,
      protection: true,
      insurance: true,
      tracking: true,
      estimatedDays: '2-4'
    },
    rarity: {
      score: 9.2,
      level: 'Ultra Rare',
      totalProduced: 120,
      availableOnMarket: 3
    },
    marketAnalysis: {
      averagePrice: 1650,
      priceRange: { min: 1200, max: 2100 },
      salesThisMonth: 2,
      appreciation: '+12% (3M)'
    }
  };

  // Advanced state management
  let currentImageIndex = $state(0);
  let isLiked = $state(false);
  let isWatching = $state(false);
  let showMeasurements = $state(false);
  let showShipping = $state(false);
  let showPriceHistory = $state(false);
  let showMarketAnalysis = $state(false);
  let showFullDescription = $state(false);
  let isImageZoomed = $state(false);
  let showARTryOn = $state(false);
  let showVideo = $state(false);
  let scrollProgress = $state(0);
  let stickyHeaderVisible = $state(false);
  let priceAlertSet = $state(false);
  let notificationsEnabled = $state(false);
  
  // Real-time features
  let currentViewers = $state(7);
  let recentActivity = $state([
    { user: 'collector_99', action: 'liked', time: '2 min ago' },
    { user: 'sneaker_head', action: 'viewed', time: '5 min ago' },
    { user: 'fashion_maven', action: 'added to watchlist', time: '8 min ago' }
  ]);

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

  function toggleWatching() {
    isWatching = !isWatching;
    if (isWatching) {
      // Simulate adding to watchlist
      product.watchers++;
    } else {
      product.watchers--;
    }
  }

  function enableNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          notificationsEnabled = true;
          new Notification('Driplo Notifications', {
            body: 'You\'ll be notified about price drops and availability.',
            icon: '/favicon.png'
          });
        }
      });
    }
  }

  // Simulate real-time viewer count changes
  onMount(() => {
    const interval = setInterval(() => {
      currentViewers = Math.max(1, currentViewers + Math.floor(Math.random() * 3 - 1));
    }, 10000);

    // Intersection observer for sticky header
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
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<svelte:head>
  <title>{product.title} - {product.brand} | Ultra Premium Marketplace</title>
  <meta name="description" content="{product.description.substring(0, 160)}..." />
</svelte:head>

<!-- Scroll Progress Bar -->
<div 
  class="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 z-50 transition-all duration-300"
  style="width: {scrollProgress * 100}%"
></div>

<!-- Live Activity Bar -->
<div class="fixed top-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm z-40 flex items-center space-x-2">
  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
  <span>{currentViewers} viewing now</span>
  <span class="text-gray-300">•</span>
  <span>{product.watchers} watching</span>
</div>

<!-- Sticky Header (appears on scroll) -->
{#if stickyHeaderVisible}
<div class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-30 transition-all duration-300 shadow-sm">
  <div class="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
    <div class="flex items-center space-x-3">
      <img src={product.images[0]} alt="" class="w-12 h-12 object-cover rounded-xl shadow-sm" />
      <div>
        <h2 class="font-semibold text-gray-900 truncate max-w-48">{product.title}</h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm font-bold text-gray-900">${product.price}</span>
          <span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            {product.rarity.level}
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </button>
      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      </button>
      <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
        Buy Now
      </button>
    </div>
  </div>
</div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto">
    <div class="grid lg:grid-cols-2 gap-0 lg:gap-16 bg-white lg:bg-transparent lg:pt-8">
      
      <!-- Enhanced Image Gallery Section -->
      <div class="relative lg:sticky lg:top-8 lg:h-screen">
        <!-- Media Controls -->
        <div class="absolute top-4 left-4 z-20 flex space-x-2">
          <button 
            class="w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
            class:bg-purple-500={showVideo}
            class:text-white={showVideo}
            onclick={() => showVideo = !showVideo}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          
          <button 
            class="w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
            onclick={() => showARTryOn = !showARTryOn}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Main Image/Video Display -->
        <div 
          class="relative aspect-[4/5] lg:aspect-square bg-gray-100 overflow-hidden cursor-zoom-in group"
          class:cursor-zoom-out={isImageZoomed}
          bind:this={imageContainer}
          ontouchstart={handleTouchStart}
          ontouchend={handleTouchEnd}
          onclick={handleImageClick}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && handleImageClick()}
        >
          <!-- Video or Image Display -->
          {#if showVideo}
            <video 
              class="w-full h-full object-cover"
              controls
              autoplay
              muted
              loop
            >
              <source src={product.videoUrl} type="video/mp4">
            </video>
          {:else}
            <img 
              src={product.images[currentImageIndex]} 
              alt="{product.title} - Image {currentImageIndex + 1}"
              class="w-full h-full object-cover transition-transform duration-500 ease-out"
              class:scale-150={isImageZoomed}
              loading="eager"
            />
          {/if}
          
          <!-- Enhanced Image Navigation -->
          {#if product.images.length > 1 && !showVideo}
            <button 
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : product.images.length - 1; }}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); currentImageIndex = currentImageIndex < product.images.length - 1 ? currentImageIndex + 1 : 0; }}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          {/if}

          <!-- Enhanced Overlays -->
          <div class="absolute top-4 right-4 flex flex-col space-y-2">
            <!-- Image Counter -->
            <div class="bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {showVideo ? 'Video' : `${currentImageIndex + 1} / ${product.images.length}`}
            </div>
            
            <!-- Rarity Badge -->
            <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>{product.rarity.level}</span>
            </div>
          </div>

          <!-- Authenticity Badge -->
          <div class="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>{product.authenticity.confidence}% Authentic</span>
          </div>
        </div>

        <!-- Enhanced Thumbnail Grid -->
        {#if product.images.length > 1}
          <div class="flex space-x-3 mt-4 px-4 lg:px-0 overflow-x-auto pb-2">
            <!-- Video thumbnail -->
            <button
              class="flex-shrink-0 w-20 h-20 bg-black/90 rounded-xl overflow-hidden border-2 transition-all duration-200 flex items-center justify-center"
              class:border-purple-500={showVideo}
              class:border-transparent={!showVideo}
              onclick={() => showVideo = !showVideo}
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            
            <!-- Image thumbnails -->
            {#each product.images as image, index}
              <button
                class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 transition-all duration-200"
                class:border-black={index === currentImageIndex && !showVideo}
                class:border-transparent={index !== currentImageIndex || showVideo}
                onclick={() => { currentImageIndex = index; showVideo = false; }}
              >
                <img src={image} alt="Thumbnail {index + 1}" class="w-full h-full object-cover" />
              </button>
            {/each}
          </div>
        {/if}

        <!-- AR Try-On Modal -->
        {#if showARTryOn}
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl p-6 max-w-md w-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold">AR Try-On</h3>
              <button onclick={() => showARTryOn = false} class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <p class="text-gray-600">Camera access required</p>
                <p class="text-sm text-gray-500 mt-1">Enable camera to try on virtually</p>
              </div>
            </div>
            <button class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium">
              Enable Camera
            </button>
          </div>
        </div>
        {/if}
      </div>

      <!-- Enhanced Product Information Section -->
      <div class="p-6 lg:p-8 space-y-8">
        
        <!-- Product Header -->
        <div class="product-header space-y-6">
          <!-- Enhanced Breadcrumb -->
          <nav class="text-sm text-gray-500 flex items-center space-x-2">
            <span>Men</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span>Footwear</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span>High-Tops</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-orange-600 font-medium">Grails</span>
          </nav>

          <!-- Brand and Title -->
          <div>
            <div class="flex items-center space-x-3 mb-3">
              <h1 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">{product.brand}</h1>
              <span class="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-medium">{product.collection}</span>
              <span class="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
                Rarity {product.rarity.score}/10
              </span>
            </div>
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">{product.title}</h2>
            <p class="text-gray-600">Only {product.rarity.availableOnMarket} available on the market</p>
          </div>

          <!-- Enhanced Price Section -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-baseline space-x-4">
                <span class="text-4xl font-bold text-gray-900">${product.price}</span>
                {#if product.originalPrice && product.originalPrice > product.price}
                  <span class="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                  <span class="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                {/if}
              </div>
              
              <div class="flex items-center space-x-3">
                <button 
                  class="p-3 rounded-full transition-all duration-200 hover:bg-white shadow-lg"
                  class:text-red-500={isLiked}
                  class:text-gray-400={!isLiked}
                  class:bg-red-50={isLiked}
                  class:bg-white={!isLiked}
                  onclick={() => isLiked = !isLiked}
                >
                  <svg class="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
                
                <button 
                  class="p-3 rounded-full transition-all duration-200 hover:bg-white shadow-lg"
                  class:text-blue-500={isWatching}
                  class:text-gray-400={!isWatching}
                  class:bg-blue-50={isWatching}
                  class:bg-white={!isWatching}
                  onclick={toggleWatching}
                >
                  <svg class="w-6 h-6" fill={isWatching ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Price History Toggle -->
            <button 
              class="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
              onclick={() => showPriceHistory = !showPriceHistory}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span>Price History & Analysis</span>
            </button>

            {#if showPriceHistory}
              <div class="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span class="text-gray-600">Market Average:</span>
                    <span class="font-bold text-gray-900 ml-2">${product.marketAnalysis.averagePrice}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">3M Appreciation:</span>
                    <span class="font-bold text-green-600 ml-2">{product.marketAnalysis.appreciation}</span>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-700">Recent Price Changes:</h4>
                  {#each product.priceHistory.slice(-3) as entry}
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">{entry.date}</span>
                      <span class="font-medium">${entry.price}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Enhanced Stats -->
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <div class="flex items-center justify-center space-x-1 text-red-500 mb-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-bold">{product.likes}</span>
                </div>
                <span class="text-gray-500">likes</span>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center space-x-1 text-blue-500 mb-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-bold">{product.views}</span>
                </div>
                <span class="text-gray-500">views</span>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center space-x-1 text-orange-500 mb-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-bold">{product.watchers}</span>
                </div>
                <span class="text-gray-500">watching</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Size and Condition Display -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 class="text-sm font-semibold text-blue-700 mb-2">Size</h3>
            <p class="text-2xl font-bold text-blue-900">{product.size}</p>
            <p class="text-xs text-blue-600 mt-1">True to size</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 class="text-sm font-semibold text-green-700 mb-2">Condition</h3>
            <p class="text-2xl font-bold text-green-900">{product.condition}</p>
            <p class="text-xs text-green-600 mt-1">With original box</p>
          </div>
        </div>

        <!-- Enhanced Action Buttons -->
        <div class="space-y-4">
          <!-- Primary Actions -->
          <div class="space-y-3">
            <button class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
              Buy Now - ${product.price}
            </button>
            
            <div class="grid grid-cols-2 gap-3">
              <button class="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Make Offer
              </button>
              <button class="flex-1 border-2 border-gray-300 text-gray-900 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors">
                Message Seller
              </button>
            </div>
          </div>

          <!-- Secondary Actions -->
          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <button 
              class="flex items-center justify-center space-x-2 py-3 text-blue-600 hover:text-blue-800 transition-colors"
              onclick={() => priceAlertSet = !priceAlertSet}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM12 17H7l5 5v-5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7V4a1 1 0 00-1-1H6a1 1 0 00-1 1v3M5 11h14l-1 7H6l-1-7z"></path>
              </svg>
              <span class="text-sm font-medium">{priceAlertSet ? 'Alert Set' : 'Price Alert'}</span>
            </button>
            
            <button 
              class="flex items-center justify-center space-x-2 py-3 text-green-600 hover:text-green-800 transition-colors"
              onclick={enableNotifications}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM12 17H7l5 5v-5z"></path>
              </svg>
              <span class="text-sm font-medium">{notificationsEnabled ? 'Notifications On' : 'Get Notified'}</span>
            </button>
          </div>
        </div>

        <!-- Premium Shipping Info -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-emerald-800">Premium Protection & Shipping</h3>
              <p class="text-sm text-emerald-700">Arrives in {product.shipping.estimatedDays} business days</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm text-emerald-700">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span>Free Express Shipping</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span>Buyer Protection</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span>Full Insurance</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>

        <!-- Enhanced Seller Section -->
        <div class="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
          <h3 class="font-bold text-gray-900 mb-6 flex items-center text-lg">
            <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Seller Information
          </h3>
          
          <div class="flex items-start space-x-6">
            <div class="relative">
              <img src={product.seller.avatar} alt={product.seller.username} class="w-20 h-20 rounded-full object-cover shadow-lg" />
              {#if product.seller.verified}
                <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              {/if}
            </div>
            
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <h4 class="text-xl font-bold text-gray-900">{product.seller.username}</h4>
                <span class="text-sm text-gray-500">{product.seller.location}</span>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-4">
                {#each product.seller.badges as badge}
                  <span class="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">{badge}</span>
                {/each}
              </div>
              
              <div class="grid grid-cols-2 gap-6 text-sm">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Rating:</span>
                    <div class="flex items-center space-x-1">
                      <span class="font-bold text-yellow-600">{product.seller.rating}</span>
                      <div class="flex text-yellow-400">
                        {#each Array(5) as _, i}
                          <svg class="w-4 h-4" fill={i < Math.floor(product.seller.rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                          </svg>
                        {/each}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Sales:</span>
                    <span class="font-bold text-gray-900">{product.seller.sales.toLocaleString()}</span>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Response:</span>
                    <span class="font-bold text-green-600">{product.seller.responseTime}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Member since:</span>
                    <span class="font-bold text-gray-900">{product.seller.joinedDate}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex space-x-2 text-xs text-gray-500">
                  <span>Speaks:</span>
                  {#each product.seller.languages as language, i}
                    <span class="font-medium">{language}{i < product.seller.languages.length - 1 ? ',' : ''}</span>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mt-6 pt-4 border-t border-gray-100">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
            <div class="space-y-2">
              {#each recentActivity as activity}
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">
                    <strong class="text-gray-900">{activity.user}</strong> {activity.action} this item
                  </span>
                  <span class="text-gray-500">{activity.time}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Rest of the content sections remain the same but with enhanced styling... -->
        <!-- I'll continue with the remaining sections -->
        
        <!-- Enhanced Product Details -->
        <div class="space-y-6">
          <!-- Description -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="font-bold text-gray-900 mb-4 text-lg">Description</h3>
            <div class="prose prose-sm max-w-none text-gray-700">
              <p class:line-clamp-4={!showFullDescription}>
                {product.description}
              </p>
              {#if product.description.length > 200}
                <button 
                  class="text-blue-600 hover:text-blue-800 font-medium mt-3 flex items-center space-x-1"
                  onclick={() => showFullDescription = !showFullDescription}
                >
                  <span>{showFullDescription ? 'Show Less' : 'Read More'}</span>
                  <svg 
                    class="w-4 h-4 transition-transform duration-200"
                    class:rotate-180={showFullDescription}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              {/if}
            </div>
          </div>

          <!-- Product Details -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="font-bold text-gray-900 mb-4 text-lg">Specifications</h3>
            <div class="grid grid-cols-1 gap-4">
              {#each Object.entries(product.details) as [key, value]}
                <div class="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
                  <span class="text-gray-600 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span class="font-bold text-gray-900 text-right">{value}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Authenticity Certificate -->
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-emerald-800 text-lg">{product.authenticity.status}</h3>
                <p class="text-emerald-700">Verified by {product.authenticity.service}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-emerald-700">Certificate ID:</span>
                <span class="font-mono text-emerald-900 ml-2">{product.authenticity.certificate}</span>
              </div>
              <div>
                <span class="text-emerald-700">Confidence:</span>
                <span class="font-bold text-emerald-900 ml-2">{product.authenticity.confidence}%</span>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="font-bold text-gray-900 mb-4 text-lg">Tags</h3>
            <div class="flex flex-wrap gap-3">
              {#each product.tags as tag}
                <span class="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:from-gray-200 hover:to-gray-300 cursor-pointer transition-all duration-200 border border-gray-300">
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
  .line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>