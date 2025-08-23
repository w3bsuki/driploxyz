import type { Product, Seller } from './types/index.js';
interface Translations {
    seller_premiumSeller: string;
    seller_premiumSellerDescription: string;
    trending_promoted: string;
    trending_featured: string;
    common_currency: string;
    ui_scroll?: string;
}
interface Props {
    promotedProducts: Product[];
    sellers: Seller[];
    onSellerSelect: (seller: Seller) => void;
    onSellerClick: (seller: Seller) => void;
    onProductClick?: (product: Product) => void;
    onProductBuy?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    favoriteProductIds?: Set<string>;
    translations: Translations;
    formatPrice?: (price: number) => string;
}
declare const PromotedHighlights: import("svelte").Component<Props, {}, "">;
type PromotedHighlights = ReturnType<typeof PromotedHighlights>;
export default PromotedHighlights;
//# sourceMappingURL=PromotedHighlights.svelte.d.ts.map