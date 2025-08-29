interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
}
interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    quickFilters?: QuickFilter[];
    onFilterClick?: (filterValue: string) => void;
    show?: boolean;
    observeTarget?: string;
    class?: string;
}
declare const SmartStickySearch: import("svelte").Component<Props, {}, "show" | "value">;
type SmartStickySearch = ReturnType<typeof SmartStickySearch>;
export default SmartStickySearch;
