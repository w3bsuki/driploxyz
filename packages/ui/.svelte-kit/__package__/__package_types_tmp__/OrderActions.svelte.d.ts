interface Order {
    id: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
    buyer_id: string;
    seller_id: string;
    tracking_number?: string;
}
interface Props {
    order: Order;
    userType: 'buyer' | 'seller';
    userId: string;
    onStatusChange?: (newStatus: string) => void;
    className?: string;
}
declare const OrderActions: import("svelte").Component<Props, {}, "">;
type OrderActions = ReturnType<typeof OrderActions>;
export default OrderActions;
//# sourceMappingURL=OrderActions.svelte.d.ts.map