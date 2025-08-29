interface Props {
    show: boolean;
    stripePublishableKey?: string;
    accountType?: 'premium' | 'brand';
    initialDiscountCode?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
}
declare const BrandPaymentModal: import("svelte").Component<Props, {}, "">;
type BrandPaymentModal = ReturnType<typeof BrandPaymentModal>;
export default BrandPaymentModal;
