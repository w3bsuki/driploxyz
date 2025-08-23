import type { Product } from './types.js';
interface Props {
    product: Product;
    onClose: () => void;
    onAddToCart?: () => void;
    onToggleFavorite?: () => void;
}
declare const HighlightQuickView: import("svelte").Component<Props, {}, "">;
type HighlightQuickView = ReturnType<typeof HighlightQuickView>;
export default HighlightQuickView;
//# sourceMappingURL=HighlightQuickView.svelte.d.ts.map