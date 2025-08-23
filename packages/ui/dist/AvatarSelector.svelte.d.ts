interface Props {
    selected?: string;
    onSelect?: (avatarUrl: string) => void;
    uploadEnabled?: boolean;
    onUpload?: (file: File) => void;
    class?: string;
}
declare const AvatarSelector: import("svelte").Component<Props, {}, "selected">;
type AvatarSelector = ReturnType<typeof AvatarSelector>;
export default AvatarSelector;
//# sourceMappingURL=AvatarSelector.svelte.d.ts.map