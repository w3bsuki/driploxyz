interface Props {
    id?: string;
    images?: string[];
    files?: File[];
    maxImages?: number;
    error?: string;
    helpText?: string;
}
declare const ImageUploader: import("svelte").Component<Props, {}, "images" | "files">;
type ImageUploader = ReturnType<typeof ImageUploader>;
export default ImageUploader;
//# sourceMappingURL=ImageUploader.svelte.d.ts.map