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

interface FollowNotificationState {
  activeNotification: FollowNotification | null;
  queue: FollowNotification[];
  isShowing: boolean;
}

export function createFollowNotificationsStore() {
  const state = $state<FollowNotificationState>({
    activeNotification: null,
    queue: [],
    isShowing: false
  });

  return {
    get activeNotification() { return state.activeNotification; },
    get isShowing() { return state.isShowing; },

    setActive: (notification: FollowNotification | null) => {
      state.activeNotification = notification;
    },

    setShowing: (showing: boolean) => {
      state.isShowing = showing;
    },

    addToQueue: (notification: FollowNotification) => {
      state.queue = [...state.queue, notification];
    },

    shiftQueue: (): FollowNotification | undefined => {
      const next = state.queue[0];
      if (next) {
        state.queue = state.queue.slice(1);
      }
      return next;
    }
  };
}

// Global store instance
export const followNotificationsStore = createFollowNotificationsStore();

// Export activeFollowNotification for compatibility
export const activeFollowNotification = {
  get value() { return followNotificationsStore.activeNotification; }
};

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
  if (followNotificationsStore.isShowing) {
    followNotificationsStore.addToQueue(notification);
    return;
  }

  followNotificationsStore.setShowing(true);
  followNotificationsStore.setActive(notification);

  // Clear after toast is hidden
  setTimeout(() => {
    followNotificationsStore.setActive(null);
    followNotificationsStore.setShowing(false);

    // Show next notification in queue
    const next = followNotificationsStore.shiftQueue();
    if (next) {
      setTimeout(() => showFollowNotification(next), 500);
    }
  }, 4500); // Slightly longer than toast auto-hide duration
}

export const handleFollowNotificationClick = (notification: FollowNotification) => {
  goto(`/profile/${notification.followerUsername}`);
};