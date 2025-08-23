interface Props {
    isLoggedIn: boolean;
    canSell: boolean;
    translations: {
        browse: string;
        sell: string;
        messages: string;
        dashboard: string;
    };
    class?: string;
}
declare const HeaderNav: import("svelte").Component<Props, {}, "">;
type HeaderNav = ReturnType<typeof HeaderNav>;
export default HeaderNav;
//# sourceMappingURL=HeaderNav.svelte.d.ts.map