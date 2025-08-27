interface Props {
    sortBy: string;
    priceRange: string;
    condition: string;
    onSortChange: (value: string) => void;
    onPriceRangeChange: (value: string) => void;
    onConditionChange: (value: string) => void;
    onMoreFilters: () => void;
    activeFiltersCount?: number;
}
declare const CompactFilterBar: import("svelte").Component<Props, {}, "">;
type CompactFilterBar = ReturnType<typeof CompactFilterBar>;
export default CompactFilterBar;
//# sourceMappingURL=CompactFilterBar.svelte.d.ts.map