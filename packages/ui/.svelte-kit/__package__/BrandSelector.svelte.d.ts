interface Props {
    value?: string;
    popularBrands?: string[];
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    class?: string;
    name?: string;
    onchange?: (value: string) => void;
}
declare const BrandSelector: import("svelte").Component<Props, {}, "value">;
type BrandSelector = ReturnType<typeof BrandSelector>;
export default BrandSelector;
