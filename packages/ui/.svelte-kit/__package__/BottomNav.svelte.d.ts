interface Props {
    unreadMessageCount?: number;
    currentPath: string;
    isNavigating?: boolean;
    navigatingTo?: string;
    labels?: {
        home: string;
        search: string;
        sell: string;
        messages: string;
        profile: string;
    };
}
declare const BottomNav: import("svelte").Component<Props, {}, "">;
type BottomNav = ReturnType<typeof BottomNav>;
export default BottomNav;
//# sourceMappingURL=BottomNav.svelte.d.ts.map