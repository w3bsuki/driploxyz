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

export const followNotificationActions = {
  addFollowNotification: (notification: Omit<FollowNotification, 'id' | 'timestamp'>) => {
    if (!browser) return;

    const fullNotification: FollowNotification = {
      ...notification,
      id: crypto.randomUUID(),
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