import type { Product } from '../types';
interface Props {
    product: Product;
    onClose: () => void;
    onAddToCart?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorited?: boolean;
    isLoadingFavorite?: boolean;
}
declare const HighlightQuickView: import("svelte").Component<Props, {}, "">;
type HighlightQuickView = ReturnType<typeof HighlightQuickView>;
export default HighlightQuickView;
//# sourceMappingURL=HighlightQuickView.svelte.d.ts.map