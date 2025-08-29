interface Order {
    id: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
    created_at: string;
    updated_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    tracking_number?: string;
}
interface Props {
    order: Order;
    userType: 'buyer' | 'seller';
    className?: string;
}
declare const OrderTimeline: import("svelte").Component<Props, {}, "">;
type OrderTimeline = ReturnType<typeof OrderTimeline>;
export default OrderTimeline;
