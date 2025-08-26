import type { Product } from './types';
interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}
interface Seller {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    rating?: number;
    premium?: boolean;
}
interface Props {
    categories?: Category[];
    products?: Product[];
    sellers?: Seller[];
    onCategorySelect?: (category: Category) => void;
    onProductClick?: (product: Product) => void;
    onSellerClick?: (seller: Seller) => void;
    onClose?: () => void;
    translations?: {
        newItems?: string;
        topSellers?: string;
        categories?: string;
        viewAll?: string;
        new?: string;
    };
    formatPrice?: (price: number, currency?: string) => string;
}
declare const CategoryDropdown: import("svelte").Component<Props, {}, "">;
type CategoryDropdown = ReturnType<typeof CategoryDropdown>;
export default CategoryDropdown;
//# sourceMappingURL=CategoryDropdown.svelte.d.ts.map