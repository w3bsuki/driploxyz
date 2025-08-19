import type { Product } from './types.js';
interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    class?: string;
    translations?: {
        size?: string;
        newSeller?: string;
        unknownSeller?: string;
        currency?: string;
        addToFavorites?: string;
        removeFromFavorites?: string;
        new?: string;
        likeNew?: string;
        good?: string;
        fair?: string;
        soldItem?: string;
        viewSellerProfile?: string;
        ratingOutOfFive?: string;
        conditionExcellent?: string;
        conditionVeryGood?: string;
        conditionGood?: string;
        conditionFair?: string;
        formatPrice?: (price: number) => string;
    };
}
declare const ProductCard: import("svelte").Component<Props, {}, "">;
type ProductCard = ReturnType<typeof ProductCard>;
export default ProductCard;
//# sourceMappingURL=ProductCard.svelte.d.ts.map