import type { Database } from '@repo/database';
type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
interface SaleRecord {
    order: Order;
    product: Product;
    earnings: number;
    commission: number;
}
interface Props {
    sales: SaleRecord[];
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    showArchived?: boolean;
}
/**
 * SalesHistory - Shows seller's recent sales with earnings
 * Lightweight display component with pagination
 */
declare const SalesHistory: import("svelte").Component<Props, {}, "">;
type SalesHistory = ReturnType<typeof SalesHistory>;
export default SalesHistory;
//# sourceMappingURL=SalesHistory.svelte.d.ts.map