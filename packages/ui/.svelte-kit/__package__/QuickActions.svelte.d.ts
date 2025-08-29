interface Props {
    isFavorited?: boolean;
    isInCart?: boolean;
    shareCount?: number;
    favoriteCount?: number;
    onFavorite?: () => void;
    onShare?: () => void;
    onAddToCart?: () => void;
    onMessage?: () => void;
    position?: 'right' | 'left';
    showLabels?: boolean;
    class?: string;
}
declare const QuickActions: import("svelte").Component<Props, {}, "">;
type QuickActions = ReturnType<typeof QuickActions>;
export default QuickActions;
