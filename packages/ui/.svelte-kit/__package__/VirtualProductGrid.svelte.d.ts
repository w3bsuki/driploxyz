interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    brand?: string;
    size?: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    category: string;
    sellerId: string;
    sellerName: string;
    sellerRating?: number;
    sellerAvatar?: string;
    createdAt: string;
    location: string;
}
interface Props {
    items: Product[];
    itemHeight?: number;
    containerHeight?: number;
    gap?: number;
    itemsPerRow?: number;
    onProductClick?: (product: Product) => void;
    onFavorite?: (product: Product) => void;
    class?: string;
    loading?: boolean;
    translations?: Record<string, any>;
    onEndReached?: () => void;
    endThreshold?: number;
}
declare const VirtualProductGrid: import("svelte").Component<Props, {}, "">;
type VirtualProductGrid = ReturnType<typeof VirtualProductGrid>;
export default VirtualProductGrid;
