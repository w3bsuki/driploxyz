interface Props {
    src: string;
    alt: string;
    class?: string;
    aspectRatio?: 'square' | 'auto';
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    sizes?: string;
    onclick?: () => void;
    showSkeleton?: boolean;
    blurPlaceholder?: boolean;
    priority?: boolean;
    quality?: number;
    width?: number;
    height?: number;
}
declare const ImageOptimized: import("svelte").Component<Props, {}, "">;
type ImageOptimized = ReturnType<typeof ImageOptimized>;
export default ImageOptimized;
//# sourceMappingURL=ImageOptimized.svelte.d.ts.map