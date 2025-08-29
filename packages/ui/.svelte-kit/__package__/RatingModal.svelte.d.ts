interface Props {
    open: boolean;
    orderId: string;
    sellerName: string;
    productTitle: string;
    onsuccess?: () => void;
}
declare const RatingModal: import("svelte").Component<Props, {}, "open">;
type RatingModal = ReturnType<typeof RatingModal>;
export default RatingModal;
