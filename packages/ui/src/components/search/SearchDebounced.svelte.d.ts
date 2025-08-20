interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'brand' | 'user';
    url?: string;
}
interface Props {
    value?: string;
    placeholder?: string;
    class?: string;
    debounceMs?: number;
    minLength?: number;
    suggestions?: SearchSuggestion[];
    loading?: boolean;
    onSearch?: (query: string) => Promise<void> | void;
    onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
    onClear?: () => void;
    showSuggestions?: boolean;
    maxSuggestions?: number;
}
declare const SearchDebounced: import("svelte").Component<Props, {}, "value">;
type SearchDebounced = ReturnType<typeof SearchDebounced>;
export default SearchDebounced;
//# sourceMappingURL=SearchDebounced.svelte.d.ts.map