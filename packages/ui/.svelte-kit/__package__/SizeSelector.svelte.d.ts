interface SizeOption {
    value: string;
    label: string;
    available: boolean;
    stock?: number;
}
interface Props {
    sizes: SizeOption[];
    selectedSize?: string;
    onSizeSelect?: (size: string) => void;
    showStock?: boolean;
    class?: string;
}
declare const SizeSelector: import("svelte").Component<Props, {}, "selectedSize">;
type SizeSelector = ReturnType<typeof SizeSelector>;
export default SizeSelector;
//# sourceMappingURL=SizeSelector.svelte.d.ts.map