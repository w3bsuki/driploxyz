import type { Product } from './types.js';
interface Props {
    product: Product;
    onProductClick?: (product: Product) => void;
    onBuy?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    isFavorite?: boolean;
    currency?: string;
    formatPrice?: (price: number) => string;
}
declare const ProductHighlight: import("svelte").Component<Props, {}, "">;
type ProductHighlight = ReturnType<typeof ProductHighlight>;
export default ProductHighlight;
//# sourceMappingURL=ProductHighlight.svelte.d.ts.map