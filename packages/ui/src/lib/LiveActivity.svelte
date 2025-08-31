<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut, elasticOut } from 'svelte/easing';

  interface ActivityEvent {
    id: string;
    type: 'view' | 'cart' | 'purchase' | 'favorite' | 'offer';
    user?: string;
    timestamp: string;
    amount?: number;
    avatar?: string;
  }

  interface Props {
    productId: string;
    currentViewers?: number;
    inCarts?: number;
    recentActivity?: ActivityEvent[];
    lastSold?: {
      amount: number;
      date: string;
    };
    totalViews?: number;
    totalFavorites?: number;
    class?: string;
  }

  let { 
    productId,
    currentViewers = 0,
    inCarts = 0,
    recentActivity = [],
    lastSold,
    totalViews = 0,
    totalFavorites = 0,
    class: className = '' 
  }: Props = $props();

  let currentEventIndex = $state(0);
  let showActivity = $state(true);

  // Auto-cycle through activities
  $effect(() => {
    if (recentActivity.length > 1) {
      const interval = setInterval(() => {
        currentEventIndex = (currentEventIndex + 1) % recentActivity.length;
      }, 4000);
      
      return () => clearInterval(interval);
    }
  });

  function formatTimeAgo(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getActivityIcon(type: string) {
    const icons = {
      'view': '👀',
      'cart': '🛒',
      'purchase': '✅',
      'favorite': '❤️',
      'offer': '💬'
    };
    return icons[type] || '👀';
  }

  function getActivityMessage(event: ActivityEvent) {
    const userName = event.user || 'Someone';
    
    switch (event.type) {
      case 'view':
        return `${userName} is viewing this item`;
      case 'cart':
        return `${userName} added this to cart`;
      case 'purchase':
        return `${userName} purchased this for $${event.amount}`;
      case 'favorite':
        return `${userName} favorited this item`;
      case 'offer':
        return `${userName} made an offer of $${event.amount}`;
      default:
        return `${userName} is interested in this item`;
    }
  }

  function getActivityColor(type: string) {
    const colors = {
      'view': 'text-blue-600',
      'cart': 'text-orange-600',
      'purchase': 'text-green-600',
      'favorite': 'text-red-600',
      'offer': 'text-purple-600'
    };
    return colors[type] || 'text-gray-500';
  }

  const urgencyLevel = $derived(() => {
    if (inCarts >= 3) return 'high';
    if (inCarts >= 1 || currentViewers >= 5) return 'medium';
    return 'low';
  });

  const urgencyMessage = $derived(() => {
    if (urgencyLevel === 'high') return 'High demand! Multiple people have this in their cart';
    if (urgencyLevel === 'medium') return 'Popular item - others are interested';
    return '';
  });
</script>

<div class="space-y-3 {className}">
  <!-- Current Activity Stats -->
  <div class="flex items-center justify-between text-sm">
    <div class="flex items-center gap-4">
      {#if currentViewers > 0}
        <div class="flex items-center gap-1 text-blue-600">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span class="font-medium">{currentViewers} viewing</span>
        </div>
      {/if}
      
      {#if inCarts > 0}
        <div class="flex items-center gap-1 text-orange-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m4.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          </svg>
          <span class="font-medium">{inCarts} in cart</span>
        </div>
      {/if}
    </div>

    <div class="text-gray-500">
      {totalViews} views • {totalFavorites} favorites
    </div>
  </div>

  <!-- Urgency Message -->
  {#if urgencyMessage}
    <div 
      class="flex items-center gap-2 p-3 rounded-lg {urgencyLevel === 'high' ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-800'}"
      in:fly={{ y: -10, duration: 300, easing: quintOut }}
    >
      <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span class="text-sm font-medium">{urgencyMessage}</span>
    </div>
  {/if}

  <!-- Recent Activity Feed -->
  {#if recentActivity.length > 0}
    <div class="bg-gray-50 rounded-lg p-3 space-y-2">
      <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Live activity
      </h4>
      
      <div class="space-y-2 max-h-32 overflow-hidden">
        {#each recentActivity.slice(0, 3) as event, index}
          <div 
            class="flex items-center gap-3 text-sm p-2 bg-white rounded-lg shadow-xs"
            in:fly={{ x: -20, duration: 300, delay: index * 100, easing: quintOut }}
          >
            <!-- Avatar or Icon -->
            {#if event.avatar}
              <img src={event.avatar} alt={event.user} class="w-6 h-6 rounded-full" />
            {:else}
              <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                {getActivityIcon(event.type)}
              </div>
            {/if}
            
            <!-- Activity Message -->
            <div class="flex-1 min-w-0">
              <p class="text-gray-900 truncate {getActivityColor(event.type)}">
                {getActivityMessage(event)}
              </p>
              <p class="text-xs text-gray-500">{formatTimeAgo(event.timestamp)}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Last Sold Info -->
  {#if lastSold}
    <div 
      class="bg-green-50 border border-green-200 rounded-lg p-3"
      in:scale={{ duration: 300, delay: 200, easing: elasticOut }}
    >
      <div class="flex items-center gap-2 text-green-800">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="text-sm font-medium">Last sold for ${lastSold.amount}</p>
          <p class="text-xs text-green-600">{formatTimeAgo(lastSold.date)}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Social Proof Summary -->
  <div class="grid grid-cols-3 gap-2 text-center">
    <div class="bg-white border rounded-lg p-2">
      <div class="text-lg font-bold text-gray-900">{totalViews}</div>
      <div class="text-xs text-gray-500">Total views</div>
    </div>
    <div class="bg-white border rounded-lg p-2">
      <div class="text-lg font-bold text-gray-900">{totalFavorites}</div>
      <div class="text-xs text-gray-500">Favorites</div>
    </div>
    <div class="bg-white border rounded-lg p-2">
      <div class="text-lg font-bold text-gray-900">{recentActivity.length}</div>
      <div class="text-xs text-gray-500">Recent activity</div>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>