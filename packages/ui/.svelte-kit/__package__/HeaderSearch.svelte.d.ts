interface Props {
    placeholder?: string;
    onSearch?: (query: string) => void;
    class?: string;
}
declare const HeaderSearch: import("svelte").Component<Props, {}, "">;
type HeaderSearch = ReturnType<typeof HeaderSearch>;
export default HeaderSearch;
