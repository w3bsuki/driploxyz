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
    acceptedFormats?: string;
    maxFileSize?: number;
    uploadingImagesText?: string;
    imagesOptimizedText?: string;
    dropHereText?: string;
    addPhotoText?: string;
    coverText?: string;
    removeImageText?: string;
    photosUploadedText?: (count: number) => string;
    moreAllowedText?: (count: number) => string;
    optimizedForWebText?: string;
}
declare const ImageUploaderSupabase: import("svelte").Component<Props, {}, "images" | "uploading">;
type ImageUploaderSupabase = ReturnType<typeof ImageUploaderSupabase>;
export default ImageUploaderSupabase;
