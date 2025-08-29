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
    signingOut?: boolean;
    translations?: {
        sellItems?: string;
        myProfile?: string;
        startSelling?: string;
        settings?: string;
        signOut?: string;
        signingOut?: string;
        signIn?: string;
        signUp?: string;
        browseCategories?: string;
        orders?: string;
        favorites?: string;
        categoryWomen?: string;
        categoryMen?: string;
        categoryKids?: string;
        categoryPets?: string;
        help?: string;
        privacy?: string;
        terms?: string;
        returns?: string;
        trustSafety?: string;
    };
}
declare const MobileNavigation: import("svelte").Component<Props, {}, "">;
type MobileNavigation = ReturnType<typeof MobileNavigation>;
export default MobileNavigation;
//# sourceMappingURL=MobileNavigation.svelte.d.ts.map