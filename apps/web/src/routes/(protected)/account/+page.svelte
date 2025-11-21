<script lang="ts">
  import { Button, Avatar, BottomNav } from '@repo/ui';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import * as i18n from '@repo/i18n';
  import { unreadMessageCount } from '$lib/stores/messageNotifications.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let activeTab = $state<'posts' | 'orders' | 'sales' | 'likes'>('posts');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'shipped': return 'text-[var(--brand-primary-strong)]';
      case 'paid': return 'text-orange-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return i18n.orders_statusDelivered();
      case 'shipped': return i18n.orders_statusShipped();
      case 'paid': return i18n.orders_statusPaid();
      case 'pending': return i18n.orders_statusPending();
      case 'cancelled': return i18n.orders_statusCancelled();
      default: return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (amount: number, currency: string = 'BGN') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
</script>

<svelte:head>
  <title>My Account - Driplo</title>
  <meta name="description" content="Manage your listings, orders, and account settings" />
</svelte:head>

<div class="min-h-screen bg-white pb-20 sm:pb-0">

  <!-- Profile Section -->
  <div class="px-4 py-6 overflow-visible">
    <div class="flex items-start space-x-4">
      <!-- Avatar -->
      <div class="relative">
        <Avatar 
          src={data.profile.avatar_url}
          name={data.profile.full_name || data.profile.username}
          size="xl"
        />
  {#if data.profile.verified}
          <div class="absolute -bottom-1 -right-1 bg-[var(--surface-brand-strong)]/50 rounded-full p-1">
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
            <div class="text-lg font-semibold">{data.listings?.length || 0}</div>
            <div class="text-xs text-gray-600">{i18n.profile_posts()}</div>
          </div>
          <button
            onclick={() => activeTab = 'orders'}
            class="hover:bg-gray-50 rounded p-1"
          >
            <div class="text-lg font-semibold">{data.orders?.length || 0}</div>
            <div class="text-xs text-gray-600">Orders</div>
          </button>
          <button
            onclick={() => activeTab = 'sales'}
            class="hover:bg-gray-50 rounded p-1"
          >
            <div class="text-lg font-semibold">{data.sales?.length || 0}</div>
            <div class="text-xs text-gray-600">Sales</div>
          </button>
          <button
            onclick={() => activeTab = 'likes'}
            class="hover:bg-gray-50 rounded p-1"
          >
            <div class="text-lg font-semibold">{data.favorites?.length || 0}</div>
            <div class="text-xs text-gray-600">{i18n.profile_likes ? i18n.profile_likes() : 'Likes'}</div>
          </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <Button 
            onclick={() => goto('/dashboard/profile/edit')}
            variant="outline" 
            size="sm" 
            class="flex-1 text-sm"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Name and Bio -->
    <div class="mt-3">
      <div class="flex items-center space-x-2 flex-wrap gap-y-1">
        <h1 class="font-semibold text-sm">{data.profile.username}</h1>
        
        <!-- Rating -->
        {#if data.profile.rating}
          <div class="flex items-center space-x-1">
            <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-xs text-gray-600">{data.profile.rating.toFixed(1)}</span>
          </div>
        {/if}
      </div>
      <p class="text-xs text-gray-500">
        {i18n.profile_joined()} {data.profile.created_at ? new Date(data.profile.created_at).toLocaleDateString() : ''}
        {#if data.profile.location} • {data.profile.location}{/if}
      </p>
      {#if data.profile.bio}
        <p class="text-sm text-gray-600 mt-1">{data.profile.bio}</p>
      {/if}
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 sticky top-14 sm:top-16 z-20 bg-white">
    <div class="flex">
      <button
        onclick={() => activeTab = 'posts'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'posts' ? 'border-black text-black' : 'border-transparent text-gray-500'}"
      >
        <span class="text-sm font-medium">Posts</span>
      </button>
      <button
        onclick={() => activeTab = 'orders'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-gray-500'}"
      >
        <span class="text-sm font-medium">Orders</span>
      </button>
      <button
        onclick={() => activeTab = 'sales'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'sales' ? 'border-black text-black' : 'border-transparent text-gray-500'}"
      >
        <span class="text-sm font-medium">Sales</span>
      </button>
      <button
        onclick={() => activeTab = 'likes'}
        class="flex-1 py-3 text-center border-b-2 transition-colors {activeTab === 'likes' ? 'border-black text-black' : 'border-transparent text-gray-500'}"
      >
        <span class="text-sm font-medium">Likes</span>
      </button>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="px-4 py-4">
    {#if activeTab === 'posts'}
      <!-- Products Grid -->
      {#if data.listings && data.listings.length > 0}
        <div class="grid grid-cols-3 gap-1">
          {#each data.listings as product}
            <a
              href="{getProductUrl(product)}"
              class="aspect-square bg-gray-100 rounded-sm overflow-hidden block"
            >
              <img 
                src={product.images[0] || '/placeholder-product.svg'} 
                alt={product.title}
                class="w-full h-full object-cover"
              />
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 text-gray-500">
          <p>{i18n.profile_noListingsYet()}</p>
        </div>
      {/if}

    {:else if activeTab === 'orders'}
      <!-- My Orders (as buyer) -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">My Orders</h2>
        {#if data.orders.length > 0}
          <div class="space-y-3">
            {#each data.orders as order}
              <div class="bg-white border rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  {#if order.product?.images && order.product.images[0]}
                    <img 
                      src={order.product.images[0]} 
                      alt={order.product.title}
                      class="w-16 h-16 object-cover rounded"
                    />
                  {:else}
                    <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span class="text-gray-400 text-xs">No image</span>
                    </div>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium text-sm line-clamp-2">{order.product?.title || 'Unknown Product'}</h4>
                      <span class="text-sm font-semibold whitespace-nowrap ml-2">{formatPrice(order.total_amount, order.currency ?? 'BGN')}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                      <span>From {order.seller?.username ?? 'Unknown Seller'}</span>
                      <span class="{getStatusColor(order.status ?? '')} font-medium">{getStatusText(order.status ?? '')}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">{order.created_at ? formatDate(order.created_at) : ''}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 text-gray-500">
            <p>You haven't made any purchases yet</p>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'sales'}
      <!-- My Sales (as seller) -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">My Sales</h2>
        {#if data.sales.length > 0}
          <div class="space-y-3">
            {#each data.sales as sale}
              <div class="bg-white border rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  {#if sale.product?.images && sale.product.images[0]}
                    <img 
                      src={sale.product.images[0]} 
                      alt={sale.product.title}
                      class="w-16 h-16 object-cover rounded"
                    />
                  {:else}
                    <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span class="text-gray-400 text-xs">No image</span>
                    </div>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium text-sm line-clamp-2">{sale.product?.title || 'Unknown Product'}</h4>
                      <div class="text-right whitespace-nowrap ml-2">
                        <div class="text-sm font-semibold">{formatPrice(sale.total_amount, sale.currency ?? 'BGN')}</div>
                        <div class="text-xs text-green-600">+{formatPrice(sale.seller_net_amount || 0, sale.currency ?? 'BGN')} earned</div>
                      </div>
                    </div>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                      <span>Sold to {sale.buyer?.username ?? 'Unknown Buyer'}</span>
                      <span class="{getStatusColor(sale.status ?? '')} font-medium">{getStatusText(sale.status ?? '')}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">{sale.created_at ? formatDate(sale.created_at) : ''}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 text-gray-500">
            <p>You haven't made any sales yet</p>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'likes'}
      <!-- Liked Items -->
      {#if data.favorites && data.favorites.length > 0}
        <div class="grid grid-cols-3 gap-1">
          {#each data.favorites as product}
            <a
              href="/products/{product.id}"
              class="aspect-square bg-gray-100 rounded-sm overflow-hidden block"
            >
              <img 
                src={product.images[0] || '/placeholder-product.svg'} 
                alt={product.title}
                class="w-full h-full object-cover"
              />
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 text-gray-500">
          <p>No liked items yet</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<BottomNav 
  currentPath={page.url.pathname}
  unreadMessageCount={unreadMessageCount()}
  profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
  isAuthenticated={!!data.user}
  labels={{
    home: i18n.nav_home(),
    search: i18n.nav_search(),
    sell: i18n.nav_sell(),
    messages: i18n.nav_messages(),
    profile: i18n.nav_profile()
  }}
/>
