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
interface Props {
    notifications: SoldNotification[];
    show?: boolean;
    loading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewOrder?: (orderId: string) => void;
    onClose?: () => void;
    class?: string;
}
declare const SoldNotificationPanel: import("svelte").Component<Props, {}, "">;
type SoldNotificationPanel = ReturnType<typeof SoldNotificationPanel>;
export default SoldNotificationPanel;
//# sourceMappingURL=SoldNotificationPanel.svelte.d.ts.map