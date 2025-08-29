interface Props {
    tabs: Array<{
        id: string;
        label: string;
        count?: number;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    class?: string;
}
declare const TabGroup: import("svelte").Component<Props, {}, "">;
type TabGroup = ReturnType<typeof TabGroup>;
export default TabGroup;
