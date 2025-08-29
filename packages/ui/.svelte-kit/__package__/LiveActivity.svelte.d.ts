interface ActivityEvent {
    id: string;
    type: 'view' | 'cart' | 'purchase' | 'favorite' | 'offer';
    user?: string;
    timestamp: string;
    amount?: number;
    avatar?: string;
}
interface Props {
    productId: string;
    currentViewers?: number;
    inCarts?: number;
    recentActivity?: ActivityEvent[];
    lastSold?: {
        amount: number;
        date: string;
    };
    totalViews?: number;
    totalFavorites?: number;
    class?: string;
}
declare const LiveActivity: import("svelte").Component<Props, {}, "">;
type LiveActivity = ReturnType<typeof LiveActivity>;
export default LiveActivity;
