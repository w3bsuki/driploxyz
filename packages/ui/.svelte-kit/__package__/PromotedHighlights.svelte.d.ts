import type { Product, Seller } from './types/index.js';
interface Translations {
    seller_premiumSeller: string;
    seller_premiumSellerDescription: string;
    trending_promoted: string;
    trending_featured: string;
    common_currency: string;
    ui_scroll?: string;
    promoted_hotPicks?: string;
    promoted_premiumSellers?: string;
}
interface FavoriteState {
    isLoading: boolean;
    error: string | null;
    favorites: Record<string, boolean>;
    favoriteCounts: Record<string, number>;
}
interface Props {
    promotedProducts: Product[];
    sellers: Seller[];
    onSellerSelect: (seller: Seller) => void;
    onSellerClick: (seller: Seller) => void;
    onProductClick?: (product: Product) => void;
    onProductBuy?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    favoritesState?: FavoriteState;
    translations: Translations;
    formatPrice?: (price: number) => string;
}
declare const PromotedHighlights: import("svelte").Component<Props, {}, "">;
type PromotedHighlights = ReturnType<typeof PromotedHighlights>;
export default PromotedHighlights;
