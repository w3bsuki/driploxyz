import type { Product } from '../types';
interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: () => void;
    addToFavoritesText?: string;
    removeFromFavoritesText?: string;
    showCount?: boolean;
    favoritesState?: {
        favoriteCounts: Record<string, number>;
    };
}
declare const FavoriteButton: import("svelte").Component<Props, {}, "">;
type FavoriteButton = ReturnType<typeof FavoriteButton>;
export default FavoriteButton;
//# sourceMappingURL=FavoriteButton.svelte.d.ts.map