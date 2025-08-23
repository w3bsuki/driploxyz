import type { Product } from './types.js';
interface Props {
    product: Product;
    onProductClick?: (product: Product) => void;
    onBuy?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorite?: boolean;
    isLoadingFavorite?: boolean;
    currency?: string;
    formatPrice?: (price: number) => string;
}
declare const ProductHighlight: import("svelte").Component<Props, {}, "">;
type ProductHighlight = ReturnType<typeof ProductHighlight>;
export default ProductHighlight;
//# sourceMappingURL=ProductHighlight.svelte.d.ts.map