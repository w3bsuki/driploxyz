interface Props {
    class?: string;
    aspectRatio?: 'square' | 'video' | 'auto' | string;
    width?: string;
    height?: string;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showIcon?: boolean;
}
declare const ImageSkeleton: import("svelte").Component<Props, {}, "">;
type ImageSkeleton = ReturnType<typeof ImageSkeleton>;
export default ImageSkeleton;
