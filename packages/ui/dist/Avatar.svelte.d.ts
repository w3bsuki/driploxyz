interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    premium?: boolean;
    variant?: 'circle' | 'square';
    onclick?: () => void;
    class?: string;
}
declare const Avatar: import("svelte").Component<Props, {}, "">;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
//# sourceMappingURL=Avatar.svelte.d.ts.map