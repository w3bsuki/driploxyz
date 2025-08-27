interface UserData {
    id: string;
    username: string;
    full_name: string;
    email: string;
    country_code: string;
    role: string;
    is_verified: boolean;
    subscription_tier: string;
    current_balance: number;
    total_sales_value: number;
    sales_count: number;
    purchases_count: number;
    last_active_at: string;
    created_at: string;
    auth_created_at: string;
    last_sign_in_at: string;
}
interface SearchFilters {
    country: string;
    status: string;
    subscription: string;
    dateRange: string;
}
interface Props {
    users?: UserData[];
    loading?: boolean;
    onSearch: (query: string, filters: SearchFilters) => Promise<void>;
    onUserAction: (action: string, userId: string) => Promise<void>;
}
/**
 * AdminUserBrowser - Comprehensive user management for admins
 * View users by country, search, filter, and manage accounts
 */
declare const AdminUserBrowser: import("svelte").Component<Props, {}, "">;
type AdminUserBrowser = ReturnType<typeof AdminUserBrowser>;
export default AdminUserBrowser;
//# sourceMappingURL=AdminUserBrowser.svelte.d.ts.map