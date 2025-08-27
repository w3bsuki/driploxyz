interface Props {
    activeView?: 'overview' | 'users' | 'payouts' | 'notifications' | 'analytics';
    adminUser?: {
        username: string;
        role: string;
        permissions: string[];
        country_access: string[];
    };
    quickStats?: {
        pending_payouts: number;
        unread_notifications: number;
        new_users_today: number;
        total_revenue_today: number;
    };
    onViewChange: (view: string) => void;
    onLogout: () => void;
}
/**
 * AdminDashboard - Main admin interface layout
 * Complete admin panel with user management, payouts, analytics and notifications
 */
declare const AdminDashboard: import("svelte").Component<Props, {}, "">;
type AdminDashboard = ReturnType<typeof AdminDashboard>;
export default AdminDashboard;
//# sourceMappingURL=AdminDashboard.svelte.d.ts.map