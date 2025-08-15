<script lang="ts">
  import Avatar from './Avatar.svelte';
  import Button from './Button.svelte';
  
  interface SoldNotification {
    id: string;
    product: {
      id: string;
      title: string;
      image: string;
      price: number;
    };
    buyer?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    order_id?: string;
    sold_at: string;
    read: boolean;
  }

  interface Translations {
    salesActivity?: string;
    newSales?: string;
    earned?: string;
    markAllRead?: string;
    noSalesYet?: string;
    notifyWhenItemsSell?: string;
    itemSold?: string;
    soldTo?: string;
    viewOrderDetails?: string;
    totalSales?: string;
    totalSalesPlural?: string;
    viewAllSales?: string;
  }

  interface Props {
    notifications: SoldNotification[];
    show?: boolean;
    loading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewOrder?: (orderId: string) => void;
    onClose?: () => void;
    class?: string;
    translations?: Translations;
  }

  let { 
    notifications = [],
    show = false,
    loading = false,
    onMarkAsRead,
    onMarkAllAsRead,
    onViewOrder,
    onClose,
    class: className = '',
    translations = {}
  }: Props = $props();

  const unreadCount = $derived(notifications.filter(n => !n.read).length);
  const totalEarnings = $derived(
    notifications.reduce((sum, n) => sum + n.product.price, 0)
  );

  function getTimeAgo(timestamp: string) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  function handleNotificationClick(notification: SoldNotification) {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onViewOrder && notification.order_id) {
      onViewOrder(notification.order_id);
    }
  }
</script>

{#if show}
  <!-- Glass Morphism Backdrop -->
  <div 
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
    onclick={onClose}
    role="button"
    tabindex="-1"
  ></div>

  <!-- Sold Notification Panel -->
  <div class="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 {className}">
    <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/5 
      border border-white/20 overflow-hidden max-h-[80vh] flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100/50 bg-white/50">
        <div>
          <h3 class="font-semibold text-gray-900 flex items-center">
            <span class="text-green-600 mr-2">💰</span>
            {translations.salesActivity || 'Sales Activity'}
          </h3>
          <div class="flex items-center space-x-4 text-xs text-gray-600 mt-1">
            {#if unreadCount > 0}
              <span>{unreadCount} {translations.newSales || 'new'}</span>
            {/if}
            {#if notifications.length > 0}
              <span>${totalEarnings.toFixed(2)} {translations.earned || 'earned'}</span>
            {/if}
          </div>
        </div>
        <div class="flex items-center space-x-2">
          {#if unreadCount > 0 && onMarkAllAsRead}
            <Button 
              variant="ghost" 
              size="sm" 
              onclick={onMarkAllAsRead}
              class="text-xs"
            >
              {translations.markAllRead || 'Mark all read'}
            </Button>
          {/if}
          <button 
            onclick={onClose}
            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        {#if loading}
          <!-- Loading State -->
          <div class="p-4 space-y-3">
            {#each Array(3) as _}
              <div class="flex items-start space-x-3 p-3 rounded-xl bg-gray-50/50 animate-pulse">
                <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if notifications.length === 0}
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="text-4xl mb-2">🛍️</div>
            <h4 class="font-medium text-gray-900 mb-1">{translations.noSalesYet || 'No sales yet'}</h4>
            <p class="text-sm text-gray-600">{translations.notifyWhenItemsSell || 'We\'ll notify you when items sell'}</p>
          </div>
        {:else}
          <!-- Sold Items -->
          <div class="p-2">
            {#each notifications as notification}
              <button
                onclick={() => handleNotificationClick(notification)}
                class="w-full text-left p-3 rounded-xl hover:bg-gray-50/50 transition-colors
                  {!notification.read ? 'bg-green-50/30 border border-green-100/50' : ''}"
              >
                <div class="flex items-start space-x-3">
                  <!-- Success Icon with Product Image -->
                  <div class="flex-shrink-0 relative">
                    <img 
                      src={notification.product.image} 
                      alt={notification.product.title}
                      class="w-10 h-10 rounded-lg object-cover"
                    />
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <h4 class="text-sm font-medium text-gray-900 truncate pr-2">
                        {translations.itemSold || 'Item sold!'}
                      </h4>
                      <div class="text-right flex-shrink-0">
                        <div class="text-sm font-bold text-green-600">
                          +${notification.product.price.toFixed(2)}
                        </div>
                        <div class="text-xs text-gray-500">
                          {getTimeAgo(notification.sold_at)}
                        </div>
                      </div>
                    </div>
                    
                    <p class="text-sm text-gray-600 mt-0.5 truncate">
                      {notification.product.title}
                    </p>

                    <!-- Buyer Info if Available -->
                    {#if notification.buyer}
                      <div class="flex items-center space-x-2 mt-2 p-2 bg-gray-50/50 rounded-lg">
                        <Avatar 
                          src={notification.buyer.avatar_url} 
                          name={notification.buyer.username} 
                          size="xs" 
                        />
                        <span class="text-xs text-gray-600">
                          {translations.soldTo || 'Sold to'} {notification.buyer.username}
                        </span>
                      </div>
                    {/if}

                    <!-- Order Actions -->
                    {#if notification.order_id}
                      <div class="mt-2">
                        <span class="text-xs text-blue-600 hover:text-blue-800">
                          {translations.viewOrderDetails || 'View order details'} →
                        </span>
                      </div>
                    {/if}
                  </div>

                  <!-- Unread Indicator -->
                  {#if !notification.read}
                    <div class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      {#if notifications.length > 0}
        <div class="p-3 border-t border-gray-100/50 bg-white/50">
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-600">
              {notifications.length} {notifications.length === 1 ? (translations.totalSales || 'total sale') : (translations.totalSalesPlural || 'total sales')}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              href="/dashboard/sales"
              class="text-xs text-gray-600"
            >
              {translations.viewAllSales || 'View all sales'}
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}