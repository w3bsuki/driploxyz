<script lang="ts">
  import Avatar from '../ui/Avatar.svelte';
  import Button from '../ui/Button.svelte';
  
  interface Translations {
    title?: string;
    unread?: string;
    markAllRead?: string;
    noNotifications?: string;
    notifyWhenSomethingHappens?: string;
    viewAll?: string;
  }
  
  interface Notification {
    id: string;
    type: 'message' | 'like' | 'sale' | 'offer' | 'system';
    title: string;
    message: string;
    sender?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    product?: {
      id: string;
      title: string;
      image: string;
    };
    timestamp: string;
    read: boolean;
    action_url?: string;
  }

  interface Props {
    notifications: Notification[];
    show?: boolean;
    loading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
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
    onClose,
    class: className = '',
    translations = {}
  }: Props = $props();

  const unreadCount = $derived(notifications.filter(n => !n.read).length);

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'message': return '💬';
      case 'like': return '❤️';
      case 'sale': return '💰';
      case 'offer': return '🏷️';
      default: return '📢';
    }
  }

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

  function handleNotificationClick(notification: Notification) {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }

</script>

{#if show}
  <!-- Glass Morphism Backdrop -->
  <button
    class="fixed inset-0 bg-black/20 supports-[backdrop-filter]:backdrop-blur-sm z-[100] border-0 cursor-default"
    onclick={onClose}
    aria-label="Close notifications panel"
    tabindex="-1"
  ></button>

  <!-- Notification Panel -->
  <div class="fixed top-16 left-2 right-2 sm:left-auto sm:right-4 sm:w-96 sm:max-w-[calc(100vw-2rem)] z-[110] {className}">
    <div class="bg-white supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-black/5
      border border-gray-200 supports-[backdrop-filter]:border-white/20 overflow-hidden max-h-[70vh] sm:max-h-[80vh] flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100 supports-[backdrop-filter]:border-gray-100/50 bg-white supports-[backdrop-filter]:bg-white/50">
        <div>
          {#if unreadCount > 0}
            <p class="text-sm font-medium text-gray-900">{unreadCount} {translations.unread || 'unread'}</p>
          {/if}
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
            class="p-1 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100/50"
            aria-label="Close notifications"
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
                  <div class="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded-sm w-1/2"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if notifications.length === 0}
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="text-4xl mb-2">🔔</div>
            <h4 class="font-medium text-gray-900 mb-1">{translations.noNotifications || 'No notifications'}</h4>
            <p class="text-sm text-gray-500">{translations.notifyWhenSomethingHappens || "We'll notify you when something happens"}</p>
          </div>
        {:else}
          <!-- Notifications -->
          <div class="p-2">
            {#each notifications as notification}
              <button
                onclick={() => handleNotificationClick(notification)}
                class="w-full text-left p-3 rounded-xl hover:bg-gray-50/50 transition-colors
                  {!notification.read ? 'bg-blue-50/30 border border-blue-100/50' : ''}"
              >
                <div class="flex items-start space-x-3">
                  <!-- Icon/Avatar -->
                  <div class="shrink-0 relative">
                    {#if notification.sender}
                      <Avatar 
                        src={notification.sender.avatar_url} 
                        name={notification.sender.username} 
                        size="sm" 
                      />
                      <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs">
                        {getNotificationIcon(notification.type)}
                      </div>
                    {:else}
                      <div class="w-8 h-8 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    {/if}
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <h4 class="text-sm font-medium text-gray-900 truncate pr-2">
                        {notification.title}
                      </h4>
                      <span class="text-xs text-gray-500 shrink-0">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p class="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>

                    <!-- Product Preview if Available -->
                    {#if notification.product}
                      <div class="flex items-center space-x-2 mt-2 p-2 bg-gray-50/50 rounded-lg">
                        <img 
                          src={notification.product.image} 
                          alt={notification.product.title}
                          class="w-6 h-6 rounded-sm object-cover"
                        />
                        <span class="text-xs text-gray-500 truncate">
                          {notification.product.title}
                        </span>
                      </div>
                    {/if}
                  </div>

                  <!-- Unread Indicator -->
                  {#if !notification.read}
                    <div class="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      {#if notifications.length > 0}
        <div class="p-3 border-t border-gray-100 supports-[backdrop-filter]:border-gray-100/50 bg-white supports-[backdrop-filter]:bg-white/50">
          <Button 
            variant="ghost" 
            size="sm" 
            href="/notifications"
            class="w-full text-xs text-gray-500"
          >
{translations.viewAll || 'View all notifications'}
          </Button>
        </div>
      {/if}
    </div>
    </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>