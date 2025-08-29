import type { Product } from '../types';
interface Props {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onView?: () => void;
    onBuy?: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
}
declare const ProductQuickView: import("svelte").Component<Props, {}, "">;
type ProductQuickView = ReturnType<typeof ProductQuickView>;
export default ProductQuickView;
