<script lang="ts">
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Check if we're navigating to this page
  const isLoading = $derived($navigating && $navigating.to?.url.pathname.startsWith('/profile'));
</script>

{#if isLoading}
  <!-- Skeleton loader for profile page -->
  <div class="container mx-auto px-4 py-8 animate-pulse">
    <!-- Profile header skeleton -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex items-start space-x-4">
        <div class="w-24 h-24 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div class="flex space-x-4">
            <div class="h-4 bg-gray-200 rounded w-20"></div>
            <div class="h-4 bg-gray-200 rounded w-20"></div>
            <div class="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Products grid skeleton -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each Array(8) as _}
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="aspect-square bg-gray-200"></div>
          <div class="p-3">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <!-- Actual profile content -->
  <div class="container mx-auto px-4 py-8">
    <!-- Profile header -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex items-start space-x-4">
        {#if data.profile.avatar_url}
          <img 
            src={data.profile.avatar_url} 
            alt={data.profile.username}
            class="w-24 h-24 rounded-full object-cover"
          />
        {:else}
          <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-2xl font-semibold text-gray-500">
              {data.profile.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        {/if}
        
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 mb-1">
            {data.profile.username}
          </h1>
          
          {#if data.profile.bio}
            <p class="text-gray-600 mb-4">{data.profile.bio}</p>
          {/if}
          
          <div class="flex items-center space-x-6 text-sm">
            <div>
              <span class="font-semibold">{data.profile.products_count || 0}</span>
              <span class="text-gray-500 ml-1">products</span>
            </div>
            <div>
              <span class="font-semibold">{data.profile.followers_count || 0}</span>
              <span class="text-gray-500 ml-1">followers</span>
            </div>
            <div>
              <span class="font-semibold">{data.profile.following_count || 0}</span>
              <span class="text-gray-500 ml-1">following</span>
            </div>
          </div>
          
          {#if data.isOwnProfile}
            <div class="mt-4">
              <a 
                href="/profile/edit" 
                class="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                data-sveltekit-preload-data="hover"
              >
                Edit Profile
              </a>
            </div>
          {:else if data.currentUser}
            <div class="mt-4 flex space-x-2">
              <button class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Follow
              </button>
              <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Message
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Products grid -->
    {#if data.products && data.products.length > 0}
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">Products</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each data.products as product}
            <a 
              href="/product/{product.id}"
              class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              data-sveltekit-preload-data="hover"
            >
              {#if product.images?.[0]}
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  class="aspect-square object-cover"
                />
              {:else}
                <div class="aspect-square bg-gray-100 flex items-center justify-center">
                  <span class="text-gray-400">No image</span>
                </div>
              {/if}
              <div class="p-3">
                <h3 class="font-medium text-gray-900 truncate">{product.title}</h3>
                <p class="text-gray-600">${product.price}</p>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500">No products yet</p>
      </div>
    {/if}
    
    <!-- Reviews section -->
    {#if data.reviews && data.reviews.length > 0}
      <div class="mt-8">
        <h2 class="text-lg font-semibold mb-4">Reviews</h2>
        <div class="space-y-4">
          {#each data.reviews as review}
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-start space-x-3">
                {#if review.reviewer.avatar_url}
                  <img 
                    src={review.reviewer.avatar_url} 
                    alt={review.reviewer.username}
                    class="w-10 h-10 rounded-full"
                  />
                {:else}
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                {/if}
                <div class="flex-1">
                  <div class="flex items-center mb-1">
                    <span class="font-medium">{review.reviewer.username}</span>
                    <div class="ml-2 flex text-yellow-400">
                      {#each Array(5) as _, i}
                        <svg 
                          class="w-4 h-4 {i < review.rating ? 'fill-current' : 'fill-none'}" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      {/each}
                    </div>
                  </div>
                  <p class="text-gray-600">{review.comment}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}