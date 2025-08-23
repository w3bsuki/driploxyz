interface UploadedImage {
    url: string;
    path: string;
}
interface Props {
    id?: string;
    images?: UploadedImage[];
    maxImages?: number;
    error?: string;
    helpText?: string;
    onUpload: (files: File[]) => Promise<UploadedImage[]>;
    onDelete?: (path: string) => Promise<boolean>;
    uploading?: boolean;
}
declare const ImageUploaderSupabase: import("svelte").Component<Props, {}, "images" | "uploading">;
type ImageUploaderSupabase = ReturnType<typeof ImageUploaderSupabase>;
export default ImageUploaderSupabase;
//# sourceMappingURL=ImageUploaderSupabase.svelte.d.ts.map