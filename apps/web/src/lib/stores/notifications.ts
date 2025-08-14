import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Notification {
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

// Notifications store
export const notifications = writable<Notification[]>([]);
export const notificationPanelOpen = writable(false);

// Message toast store for real-time message popups
export const messageToasts = writable<MessageToast[]>([]);

// Derived stores
export const unreadNotifications = derived(notifications, ($notifications) =>
	$notifications.filter((n) => !n.read)
);

export const unreadCount = derived(unreadNotifications, ($unread) => $unread.length);

// Notification actions
export const notificationActions = {
	// Add a new notification
	add: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
		const newNotification: Notification = {
			...notification,
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString()
		};

		notifications.update((current) => [newNotification, ...current]);
	},

	// Mark notification as read
	markAsRead: (id: string) => {
		notifications.update((current) =>
			current.map((n) => (n.id === id ? { ...n, read: true } : n))
		);
	},

	// Mark all notifications as read
	markAllAsRead: () => {
		notifications.update((current) => current.map((n) => ({ ...n, read: true })));
	},

	// Remove notification
	remove: (id: string) => {
		notifications.update((current) => current.filter((n) => n.id !== id));
	},

	// Clear all notifications
	clear: () => {
		notifications.set([]);
	},

	// Toggle notification panel
	togglePanel: () => {
		notificationPanelOpen.update((open) => !open);
	},

	// Close notification panel
	closePanel: () => {
		notificationPanelOpen.set(false);
	}
};

// Message toast actions
export const messageToastActions = {
	// Add a new message toast
	add: (toast: Omit<MessageToast, 'id' | 'timestamp'>) => {
		const newToast: MessageToast = {
			...toast,
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString()
		};

		messageToasts.update((current) => [newToast, ...current]);

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
		messageToasts.update((current) => current.filter((t) => t.id !== id));
	},

	// Clear all message toasts
	clear: () => {
		messageToasts.set([]);
	}
};

// Browser-only notification permission and setup
export const notificationPermission = writable<NotificationPermission>('default');

// Initialize permission status if in browser
if (browser) {
	notificationPermission.set(Notification.permission);
}

// Request notification permission
export const requestNotificationPermission = async () => {
	if (browser && Notification.permission === 'default') {
		const permission = await Notification.requestPermission();
		notificationPermission.set(permission);
		return permission;
	}
	return browser ? Notification.permission : 'default';
};

// Show browser notification
export const showBrowserNotification = (
	title: string,
	options: NotificationOptions = {}
) => {
	if (browser && Notification.permission === 'granted') {
		const notification = new Notification(title, {
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			...options
		});

		// Auto-close after 5 seconds
		setTimeout(() => notification.close(), 5000);

		return notification;
	}
};

// Notification sound
export const playNotificationSound = () => {
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