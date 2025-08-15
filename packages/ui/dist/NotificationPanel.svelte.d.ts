interface Translations {
    title?: string;
    unread?: string;
    markAllRead?: string;
    noNotifications?: string;
    notifyWhenSomethingHappens?: string;
    viewAll?: string;
}
interface Notification {
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
interface Props {
    notifications: Notification[];
    show?: boolean;
    loading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onClose?: () => void;
    class?: string;
    translations?: Translations;
}
declare const NotificationPanel: import("svelte").Component<Props, {}, "">;
type NotificationPanel = ReturnType<typeof NotificationPanel>;
export default NotificationPanel;
//# sourceMappingURL=NotificationPanel.svelte.d.ts.map