import type { Product } from '../types';
interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    highlighted?: boolean;
    class?: string;
    priority?: boolean;
    index?: number;
    totalCount?: number;
    translations?: {
        size?: string;
        currency?: string;
        addToFavorites?: string;
        removeFromFavorites?: string;
        brandNewWithTags?: string;
        newWithoutTags?: string;
        likeNew?: string;
        good?: string;
        worn?: string;
        fair?: string;
        new?: string;
        formatPrice?: (price: number) => string;
        categoryTranslation?: (category: string) => string;
    };
}
declare const ProductCard: import("svelte").Component<Props, {}, "">;
type ProductCard = ReturnType<typeof ProductCard>;
export default ProductCard;
//# sourceMappingURL=ProductCard.svelte.d.ts.map