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
    value: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    trendingProducts?: Product[];
    topSellers?: Seller[];
    quickFilters?: QuickFilter[];
    onProductClick?: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    formatPrice?: (price: number) => string;
    categoriesText?: string;
    translations: {
        trendingNow: string;
        topSellers: string;
        items: string;
        viewAllResults: string;
    };
    class?: string;
}
declare const HeroSearchDropdown: import("svelte").Component<Props, {}, "value">;
type HeroSearchDropdown = ReturnType<typeof HeroSearchDropdown>;
export default HeroSearchDropdown;
//# sourceMappingURL=HeroSearchDropdown.svelte.d.ts.map