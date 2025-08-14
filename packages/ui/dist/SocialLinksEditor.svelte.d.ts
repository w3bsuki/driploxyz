interface SocialLink {
    type: string;
    url: string;
}
interface Props {
    links?: SocialLink[];
    onUpdate?: (links: SocialLink[]) => void;
    class?: string;
}
declare const SocialLinksEditor: import("svelte").Component<Props, {}, "">;
type SocialLinksEditor = ReturnType<typeof SocialLinksEditor>;
export default SocialLinksEditor;
//# sourceMappingURL=SocialLinksEditor.svelte.d.ts.map