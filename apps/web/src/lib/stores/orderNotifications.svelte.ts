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

interface OrderNotificationState {
  notifications: OrderNotification[];
  unreadCount: number;
  activeNotification: OrderNotification | null;
  queue: OrderNotification[];
  isShowing: boolean;
  realtimeChannel: RealtimeChannel | null;
}

export function createOrderNotificationsStore() {
  const state = $state<OrderNotificationState>({
    notifications: [],
    unreadCount: 0,
    activeNotification: null,
    queue: [],
    isShowing: false,
    realtimeChannel: null
  });

  const unreadCount = $derived(state.unreadCount);

  return {
    get notifications() { return state.notifications; },
    get unreadCount() { return unreadCount; },
    get activeNotification() { return state.activeNotification; },
    get isShowing() { return state.isShowing; },

    setNotifications: (notifications: OrderNotification[]) => {
      state.notifications = notifications;
      state.unreadCount = notifications.filter(n => !n.read).length;
    },

    addNotification: (notification: OrderNotification) => {
      state.notifications = [notification, ...state.notifications.slice(0, 19)];
      if (!notification.read) {
        state.unreadCount += 1;
      }
    },

    markAsRead: (notificationId: string) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.notifications = [...state.notifications]; // Trigger reactivity
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: () => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    },

    clearAll: () => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    setActive: (notification: OrderNotification | null) => {
      state.activeNotification = notification;
    },

    setShowing: (showing: boolean) => {
      state.isShowing = showing;
    },

    addToQueue: (notification: OrderNotification) => {
      state.queue = [...state.queue, notification];
    },

    shiftQueue: (): OrderNotification | undefined => {
      const next = state.queue[0];
      if (next) {
        state.queue = state.queue.slice(1);
      }
      return next;
    },

    setRealtimeChannel: (channel: RealtimeChannel | null) => {
      state.realtimeChannel = channel;
    },

    getRealtimeChannel: () => state.realtimeChannel
  };
}

// Global store instance
export const orderNotificationsStore = createOrderNotificationsStore();

// Export activeOrderNotification for compatibility
export const activeOrderNotification = {
  get value() { return orderNotificationsStore.activeNotification; }
};

export const orderNotificationActions = {
  addNotification: (notification: OrderNotification) => {
    // Update the store
    orderNotificationsStore.addNotification(notification);

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
    orderNotificationsStore.markAsRead(notificationId);
  },

  markAllAsRead: async (supabase: SupabaseClient, userId: string) => {
    // Update in database
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    // Update store
    orderNotificationsStore.markAllAsRead();
  },

  clearAll: () => {
    orderNotificationsStore.clearAll();
  },

  // Initialize real-time subscription
  subscribeToNotifications: (supabase: SupabaseClient, userId: string) => {
    if (!browser || !userId) return () => {};

    // Setup subscription asynchronously
    (async () => {
      // Clean up existing subscription
      const existingChannel = orderNotificationsStore.getRealtimeChannel();
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
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
        orderNotificationsStore.setNotifications(notifications);
      }

      // Subscribe to new notifications
      const realtimeChannel = supabase
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

      orderNotificationsStore.setRealtimeChannel(realtimeChannel);
    })();

    // Return cleanup function
    return () => {
      orderNotificationActions.unsubscribe(supabase);
    };
  },

  unsubscribe: async (supabase: SupabaseClient) => {
    const realtimeChannel = orderNotificationsStore.getRealtimeChannel();
    if (realtimeChannel) {
      await supabase.removeChannel(realtimeChannel);
      orderNotificationsStore.setRealtimeChannel(null);
    }
  }
};

function showToastNotification(notification: OrderNotification) {
  // Add to queue if currently showing a notification
  if (orderNotificationsStore.isShowing) {
    orderNotificationsStore.addToQueue(notification);
    return;
  }

  orderNotificationsStore.setShowing(true);
  orderNotificationsStore.setActive(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    orderNotificationsStore.setActive(null);
    orderNotificationsStore.setShowing(false);

    // Show next notification in queue
    const next = orderNotificationsStore.shiftQueue();
    if (next) {
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