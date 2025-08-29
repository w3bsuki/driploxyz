interface Props {
    class?: string;
    lines?: number;
    variant?: 'paragraph' | 'heading' | 'caption' | 'list';
    width?: 'full' | 'auto' | string;
}
declare const TextSkeleton: import("svelte").Component<Props, {}, "">;
type TextSkeleton = ReturnType<typeof TextSkeleton>;
export default TextSkeleton;
