<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Avatar, ProductCard, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  const profileId = $page.params.id;
  
  // Mock user profile data
  const profile = {
    id: profileId,
    username: 'VintageFinds',
    name: 'Sarah Mitchell',
    avatar: '/placeholder-product.svg',
    coverImage: '/placeholder-product.svg',
    bio: 'Curated vintage fashion finds. Sustainable shopping advocate. All items authentic and carefully selected.',
    location: 'New York, NY',
    joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    isPremiumSeller: true,
    isVerified: true,
    stats: {
      itemsSold: 342,
      itemsListed: 89,
      followers: 1892,
      following: 234,
      rating: 4.8,
      reviewCount: 256,
      responseTime: '< 1 hour',
      shipmentTime: '1-2 days'
    },
    badges: [
      { name: 'Top Seller', icon: '🏆' },
      { name: 'Fast Shipper', icon: '⚡' },
      { name: 'Eco Warrior', icon: '🌱' }
    ],
    socialLinks: {
      instagram: '@vintagefinds',
      tiktok: '@vintagefinds'
    }
  };
  
  // Mock products
  const products: Product[] = Array.from({ length: 12 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Vintage Item ${i + 1}`,
    description: 'Great condition vintage piece',
    price: Math.floor(Math.random() * 200) + 30,
    images: ['/placeholder-product.svg'],
    brand: ['Levi\'s', 'Nike', 'Adidas', 'Zara'][i % 4],
    size: ['S', 'M', 'L', 'XL'][i % 4],
    condition: (['new', 'like-new', 'good', 'fair'] as const)[i % 4],
    category: ['Jackets', 'Tops', 'Bottoms', 'Accessories'][i % 4],
    sellerId: profile.id,
    sellerName: profile.username,
    sellerRating: profile.stats.rating,
    createdAt: new Date().toISOString(),
    location: profile.location
  }));
  
  // Mock reviews
  const reviews = Array.from({ length: 5 }, (_, i) => ({
    id: `review-${i}`,
    buyerName: `Buyer ${i + 1}`,
    buyerAvatar: '/placeholder-product.svg',
    rating: 4 + Math.random(),
    comment: 'Great seller! Item exactly as described. Fast shipping and well packaged.',
    productTitle: `Vintage Item ${i + 1}`,
    date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  let activeTab = $state<'listings' | 'reviews' | 'about'>('listings');
  let isFollowing = $state(false);
  let sortBy = $state('newest');
  let filterCondition = $state('all');
  
  function handleFollow() {
    isFollowing = !isFollowing;
  }
  
  function handleMessage() {
    console.log('Message seller');
  }
  
  function handleShare() {
    console.log('Share profile');
  }
  
  function handleReport() {
    console.log('Report user');
  }
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    if (months >= 12) return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    const hours = Math.floor(seconds / (60 * 60));
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };
</script>

<svelte:head>
  <title>{profile.username} - Driplo Profile</title>
  <meta name="description" content="{profile.bio}" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />

  <!-- Cover Image -->
  <div class="relative h-32 sm:h-48 bg-gradient-to-r from-purple-600 to-pink-600">
    <img 
      src={profile.coverImage} 
      alt="Cover" 
      class="w-full h-full object-cover opacity-50"
    />
  </div>

  <!-- Profile Info -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="relative -mt-16 sm:-mt-20 mb-6">
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div class="sm:flex sm:items-end sm:space-x-5">
          <!-- Avatar -->
          <div class="relative -mt-12 sm:-mt-16">
            <Avatar 
              src={profile.avatar}
              name={profile.name}
              size="xl"
              premium={profile.isPremiumSeller}
              class="ring-4 ring-white"
            />
            {#if profile.isVerified}
              <div class="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            {/if}
          </div>
          
          <!-- Profile Details -->
          <div class="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:pb-1">
            <div class="mt-6 min-w-0 flex-1">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {profile.username}
                {#if profile.isPremiumSeller}
                  <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Premium
                  </span>
                {/if}
              </h1>
              <p class="text-gray-600 text-sm sm:text-base">{profile.name}</p>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">{profile.location} • Joined {timeAgo(profile.joinedDate)}</p>
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button 
                onclick={handleFollow}
                variant={isFollowing ? 'outline' : 'primary'}
                size="lg"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button onclick={handleMessage} variant="outline" size="lg">
                Message
              </Button>
              <Button onclick={handleShare} variant="outline" size="lg" class="!p-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="mt-6">
          <p class="text-gray-700">{profile.bio}</p>
          {#if profile.socialLinks.instagram || profile.socialLinks.tiktok}
            <div class="flex space-x-4 mt-3">
              {#if profile.socialLinks.instagram}
                <a href="#" class="text-sm text-gray-500 hover:text-gray-700">
                  {profile.socialLinks.instagram}
                </a>
              {/if}
              {#if profile.socialLinks.tiktok}
                <a href="#" class="text-sm text-gray-500 hover:text-gray-700">
                  {profile.socialLinks.tiktok}
                </a>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Stats -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900">{profile.stats.itemsListed}</p>
            <p class="text-sm text-gray-500">Listings</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900">{profile.stats.itemsSold}</p>
            <p class="text-sm text-gray-500">Sold</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900">{profile.stats.followers}</p>
            <p class="text-sm text-gray-500">Followers</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-400 fill-current mr-1" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {profile.stats.rating}
            </p>
            <p class="text-sm text-gray-500">{profile.stats.reviewCount} Reviews</p>
          </div>
        </div>

        <!-- Badges -->
        {#if profile.badges.length > 0}
          <div class="mt-4 flex flex-wrap gap-2">
            {#each profile.badges as badge}
              <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                <span class="mr-1">{badge.icon}</span>
                <span class="text-gray-700">{badge.name}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          onclick={() => activeTab = 'listings'}
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors
            {activeTab === 'listings' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Listings ({profile.stats.itemsListed})
        </button>
        <button
          onclick={() => activeTab = 'reviews'}
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors
            {activeTab === 'reviews' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Reviews ({profile.stats.reviewCount})
        </button>
        <button
          onclick={() => activeTab = 'about'}
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors
            {activeTab === 'about' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          About
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'listings'}
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div class="flex space-x-2 overflow-x-auto">
          <button
            onclick={() => filterCondition = 'all'}
            class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
              {filterCondition === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            All
          </button>
          <button
            onclick={() => filterCondition = 'new'}
            class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
              {filterCondition === 'new' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            New
          </button>
          <button
            onclick={() => filterCondition = 'like-new'}
            class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
              {filterCondition === 'like-new' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            Like New
          </button>
          <button
            onclick={() => filterCondition = 'good'}
            class="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors
              {filterCondition === 'good' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            Good
          </button>
        </div>
        
        <select 
          bind:value={sortBy}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
        {#each products as product}
          <ProductCard 
            {product}
            onclick={() => window.location.href = `/product/${product.id}`}
          />
        {/each}
      </div>
    {:else if activeTab === 'reviews'}
      <!-- Reviews -->
      <div class="space-y-6 pb-8">
        {#each reviews as review}
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-start space-x-4">
              <Avatar 
                src={review.buyerAvatar}
                name={review.buyerName}
                size="md"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900">{review.buyerName}</h4>
                    <p class="text-sm text-gray-500">{timeAgo(review.date)}</p>
                  </div>
                  <div class="flex items-center">
                    {#each Array(5) as _, i}
                      <svg 
                        class="w-5 h-5 {i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    {/each}
                  </div>
                </div>
                <p class="mt-2 text-gray-700">{review.comment}</p>
                <p class="mt-2 text-sm text-gray-500">
                  Purchased: <span class="font-medium">{review.productTitle}</span>
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'about'}
      <!-- About -->
      <div class="grid lg:grid-cols-2 gap-8 pb-8">
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Seller Information</h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-600">Response Time</dt>
              <dd class="font-medium">{profile.stats.responseTime}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Ships Within</dt>
              <dd class="font-medium">{profile.stats.shipmentTime}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Location</dt>
              <dd class="font-medium">{profile.location}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">Member Since</dt>
              <dd class="font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Policies</h3>
          <div class="space-y-4 text-gray-700">
            <div>
              <h4 class="font-medium mb-1">Returns</h4>
              <p class="text-sm">14-day return policy for items not as described</p>
            </div>
            <div>
              <h4 class="font-medium mb-1">Shipping</h4>
              <p class="text-sm">Standard and express shipping available worldwide</p>
            </div>
            <div>
              <h4 class="font-medium mb-1">Payment</h4>
              <p class="text-sm">Secure payments through Driplo platform</p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Report Link -->
    <div class="text-center pb-8">
      <button onclick={handleReport} class="text-sm text-gray-500 hover:text-gray-700">
        Report this user
      </button>
    </div>
  </div>
</div>