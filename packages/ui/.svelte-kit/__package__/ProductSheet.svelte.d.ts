interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    brand?: string;
    size?: string;
    color?: string;
    condition: string;
    description?: string;
    shipping?: {
        price: number;
        estimatedDays: number;
    };
}
interface Props {
    product: Product;
    sizes?: any[];
    seller?: any;
    selectedSize?: string;
    isVisible?: boolean;
    onBuyNow?: () => void;
    onMakeOffer?: () => void;
    onAddToCart?: () => void;
    onFavorite?: () => void;
    onShare?: () => void;
    onClose?: () => void;
    class?: string;
}
declare const ProductSheet: import("svelte").Component<Props, {}, "selectedSize">;
type ProductSheet = ReturnType<typeof ProductSheet>;
export default ProductSheet;
