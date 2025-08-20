interface Props {
    value?: number;
    label?: string;
    error?: string | string[];
    required?: boolean;
    helpText?: string;
    showCalculation?: boolean;
    feePercentage?: number;
    currency?: string;
}
declare const PriceInput: import("svelte").Component<Props, {}, "value">;
type PriceInput = ReturnType<typeof PriceInput>;
export default PriceInput;
//# sourceMappingURL=PriceInput.svelte.d.ts.map