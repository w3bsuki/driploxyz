import type { Database } from '@repo/database';
type SellerBalance = Database['public']['Tables']['seller_balances']['Row'];
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