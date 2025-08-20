interface Props {
    id?: string;
    images?: string[];
    maxImages?: number;
    error?: string;
    helpText?: string;
    convertToWebP?: boolean;
    onImagesChange: (images: string[]) => void;
}
declare const ImageUploader: import("svelte").Component<Props, {}, "">;
type ImageUploader = ReturnType<typeof ImageUploader>;
export default ImageUploader;
//# sourceMappingURL=ImageUploader.svelte.d.ts.map