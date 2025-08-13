<script lang="ts">
  import { Button, Avatar, ProductCard } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let activeTab = $state<'posts' | 'reviews' | 'about'>('posts');
  let isFollowing = $state(false);
  
  function handleFollow() {
    if (!data.currentUser) {
      goto('/login');
      return;
    }
    isFollowing = !isFollowing;
    // TODO: Implement follow functionality
  }
  
  function handleMessage() {
    if (!data.currentUser) {
      goto('/login');
      return;
    }
    goto(`/messages/new?to=${data.profile.id}`);
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
  <title>{data.profile.username || 'User'} - Driplo Profile</title>
  <meta name="description" content="{data.profile.bio || ''}" />
</svelte:head>

<div class="min-h-screen bg-white pb-20 sm:pb-0">
  <Header />

  <!-- Profile Section -->
  <div class="px-4 py-6">
    <div class="flex items-start space-x-4">
      <!-- Avatar -->
      <div class="relative">
        <Avatar 
          src={data.profile.avatar_url}
          name={data.profile.full_name || data.profile.username}
          size="xl"
        />
        {#if data.profile.is_verified}
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
            <div class="text-lg font-semibold">{data.profile.active_listings || 0}</div>
            <div class="text-xs text-gray-600">Posts</div>
          </div>
          <div>
            <div class="text-lg font-semibold">{data.profile.sold_listings || 0}</div>
            <div class="text-xs text-gray-600">Sold</div>
          </div>
          <div>
            <div class="text-lg font-semibold">{data.profile.sales_count || 0}</div>
            <div class="text-xs text-gray-600">Sales</div>
          </div>
          <div>
            <div class="text-lg font-semibold flex items-center justify-center">
              {#if data.profile.rating}
                <svg class="w-3 h-3 text-yellow-400 fill-current mr-1" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {data.profile.rating.toFixed(1)}
              {:else}
                -
              {/if}
            </div>
            <div class="text-xs text-gray-600">Rating</div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        {#if data.isOwnProfile}
          <div class="flex space-x-2">
            <a href="/settings/profile" class="flex-1">
              <Button variant="outline" size="sm" class="w-full text-sm">Edit Profile</Button>
            </a>
            <a href="/dashboard" class="flex-1">
              <Button size="sm" class="w-full text-sm">Dashboard</Button>
            </a>
          </div>
        {:else}
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
        {/if}
      </div>
    </div>
    
    <!-- Name and Bio -->
    <div class="mt-3">
      <div class="flex items-center space-x-2">
        <h1 class="font-semibold text-sm">{data.profile.username}</h1>
        {#if data.profile.role === 'seller' && data.profile.sales_count > 10}
          <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Premium</span>
        {/if}
      </div>
      {#if data.profile.bio}
        <p class="text-sm text-gray-600 mt-1">{data.profile.bio}</p>
      {/if}
      <p class="text-xs text-gray-500 mt-1">
        {#if data.profile.location}{data.profile.location} • {/if}
        Joined {timeAgo(data.profile.created_at)}
      </p>
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
      {#if data.products.length > 0}
        <div class="grid grid-cols-3 gap-1">
          {#each data.products as product}
            <a
              href="/product/{product.id}"
              class="aspect-square bg-gray-100 rounded overflow-hidden block"
            >
              <img 
                src={product.images[0]?.image_url || '/placeholder-product.svg'} 
                alt={product.title}
                class="w-full h-full object-cover"
              />
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 text-gray-500">
          <p>No listings yet</p>
        </div>
      {/if}
    {:else if activeTab === 'reviews'}
      <!-- Reviews -->
      {#if data.reviews.length > 0}
        <div class="space-y-4">
          {#each data.reviews as review}
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <Avatar 
                  src={review.reviewer?.avatar_url}
                  name={review.reviewer?.username || 'User'}
                  size="sm"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium">{review.reviewer?.username || 'Anonymous'}</span>
                    <span class="text-xs text-gray-500">{timeAgo(review.created_at)}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    {#each Array(5) as _, i}
                      <svg 
                        class="w-4 h-4 {i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    {/each}
                  </div>
                  {#if review.comment}
                    <p class="text-sm text-gray-700">{review.comment}</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 text-gray-500">
          <p>No reviews yet</p>
        </div>
      {/if}
    {:else if activeTab === 'about'}
      <!-- About -->
      <div class="space-y-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-3">Seller Stats</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Items Sold</span>
              <span class="font-medium">{data.profile.sold_listings || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Rating</span>
              <span class="font-medium">
                {#if data.profile.rating}
                  {data.profile.rating.toFixed(1)}/5 ({data.profile.review_count || 0} reviews)
                {:else}
                  No ratings yet
                {/if}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Member Since</span>
              <span class="font-medium">{new Date(data.profile.created_at).toLocaleDateString()}</span>
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