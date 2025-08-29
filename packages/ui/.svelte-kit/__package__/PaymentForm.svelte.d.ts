import type { Stripe } from '@stripe/stripe-js';
interface Translations {
    total?: string;
    processing?: string;
    pay?: string;
    paymentSystemNotInitialized?: string;
    paymentFailed?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvc?: string;
    cardholderName?: string;
    validationError?: string;
}
interface Props {
    amount: number;
    productId: string;
    sellerId: string;
    buyerId: string;
    clientSecret: string;
    stripe: Stripe | null;
    currency?: string;
    showBillingAddress?: boolean;
    showCardholderName?: boolean;
    allowSaveCard?: boolean;
    loading?: boolean;
    disabled?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    translations?: Translations;
    onPaymentSuccess?: (result: {
        paymentIntent: any;
        order?: any;
    }) => void;
    onPaymentError?: (error: string) => void;
    onValidationError?: (errors: Record<string, string>) => void;
    onProcessingChange?: (processing: boolean) => void;
}
declare const PaymentForm: import("svelte").Component<Props, {}, "">;
type PaymentForm = ReturnType<typeof PaymentForm>;
export default PaymentForm;
