interface Props {
    show?: boolean;
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
    onViewOrder?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
}
declare const SoldNotificationToast: import("svelte").Component<Props, {}, "">;
type SoldNotificationToast = ReturnType<typeof SoldNotificationToast>;
export default SoldNotificationToast;
