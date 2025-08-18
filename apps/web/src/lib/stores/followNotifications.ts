import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

interface FollowNotification {
  id: string;
  followerId: string;
  followerName: string;
  followerUsername: string;
  followerAvatar?: string;
  timestamp: Date;
}

export const activeFollowNotification = writable<FollowNotification | null>(null);

let notificationQueue: FollowNotification[] = [];
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

export const followNotificationActions = {
  addFollowNotification: (notification: Omit<FollowNotification, 'id' | 'timestamp'>) => {
    if (!browser) return;

    const fullNotification: FollowNotification = {
      ...notification,
      id: generateUUID(),
      timestamp: new Date()
    };

    // Only show follow notifications when not on profile/messages pages
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/profile') && !currentPath.startsWith('/messages')) {
      showFollowNotification(fullNotification);
    }
  }
};

function showFollowNotification(notification: FollowNotification) {
  // Add to queue if currently showing a notification
  if (isShowingNotification) {
    notificationQueue.push(notification);
    return;
  }

  isShowingNotification = true;
  activeFollowNotification.set(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    activeFollowNotification.set(null);
    isShowingNotification = false;

    // Show next notification in queue
    if (notificationQueue.length > 0) {
      const next = notificationQueue.shift()!;
      setTimeout(() => showFollowNotification(next), 500);
    }
  }, 4500); // Slightly longer than toast auto-hide duration
}

export const handleFollowNotificationClick = (notification: FollowNotification) => {
  goto(`/profile/${notification.followerUsername}`);
};