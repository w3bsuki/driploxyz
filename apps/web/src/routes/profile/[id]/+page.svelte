<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Avatar, ProductCard, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  
  const profileId = $page.params.id;
  
  // Mock user profile data
  const profile = {
    id: profileId,
    username: 'VintageFinds',
    name: 'Sarah Mitchell',
    avatar: '/placeholder-product.svg',
    bio: 'Curated vintage fashion finds ✨ Sustainable shopping advocate 🌱',
    location: 'New York, NY',
    joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    isPremiumSeller: true,
    isVerified: true,
    stats: {
      itemsListed: 89,
      itemsSold: 342,
      followers: 1892,
      following: 234,
      rating: 4.8,
      reviewCount: 256
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
  const reviews = Array.from({ length: 3 }, (_, i) => ({
    id: `review-${i}`,
    buyerName: `Buyer ${i + 1}`,
    buyerAvatar: '/placeholder-product.svg',
    rating: 4 + Math.random(),
    comment: 'Great seller! Item exactly as described. Fast shipping and well packaged.',
    productTitle: `Vintage Item ${i + 1}`,
    date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  let activeTab = $state<'posts' | 'reviews' | 'about'>('posts');
  let isFollowing = $state(false);
  
  function handleFollow() {
    isFollowing = !isFollowing;
  }
  
  function handleMessage() {
    console.log('Message seller');
  }
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    if (months >= 12) return `${Math.floor(months / 12)}y`;
    if (months > 0) return `${months}mo`;
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(seconds / (60 * 60));
    return `${hours}h`;
  };
</script>

<svelte:head>
  <title>{profile.username} - Driplo Profile</title>
  <meta name="description" content="{profile.bio}" />
</svelte:head>

<div class="min-h-screen bg-white pb-20 sm:pb-0">
  <Header />

  <!-- Profile Section -->
  <div class="px-4 py-6">
    <div class="flex items-start space-x-4">
      <!-- Avatar -->
      <div class="relative">
        <Avatar 
          src={profile.avatar}
          name={profile.name}
          size="xl"
          premium={profile.isPremiumSeller}
        />
        {#if profile.isVerified}
          <div class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        {/if}
      </div>
      
      <!-- Profile Info -->
      <div class="flex-1 min-w-0">
        <!-- Stats Row -->
        <div class="flex justify-between text-center mb-3">
          <div>
            <div class="text-lg font-semibold">{profile.stats.itemsListed}</div>
            <div class="text-xs text-gray-600">Posts</div>
          </div>
          <div>
            <div class="text-lg font-semibold">{profile.stats.followers}</div>
            <div class="text-xs text-gray-600">Followers</div>
          </div>
          <div>
            <div class="text-lg font-semibold">{profile.stats.following}</div>
            <div class="text-xs text-gray-600">Following</div>
          </div>
          <div>
            <div class="text-lg font-semibold flex items-center justify-center">
              <svg class="w-3 h-3 text-yellow-400 fill-current mr-1" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {profile.stats.rating}
            </div>
            <div class="text-xs text-gray-600">Rating</div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <Button 
            onclick={handleFollow}
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            class="flex-1 text-sm"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button onclick={handleMessage} variant="outline" size="sm" class="flex-1 text-sm">
            Message
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Name and Bio -->
    <div class="mt-3">
      <div class="flex items-center space-x-2">
        <h1 class="font-semibold text-sm">{profile.username}</h1>
        {#if profile.isPremiumSeller}
          <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Premium</span>
        {/if}
      </div>
      <p class="text-sm text-gray-600 mt-1">{profile.bio}</p>
      <p class="text-xs text-gray-500 mt-1">{profile.location} • Joined {timeAgo(profile.joinedDate)}</p>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 sticky top-14 sm:top-16 z-20 bg-white">
    <div class="flex">
      <button
        onclick={() => activeTab = 'posts'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'posts' ? 'border-black' : 'border-transparent'}"
      >
        <svg class="w-6 h-6 mx-auto {activeTab === 'posts' ? 'text-black' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onclick={() => activeTab = 'reviews'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'reviews' ? 'border-black' : 'border-transparent'}"
      >
        <svg class="w-6 h-6 mx-auto {activeTab === 'reviews' ? 'text-black' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
      <button
        onclick={() => activeTab = 'about'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'about' ? 'border-black' : 'border-transparent'}"
      >
        <svg class="w-6 h-6 mx-auto {activeTab === 'about' ? 'text-black' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="px-4 py-4">
    {#if activeTab === 'posts'}
      <!-- Products Grid -->
      <div class="grid grid-cols-3 gap-1">
        {#each products as product}
          <button 
            onclick={() => window.location.href = `/product/${product.id}`}
            class="aspect-square bg-gray-100 rounded overflow-hidden"
          >
            <img 
              src={product.images[0]} 
              alt={product.title}
              class="w-full h-full object-cover"
            />
          </button>
        {/each}
      </div>
    {:else if activeTab === 'reviews'}
      <!-- Reviews -->
      <div class="space-y-4">
        {#each reviews as review}
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <Avatar 
                src={review.buyerAvatar}
                name={review.buyerName}
                size="sm"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{review.buyerName}</span>
                  <span class="text-xs text-gray-500">{timeAgo(review.date)}</span>
                </div>
                <div class="flex items-center mb-2">
                  {#each Array(5) as _, i}
                    <svg 
                      class="w-4 h-4 {i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  {/each}
                </div>
                <p class="text-sm text-gray-700">{review.comment}</p>
                <p class="text-xs text-gray-500 mt-1">Purchased: {review.productTitle}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'about'}
      <!-- About -->
      <div class="space-y-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-3">Seller Stats</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Items Sold</span>
              <span class="font-medium">{profile.stats.itemsSold}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Rating</span>
              <span class="font-medium">{profile.stats.rating}/5 ({profile.stats.reviewCount} reviews)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Member Since</span>
              <span class="font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-3">Policies</h3>
          <div class="space-y-2 text-sm text-gray-700">
            <p>• 14-day return policy</p>
            <p>• Ships within 1-2 business days</p>
            <p>• Secure payments through Driplo</p>
            <p>• Response time: Usually within 1 hour</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<BottomNav />