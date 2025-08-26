interface SellerBalance {
    id: string;
    user_id: string;
    available_balance: number;
    pending_balance: number;
    total_earnings: number;
    currency: string;
    updated_at: string;
}
interface Props {
    balance: SellerBalance;
    loading?: boolean;
    onRequestPayout?: () => void;
}
/**
 * SellerBalance - Lightweight seller balance widget
 * Shows available balance, earnings, and payout button
 */
declare const SellerBalance: import("svelte").Component<Props, {}, "">;
export default SellerBalance;
//# sourceMappingURL=SellerBalance.svelte.d.ts.map