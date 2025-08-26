import type { Product } from './types';
interface Seller {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    itemCount: number;
}
interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
}
interface Props {
    trendingProducts: Product[];
    topSellers?: Seller[];
    quickFilters?: QuickFilter[];
    onProductClick: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice: (price: number) => string;
    translations: {
        trendingNow: string;
        topSellers: string;
        items: string;
    };
}
declare const TrendingDropdown: import("svelte").Component<Props, {}, "">;
type TrendingDropdown = ReturnType<typeof TrendingDropdown>;
export default TrendingDropdown;
//# sourceMappingURL=TrendingDropdown.svelte.d.ts.map