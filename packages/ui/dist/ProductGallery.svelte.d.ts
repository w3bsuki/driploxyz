interface Props {
    images: Array<{
        image_url: string;
        alt_text?: string;
        id?: string;
    }> | string[];
    title: string;
    condition?: string;
    isAuthenticated?: boolean;
    class?: string;
    translations?: {
        new?: string;
        likeNew?: string;
        good?: string;
        fair?: string;
    };
}
declare const ProductGallery: import("svelte").Component<Props, {}, "">;
type ProductGallery = ReturnType<typeof ProductGallery>;
export default ProductGallery;
//# sourceMappingURL=ProductGallery.svelte.d.ts.map