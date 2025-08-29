interface Props {
    mainCategoryName?: string;
    categoryName?: string;
    subcategoryName?: string;
    size?: string;
    brand?: string;
    sizeText?: string;
    categoryTranslation?: (category: string) => string;
}
declare const ProductMeta: import("svelte").Component<Props, {}, "">;
type ProductMeta = ReturnType<typeof ProductMeta>;
export default ProductMeta;
