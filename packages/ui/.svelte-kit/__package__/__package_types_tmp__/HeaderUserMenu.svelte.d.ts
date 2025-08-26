interface Props {
    user: any;
    profile: any;
    userDisplayName: string;
    initials: string;
    canSell: boolean;
    onSignOut: () => void;
    onClose: () => void;
    signingOut?: boolean;
    translations?: {
        myProfile?: string;
        orders?: string;
        favorites?: string;
        startSelling?: string;
        settings?: string;
        signOut?: string;
        signingOut?: string;
    };
}
declare const HeaderUserMenu: import("svelte").Component<Props, {}, "">;
type HeaderUserMenu = ReturnType<typeof HeaderUserMenu>;
export default HeaderUserMenu;
//# sourceMappingURL=HeaderUserMenu.svelte.d.ts.map