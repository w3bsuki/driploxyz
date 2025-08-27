interface CountryMetrics {
    country_code: string;
    country_name: string;
    flag: string;
    currency: string;
    total_users: number;
    active_users_30d: number;
    new_users_7d: number;
    new_users_30d: number;
    retention_rate_30d: number;
    total_revenue_30d: number;
    total_revenue_7d: number;
    avg_order_value: number;
    total_transactions_30d: number;
    conversion_rate: number;
    active_listings: number;
    total_listings_30d: number;
    sold_listings_30d: number;
    avg_listing_price: number;
    pending_payouts: number;
    pending_payout_amount: number;
    completed_payouts_30d: number;
    completed_payout_amount_30d: number;
    user_growth_rate: number;
    revenue_growth_rate: number;
    transaction_growth_rate: number;
}
interface PlatformSummary {
    total_revenue_30d: number;
    total_users: number;
    total_active_users: number;
    total_transactions: number;
    avg_revenue_per_user: number;
    platform_fee_earned: number;
    uk_vs_bg_revenue_ratio: number;
    uk_vs_bg_user_ratio: number;
    growth_trajectory: 'up' | 'down' | 'stable';
}
interface TimeseriesData {
    date: string;
    uk_revenue: number;
    bg_revenue: number;
    uk_users: number;
    bg_users: number;
    uk_transactions: number;
    bg_transactions: number;
}
interface Props {
    countryMetrics?: CountryMetrics[];
    platformSummary?: PlatformSummary;
    timeseriesData?: TimeseriesData[];
    loading?: boolean;
    timeRange?: '7d' | '30d' | '90d';
    onTimeRangeChange: (range: '7d' | '30d' | '90d') => Promise<void>;
    onRefresh: () => Promise<void>;
    onExport: (format: 'csv' | 'pdf') => Promise<void>;
}
/**
 * AdminAnalyticsPanel - Country-specific analytics and business metrics
 * Shows revenue, user growth, transaction volumes across UK/BG markets
 */
declare const AdminAnalyticsPanel: import("svelte").Component<Props, {}, "">;
type AdminAnalyticsPanel = ReturnType<typeof AdminAnalyticsPanel>;
export default AdminAnalyticsPanel;
//# sourceMappingURL=AdminAnalyticsPanel.svelte.d.ts.map