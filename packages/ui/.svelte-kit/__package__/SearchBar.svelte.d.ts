interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onFilter?: () => void;
    showCategoriesButton?: boolean;
    categoriesText?: string;
    isDropdownOpen?: boolean;
    searchId?: string;
    class?: string;
}
declare const SearchBar: import("svelte").Component<Props, {}, "value">;
type SearchBar = ReturnType<typeof SearchBar>;
export default SearchBar;
//# sourceMappingURL=SearchBar.svelte.d.ts.map