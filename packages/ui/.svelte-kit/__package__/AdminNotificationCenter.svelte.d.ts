interface Notification {
    id: string;
    type: 'payout_request' | 'user_signup' | 'high_value_sale' | 'suspicious_activity' | 'system_alert' | 'payment_failed';
    title: string;
    message: string;
    data?: any;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    country_code?: string;
    user_id?: string;
    is_read: boolean;
    created_at: string;
    action_url?: string;
    action_label?: string;
}
interface NotificationStats {
    total_unread: number;
    by_priority: Record<string, number>;
    by_country: Record<string, number>;
    by_type: Record<string, number>;
}
interface Props {
    notifications?: Notification[];
    stats?: NotificationStats;
    loading?: boolean;
    realTimeEnabled?: boolean;
    onMarkRead: (notificationId: string) => Promise<void>;
    onMarkAllRead: () => Promise<void>;
    onRefresh: () => Promise<void>;
    onNavigate: (url: string) => void;
    onToggleRealTime: (enabled: boolean) => Promise<void>;
}
/**
 * AdminNotificationCenter - Real-time admin notifications
 * Shows payout requests, user activity, system alerts with webhook integration
 */
declare const AdminNotificationCenter: import("svelte").Component<Props, {}, "">;
type AdminNotificationCenter = ReturnType<typeof AdminNotificationCenter>;
export default AdminNotificationCenter;
//# sourceMappingURL=AdminNotificationCenter.svelte.d.ts.map