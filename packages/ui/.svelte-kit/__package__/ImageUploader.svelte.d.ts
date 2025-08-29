interface Props {
    images?: string[];
    maxImages?: number;
    maxSize?: number;
    acceptedFormats?: string[];
    onImagesChange?: (images: string[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    convertToWebP?: boolean;
    webpQuality?: number;
    maxDimensions?: {
        width: number;
        height: number;
    };
    class?: string;
}
declare const ImageUploader: import("svelte").Component<Props, {}, "">;
type ImageUploader = ReturnType<typeof ImageUploader>;
export default ImageUploader;
