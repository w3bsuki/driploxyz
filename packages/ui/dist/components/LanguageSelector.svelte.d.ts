interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}
interface Props {
    currentLanguage?: string;
    languages?: LanguageOption[];
    variant?: 'dropdown' | 'flags' | 'buttons';
    onLanguageChange?: (lang: string) => Promise<void> | void;
    class?: string;
}
declare const LanguageSelector: import("svelte").Component<Props, {}, "">;
type LanguageSelector = ReturnType<typeof LanguageSelector>;
export default LanguageSelector;
//# sourceMappingURL=LanguageSelector.svelte.d.ts.map