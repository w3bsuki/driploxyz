interface Props {
    price: number;
    currency?: string;
    formatPrice?: (price: number) => string;
    class?: string;
}
declare const ProductPrice: import("svelte").Component<Props, {}, "">;
type ProductPrice = ReturnType<typeof ProductPrice>;
export default ProductPrice;
