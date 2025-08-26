interface Props {
    product_images?: Array<{
        image_url: string;
    }>;
    images?: Array<string | {
        image_url: string;
    }>;
    alt: string;
    priority?: boolean;
    class?: string;
}
declare const ProductImage: import("svelte").Component<Props, {}, "">;
type ProductImage = ReturnType<typeof ProductImage>;
export default ProductImage;
//# sourceMappingURL=ProductImage.svelte.d.ts.map