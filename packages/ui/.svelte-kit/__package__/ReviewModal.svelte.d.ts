interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, title: string, comment: string) => Promise<void>;
    orderDetails?: {
        seller?: string;
        buyer?: string;
        product?: string;
    };
    userType: 'buyer' | 'seller';
}
declare const ReviewModal: import("svelte").Component<Props, {}, "">;
type ReviewModal = ReturnType<typeof ReviewModal>;
export default ReviewModal;
