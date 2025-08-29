interface Props {
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
declare const OrderStatus: import("svelte").Component<Props, {}, "">;
type OrderStatus = ReturnType<typeof OrderStatus>;
export default OrderStatus;
