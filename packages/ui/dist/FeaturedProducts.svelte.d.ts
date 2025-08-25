import type { Product } from './types/index.js';
interface Translations {
    empty_noProducts: string;
    empty_startBrowsing: string;
    nav_sell: string;
    home_browseAll: string;
    product_size: string;
    trending_newSeller: string;
    seller_unknown: string;
    common_currency: string;
    product_addToFavorites: string;
    condition_new: string;
    condition_likeNew: string;
    condition_good: string;
    condition_fair: string;
    categoryTranslation?: (category: string) => string;
}
interface Props {
    products: Product[];
    errors?: {
        products?: string;
    };
    loading?: boolean;
    onProductClick: (product: Product) => void;
    onFavorite: (productId: string) => void;
    onBrowseAll?: () => void;
    onSellClick?: () => void;
    formatPrice?: (price: number) => string;
    translations: Translations;
    sectionTitle?: string;
    favoritesState?: any;
}
declare const FeaturedProducts: import("svelte").Component<Props, {}, "">;
type FeaturedProducts = ReturnType<typeof FeaturedProducts>;
export default FeaturedProducts;
//# sourceMappingURL=FeaturedProducts.svelte.d.ts.map