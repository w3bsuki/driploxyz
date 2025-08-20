interface Props {
    currentLanguage?: string;
    languages?: Array<{
        code: string;
        name: string;
        flag?: string;
    }>;
    onLanguageChange?: (lang: string) => void;
    variant?: 'dropdown' | 'inline' | 'compact';
    class?: string;
}
declare const LanguageSwitcher: import("svelte").Component<Props, {}, "">;
type LanguageSwitcher = ReturnType<typeof LanguageSwitcher>;
export default LanguageSwitcher;
//# sourceMappingURL=LanguageSwitcher.svelte.d.ts.map