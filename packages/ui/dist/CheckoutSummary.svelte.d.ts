import type { Product } from './types.js';
interface Props {
    product: Product;
    shippingCost?: number;
    serviceFee?: number;
    currency?: string;
}
declare const CheckoutSummary: import("svelte").Component<Props, {}, "">;
type CheckoutSummary = ReturnType<typeof CheckoutSummary>;
export default CheckoutSummary;
//# sourceMappingURL=CheckoutSummary.svelte.d.ts.map