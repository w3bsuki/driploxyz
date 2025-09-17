import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

interface OrderNotification {
  id: string;
  user_id: string;
  type: 'sale' | 'purchase';
  title: string;
  message: string;
  related_id?: string;
  related_table?: string;
  read: boolean;
  created_at: string;
}

interface OrderNotificationStore {
  notifications: OrderNotification[];
  unreadCount: number;
}

const initialStore: OrderNotificationStore = {
  notifications: [],
  unreadCount: 0
};

export const orderNotifications = writable<OrderNotificationStore>(initialStore);

export const unreadOrderCount = derived(
  orderNotifications,
  ($store) => $store.unreadCount
);

export const activeOrderNotification = writable<OrderNotification | null>(null);

const notificationQueue: OrderNotification[] = [];
let isShowingNotification = false;
let realtimeChannel: RealtimeChannel | null = null;

export const orderNotificationActions = {
  addNotification: (notification: OrderNotification) => {
    // Update the store
    orderNotifications.update(store => ({
      ...store,
      notifications: [notification, ...store.notifications.slice(0, 19)], // Keep last 20
      unreadCount: !notification.read ? store.unreadCount + 1 : store.unreadCount
    }));

    // Show toast notification
    if (browser && !notification.read) {
      showToastNotification(notification);
    }
  },

  markAsRead: async (notificationId: string, supabase: SupabaseClient) => {
    // Update in database
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    // Update store
    orderNotifications.update(store => {
      const notification = store.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        return {
          ...store,
          notifications: [...store.notifications],
          unreadCount: Math.max(0, store.unreadCount - 1)
        };
      }
      return store;
    });
  },

  markAllAsRead: async (supabase: SupabaseClient, userId: string) => {
    // Update in database
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    // Update store
    orderNotifications.update(store => ({
      ...store,
      notifications: store.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearAll: () => {
    orderNotifications.set({
      notifications: [],
      unreadCount: 0
    });
  },

  // Initialize real-time subscription
  subscribeToNotifications: (supabase: SupabaseClient, userId: string) => {
    if (!browser || !userId) return () => {};

    // Setup subscription asynchronously
    (async () => {
      // Clean up existing subscription
      if (realtimeChannel) {
        await supabase.removeChannel(realtimeChannel);
      }

      // Load initial notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .in('type', ['sale', 'purchase'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifications) {
        const unreadCount = notifications.filter(n => !n.read).length;
        orderNotifications.set({
          notifications,
          unreadCount
        });
      }

      // Subscribe to new notifications
      realtimeChannel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const notification = payload.new as OrderNotification;
            if (notification.type === 'sale' || notification.type === 'purchase') {
              orderNotificationActions.addNotification(notification);
            }
          }
        )
        .subscribe();
    })();
    
    // Return cleanup function
    return () => {
      orderNotificationActions.unsubscribe(supabase);
    };
  },

  unsubscribe: async (supabase: SupabaseClient) => {
    if (realtimeChannel) {
      await supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }
};

function showToastNotification(notification: OrderNotification) {
  // Add to queue if currently showing a notification
  if (isShowingNotification) {
    notificationQueue.push(notification);
    return;
  }

  isShowingNotification = true;
  activeOrderNotification.set(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    activeOrderNotification.set(null);
    isShowingNotification = false;

    // Show next notification in queue
    if (notificationQueue.length > 0) {
      const next = notificationQueue.shift()!;
      setTimeout(() => showToastNotification(next), 500);
    }
  }, 5000); // 5 seconds display time
}

export const handleOrderNotificationClick = (notification: OrderNotification) => {
  if (notification.type === 'sale') {
    goto('/dashboard?tab=sold');
  } else if (notification.type === 'purchase') {
    goto('/dashboard?tab=purchases');
  }
  
  // Mark as read is handled separately when needed
};