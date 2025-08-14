import type { PaymentIntent } from './types.js';
interface Props {
    amount: number;
    currency?: string;
    onPaymentSuccess?: (paymentIntent: PaymentIntent) => void;
    onPaymentError?: (error: string) => void;
    loading?: boolean;
}
declare const PaymentForm: import("svelte").Component<Props, {}, "">;
type PaymentForm = ReturnType<typeof PaymentForm>;
export default PaymentForm;
//# sourceMappingURL=PaymentForm.svelte.d.ts.map