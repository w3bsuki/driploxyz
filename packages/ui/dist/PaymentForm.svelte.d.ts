import type { PaymentIntent } from './types.js';
interface Translations {
    total?: string;
    processing?: string;
    pay?: string;
    paymentSystemNotInitialized?: string;
    paymentFailed?: string;
}
interface Props {
    amount: number;
    currency?: string;
    onPaymentSuccess?: (paymentIntent: PaymentIntent) => void;
    onPaymentError?: (error: string) => void;
    loading?: boolean;
    translations?: Translations;
}
declare const PaymentForm: import("svelte").Component<Props, {}, "">;
type PaymentForm = ReturnType<typeof PaymentForm>;
export default PaymentForm;
//# sourceMappingURL=PaymentForm.svelte.d.ts.map