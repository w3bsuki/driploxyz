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

// Svelte 5 runes-based store implementation using module-level state
let store = $state<MessageNotificationStore>(initialStore);
let activeNotification = $state<MessageNotification | null>(null);

// Export reactive values as getters that can be used in Svelte components
export const messageNotificationStore = {
  get notifications() { return store.notifications; },
  get unreadCount() { return store.unreadCount; },
  get activeNotification() { return activeNotification; },

  setStore(newStore: MessageNotificationStore) {
    store = newStore;
  },

  setActiveNotification(notification: MessageNotification | null) {
    activeNotification = notification;
  },

  updateStore(updater: (store: MessageNotificationStore) => MessageNotificationStore) {
    store = updater(store);
  }
};

// Derived exports that can be used with $ in components
export const unreadMessageCount = () => store.unreadCount;
export const messageNotifications = messageNotificationStore;
export const getActiveNotification = () => activeNotification;

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

    // Update the store using the new Svelte 5 pattern
    messageNotificationStore.updateStore(store => ({
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
    messageNotificationStore.updateStore(store => {
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
    messageNotificationStore.setStore({
      notifications: [],
      unreadCount: 0
    });
  },

  setUnreadCount: (count: number) => {
    messageNotificationStore.updateStore(store => ({
      ...store,
      unreadCount: count
    }));
  },

  incrementUnread: () => {
    messageNotificationStore.updateStore(store => ({
      ...store,
      unreadCount: store.unreadCount + 1
    }));
  },

  decrementUnread: () => {
    messageNotificationStore.updateStore(store => ({
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
  messageNotificationStore.setActiveNotification(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    messageNotificationStore.setActiveNotification(null);
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