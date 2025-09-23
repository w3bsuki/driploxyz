/**
 * Notifications Store - Clean Svelte 5 Implementation
 */

import { notificationStore } from './notifications.svelte';

// Re-export types
export type { AppNotification as Notification, MessageToast } from './notifications.svelte';

// Direct exports from the Svelte 5 store
export const {
  notifications,
  messageToasts,
  notificationPanelOpen,
  notificationPermission,
  unreadNotifications,
  unreadCount,
  notificationActions,
  messageToastActions,
  requestNotificationPermission,
  showBrowserNotification,
  playNotificationSound
} = notificationStore;