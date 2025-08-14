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

let notificationQueue: MessageNotification[] = [];
let isShowingNotification = false;

export const messageNotificationActions = {
  addNotification: (notification: Omit<MessageNotification, 'id' | 'timestamp'>) => {
    const fullNotification: MessageNotification = {
      ...notification,
      id: crypto.randomUUID(),
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
    : notification.senderId;
  
  goto(`/messages?conversation=${conversationParam}`);
  messageNotificationActions.markAsRead(notification.id);
};