import type { SearchBarVariant } from './types.js';
interface Props {
    value?: string;
    placeholder?: string;
    categoriesText?: string;
    suggestions?: string[];
    variant?: SearchBarVariant;
    showCategoryDropdown?: boolean;
    onSearch?: (query: string) => void;
    onSuggestionClick?: (suggestion: string) => void;
    onFilter?: () => void;
    onCategorySelect?: (category: string) => void;
    onOpenMegaMenu?: () => void;
    onNavigate?: (path: string) => void;
    showMegaMenuButton?: boolean;
    class?: string;
}
declare const SearchBar: import("svelte").Component<Props, {}, "value">;
type SearchBar = ReturnType<typeof SearchBar>;
export default SearchBar;
//# sourceMappingURL=SearchBar.svelte.d.ts.map