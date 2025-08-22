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
    fetchpriority?: 'high' | 'low' | 'auto';
    width?: number;
    quality?: number;
}
declare const OptimizedImage: import("svelte").Component<Props, {}, "">;
type OptimizedImage = ReturnType<typeof OptimizedImage>;
export default OptimizedImage;
//# sourceMappingURL=OptimizedImage.svelte.d.ts.map