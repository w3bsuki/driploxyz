import type { Product } from '../types';
interface Translations {
    orderSummary?: string;
    subtotal?: string;
    shipping?: string;
    serviceFee?: string;
    total?: string;
}
interface Props {
    product: Product;
    shippingCost?: number;
    serviceFee?: number;
    currency?: string;
    translations?: Translations;
}
declare const CheckoutSummary: import("svelte").Component<Props, {}, "">;
type CheckoutSummary = ReturnType<typeof CheckoutSummary>;
export default CheckoutSummary;
