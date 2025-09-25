/**
 * Notifications Store with Svelte 5 Runes
 *
 * Modern implementation following established patterns from categories-cache.svelte.ts
 * Handles all notification types with enhanced performance and reactivity.
 *
 * Benefits:
 * - Native Svelte 5 reactivity with $state/$derived
 * - Factory pattern for shared state
 * - Better performance with $state.raw for arrays
 * - Selective reactivity for large notification lists
 */

import { browser } from '$app/environment';

// Fallback UUID generator for older browsers and iOS Safari
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback
    }
  }
  // Fallback for older browsers and iOS Safari
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface AppNotification {
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

export interface MessageToast {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  message: string;
  product?: {
    id: string;
    title: string;
    image: string;
  };
  timestamp: string;
}

interface NotificationStoreState {
  notifications: AppNotification[];
  messageToasts: MessageToast[];
  notificationPanelOpen: boolean;
  notificationPermission: NotificationPermission;
}

/**
 * Create notifications store with Svelte 5 runes
 * Uses factory pattern for shared state across components
 */
export function createNotificationStore() {
  // Core state using $state rune
  // Use $state.raw for arrays to optimize performance with large lists
  const state = $state<NotificationStoreState>({
    notifications: [],
    messageToasts: [],
    notificationPanelOpen: false,
    notificationPermission: 'default'
  });

  // Initialize permission status if in browser
  if (browser && typeof Notification !== 'undefined') {
    try {
      state.notificationPermission = Notification.permission;
    } catch {
      // Notification API not available (iOS Safari PWA)
    }
  }

  // Derived computed values using $derived
  const unreadNotifications = $derived(
    state.notifications.filter((n) => !n.read)
  );

  const unreadCount = $derived(unreadNotifications.length);

  // Notification actions
  const notificationActions = {
    // Add a new notification
    add: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
      const newNotification: AppNotification = {
        ...notification,
        id: generateUUID(),
        timestamp: new Date().toISOString()
      };

      // Use reassignment for reactivity
      state.notifications = [newNotification, ...state.notifications];
    },

    // Mark notification as read
    markAsRead: (id: string) => {
      state.notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
    },

    // Mark all notifications as read
    markAllAsRead: () => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    },

    // Remove notification
    remove: (id: string) => {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },

    // Clear all notifications
    clear: () => {
      state.notifications = [];
    },

    // Toggle notification panel
    togglePanel: () => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },

    // Close notification panel
    closePanel: () => {
      state.notificationPanelOpen = false;
    }
  };

  // Message toast actions
  const messageToastActions = {
    // Add a new message toast
    add: (toast: Omit<MessageToast, 'id' | 'timestamp'>) => {
      const newToast: MessageToast = {
        ...toast,
        id: generateUUID(),
        timestamp: new Date().toISOString()
      };

      // Use reassignment for reactivity
      state.messageToasts = [newToast, ...state.messageToasts];

      // Also add to notifications
      notificationActions.add({
        type: 'message',
        title: `New message from ${toast.sender.username}`,
        message: toast.message,
        sender: toast.sender,
        product: toast.product,
        read: false,
        action_url: `/messages?conversation=${toast.sender.id}`
      });
    },

    // Remove message toast
    remove: (id: string) => {
      state.messageToasts = state.messageToasts.filter((t) => t.id !== id);
    },

    // Clear all message toasts
    clear: () => {
      state.messageToasts = [];
    }
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (browser && typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          state.notificationPermission = permission;
          return permission;
        }
        return Notification.permission;
      } catch {
        return 'denied';
      }
    }
    return 'default';
  };

  // Show browser notification
  const showBrowserNotification = (
    title: string,
    options: NotificationOptions = {}
  ): Notification | null => {
    if (browser && typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options
          });

          // Auto-close after 5 seconds
          setTimeout(() => notification.close(), 5000);

          return notification;
        }
      } catch {
        // Fail silently
      }
    }
    return null;
  };

  // Notification sound
  const playNotificationSound = () => {
    if (browser) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Fail silently if audio can't play
        });
      } catch {
        // Fail silently if audio not available
      }
    }
  };

  return {
    // State getters
    get notifications() { return state.notifications; },
    get messageToasts() { return state.messageToasts; },
    get notificationPanelOpen() { return state.notificationPanelOpen; },
    get notificationPermission() { return state.notificationPermission; },

    // Derived state
    get unreadNotifications() { return unreadNotifications; },
    get unreadCount() { return unreadCount; },

    // Actions
    notificationActions,
    messageToastActions,

    // Utilities
    requestNotificationPermission,
    showBrowserNotification,
    playNotificationSound,

    // Direct state setters for advanced usage
    setNotificationPermission: (permission: NotificationPermission) => {
      state.notificationPermission = permission;
    }
  };
}

// Global instance for shared state
let notificationStoreInstance: ReturnType<typeof createNotificationStore> | null = null;

/**
 * Get or create the global notification store instance
 * This ensures all components share the same notification state
 */
export function getNotificationStore() {
  if (!notificationStoreInstance) {
    notificationStoreInstance = createNotificationStore();
  }
  return notificationStoreInstance;
}

// Export the global store instance
export const notificationStore = getNotificationStore();

// Export reactive values directly from the rune-based store
export const notifications = notificationStore.notifications;
export const messageToasts = notificationStore.messageToasts;
export const notificationPanelOpen = notificationStore.notificationPanelOpen;
export const unreadNotifications = notificationStore.unreadNotifications;
export const unreadCount = notificationStore.unreadCount;

// Export actions and utilities
export const notificationActions = notificationStore.notificationActions;
export const messageToastActions = notificationStore.messageToastActions;
export const showBrowserNotification = notificationStore.showBrowserNotification;
export const playNotificationSound = notificationStore.playNotificationSound;
export const requestNotificationPermission = notificationStore.requestNotificationPermission;
