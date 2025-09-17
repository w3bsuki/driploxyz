import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

interface MessageNotification {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  timestamp: Date;
  isProductMessage: boolean;
}

interface MessageNotificationStore {
  notifications: MessageNotification[];
  unreadCount: number;
}

const initialStore: MessageNotificationStore = {
  notifications: [],
  unreadCount: 0
};

export const messageNotifications = writable<MessageNotificationStore>(initialStore);

export const unreadMessageCount = derived(
  messageNotifications,
  ($store) => $store.unreadCount
);

export const activeNotification = writable<MessageNotification | null>(null);

const notificationQueue: MessageNotification[] = [];
let isShowingNotification = false;

// Fallback UUID generator for older browsers
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const messageNotificationActions = {
  addNotification: (notification: Omit<MessageNotification, 'id' | 'timestamp'>) => {
    const fullNotification: MessageNotification = {
      ...notification,
      id: generateUUID(),
      timestamp: new Date()
    };

    // Update the store
    messageNotifications.update(store => ({
      ...store,
      notifications: [fullNotification, ...store.notifications.slice(0, 9)], // Keep last 10
      unreadCount: store.unreadCount + 1
    }));

    // Only show toast for product messages when not on messages page
    if (browser && fullNotification.isProductMessage && !window.location.pathname.startsWith('/messages')) {
      showToastNotification(fullNotification);
    }
  },

  markAsRead: (notificationId: string) => {
    messageNotifications.update(store => {
      const notification = store.notifications.find(n => n.id === notificationId);
      if (notification) {
        return {
          ...store,
          unreadCount: Math.max(0, store.unreadCount - 1)
        };
      }
      return store;
    });
  },

  clearAll: () => {
    messageNotifications.set({
      notifications: [],
      unreadCount: 0
    });
  },

  setUnreadCount: (count: number) => {
    messageNotifications.update(store => ({
      ...store,
      unreadCount: count
    }));
  },

  incrementUnread: () => {
    messageNotifications.update(store => ({
      ...store,
      unreadCount: store.unreadCount + 1
    }));
  },

  decrementUnread: () => {
    messageNotifications.update(store => ({
      ...store,
      unreadCount: Math.max(0, store.unreadCount - 1)
    }));
  }
};

function showToastNotification(notification: MessageNotification) {
  // Add to queue if currently showing a notification
  if (isShowingNotification) {
    notificationQueue.push(notification);
    return;
  }

  isShowingNotification = true;
  activeNotification.set(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    activeNotification.set(null);
    isShowingNotification = false;

    // Show next notification in queue
    if (notificationQueue.length > 0) {
      const next = notificationQueue.shift()!;
      setTimeout(() => showToastNotification(next), 500);
    }
  }, 6500); // Slightly longer than toast auto-hide duration
}

export const handleNotificationClick = (notification: MessageNotification) => {
  const conversationParam = notification.isProductMessage && notification.productId
    ? `${notification.senderId}__${notification.productId}`
    : `${notification.senderId}__general`;
  
  goto(`/messages?conversation=${conversationParam}`);
  messageNotificationActions.markAsRead(notification.id);
};