interface SoldNotification {
    id: string;
    product: {
        id: string;
        title: string;
        image: string;
        price: number;
    };
    buyer?: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    order_id?: string;
    sold_at: string;
    read: boolean;
}
interface Translations {
    salesActivity?: string;
    newSales?: string;
    earned?: string;
    markAllRead?: string;
    noSalesYet?: string;
    notifyWhenItemsSell?: string;
    itemSold?: string;
    soldTo?: string;
    viewOrderDetails?: string;
    totalSales?: string;
    totalSalesPlural?: string;
    viewAllSales?: string;
}
interface Props {
    notifications: SoldNotification[];
    show?: boolean;
    loading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewOrder?: (orderId: string) => void;
    onClose?: () => void;
    class?: string;
    translations?: Translations;
}
declare const SoldNotificationPanel: import("svelte").Component<Props, {}, "">;
type SoldNotificationPanel = ReturnType<typeof SoldNotificationPanel>;
export default SoldNotificationPanel;
