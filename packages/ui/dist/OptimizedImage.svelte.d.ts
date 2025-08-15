interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    fallback?: string;
    class?: string;
    onclick?: () => void;
}
declare const OptimizedImage: import("svelte").Component<Props, {}, "">;
type OptimizedImage = ReturnType<typeof OptimizedImage>;
export default OptimizedImage;
//# sourceMappingURL=OptimizedImage.svelte.d.ts.map