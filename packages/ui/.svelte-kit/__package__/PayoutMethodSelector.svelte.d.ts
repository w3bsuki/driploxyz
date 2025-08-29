interface Props {
    selectedMethod?: 'revolut' | 'paypal' | 'card';
    payoutDetails?: string;
    payoutName?: string;
    onMethodChange?: (method: 'revolut' | 'paypal' | 'card') => void;
    onDetailsChange?: (details: string) => void;
    onNameChange?: (name: string) => void;
    class?: string;
}
declare const PayoutMethodSelector: import("svelte").Component<Props, {}, "selectedMethod" | "payoutDetails" | "payoutName">;
type PayoutMethodSelector = ReturnType<typeof PayoutMethodSelector>;
export default PayoutMethodSelector;
