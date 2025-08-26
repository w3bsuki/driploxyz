/**
 * LazyImage component
 * Simple wrapper for native lazy loading with fallback UI
 * For enhanced image optimization, use enhanced:img directly in apps
 */
interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    class?: string;
    loading?: 'lazy' | 'eager';
    srcset?: string;
    sizes?: string;
    fetchpriority?: 'high' | 'low' | 'auto';
    onload?: () => void;
    onerror?: () => void;
}
declare const LazyImage: import("svelte").Component<Props, {}, "">;
type LazyImage = ReturnType<typeof LazyImage>;
export default LazyImage;
//# sourceMappingURL=LazyImage.svelte.d.ts.map