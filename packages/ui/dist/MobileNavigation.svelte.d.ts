interface Props {
    isOpen: boolean;
    isLoggedIn: boolean;
    user?: any;
    profile?: any;
    userDisplayName?: string;
    initials?: string;
    canSell?: boolean;
    currentLanguage: string;
    languages: any[];
    onClose: () => void;
    onSignOut: () => void;
    onCategoryClick: (category: string) => void;
    onLanguageChange: (lang: string) => void;
    translations?: {
        sellItems?: string;
        myProfile?: string;
        startSelling?: string;
        settings?: string;
        signOut?: string;
        signIn?: string;
        signUp?: string;
        browseCategories?: string;
        orders?: string;
        favorites?: string;
    };
}
declare const MobileNavigation: import("svelte").Component<Props, {}, "">;
type MobileNavigation = ReturnType<typeof MobileNavigation>;
export default MobileNavigation;
//# sourceMappingURL=MobileNavigation.svelte.d.ts.map