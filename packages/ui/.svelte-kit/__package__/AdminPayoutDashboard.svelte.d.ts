interface PayoutRequest {
    id: string;
    user_id: string;
    username: string;
    full_name: string;
    user_email: string;
    country_code: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
    status_display: string;
    payout_method: any;
    requested_at: string;
    reviewed_at: string | null;
    processed_at: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    reference_number: string | null;
    requested_amount: number;
    net_amount: number;
}
interface PayoutStats {
    total_pending: number;
    total_amount_pending: number;
    completed_today: number;
    completed_amount_today: number;
    by_country: Record<string, {
        pending: number;
        pending_amount: number;
        completed: number;
        completed_amount: number;
    }>;
}
interface Props {
    payoutRequests?: PayoutRequest[];
    stats?: PayoutStats;
    loading?: boolean;
    onRefresh: () => Promise<void>;
    onApproveRequest: (requestId: string, notes?: string) => Promise<void>;
    onRejectRequest: (requestId: string, reason: string, notes?: string) => Promise<void>;
    onProcessPayout: (requestId: string, referenceNumber: string) => Promise<void>;
}
/**
 * AdminPayoutDashboard - Real-time payout management interface
 * View, approve, reject, and manage seller payouts across countries
 */
declare const AdminPayoutDashboard: import("svelte").Component<Props, {}, "">;
type AdminPayoutDashboard = ReturnType<typeof AdminPayoutDashboard>;
export default AdminPayoutDashboard;
//# sourceMappingURL=AdminPayoutDashboard.svelte.d.ts.map