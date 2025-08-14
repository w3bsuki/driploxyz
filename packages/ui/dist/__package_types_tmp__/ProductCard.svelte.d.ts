import type { Product } from './types.js';
interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    class?: string;
}
declare const ProductCard: import("svelte").Component<Props, {}, "">;
type ProductCard = ReturnType<typeof ProductCard>;
export default ProductCard;
//# sourceMappingURL=ProductCard.svelte.d.ts.map