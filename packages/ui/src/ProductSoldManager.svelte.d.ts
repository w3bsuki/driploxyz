import type { Product } from '../types';
interface Props {
    products: Product[];
    onProductSold?: (productId: string, buyerId: string) => void;
    onViewOrder?: (productId: string) => void;
}
declare const ProductSoldManager: import("svelte").Component<Props, {
    markProductAsSold: (productId: string, buyer?: {
        id: string;
        username: string;
        avatar_url?: string;
    }) => void;
}, "">;
type ProductSoldManager = ReturnType<typeof ProductSoldManager>;
export default ProductSoldManager;
//# sourceMappingURL=ProductSoldManager.svelte.d.ts.map