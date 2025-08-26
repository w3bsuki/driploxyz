interface PayoutMethod {
    type: 'revolut' | 'bank_transfer';
    details: {
        account_holder?: string;
        account_number?: string;
        sort_code?: string;
        phone?: string;
        email?: string;
    };
}
interface Props {
    isOpen: boolean;
    availableBalance: number;
    currency?: string;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (amount: number, payoutMethod: PayoutMethod) => Promise<void>;
}
/**
 * PayoutRequestModal - Lightweight payout request form
 * Creates payout requests via Supabase RPC calls
 */
declare const PayoutRequestModal: import("svelte").Component<Props, {}, "">;
type PayoutRequestModal = ReturnType<typeof PayoutRequestModal>;
export default PayoutRequestModal;
//# sourceMappingURL=PayoutRequestModal.svelte.d.ts.map