import type { Product } from './types/index.js';
interface Order {
    id: string;
    product_id: string;
    buyer_id: string;
    total_amount: number;
    currency: string;
    status: string;
    created_at: string;
}
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