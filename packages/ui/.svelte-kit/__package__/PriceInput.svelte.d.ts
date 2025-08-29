interface Props {
    value?: string;
    label?: string;
    error?: string;
    placeholder?: string;
    currency?: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    showCalculation?: boolean;
    feePercentage?: number;
    class?: string;
    id?: string;
    name?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
}
declare const PriceInput: import("svelte").Component<Props, {}, "value">;
type PriceInput = ReturnType<typeof PriceInput>;
export default PriceInput;
