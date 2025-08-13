interface SellerStats {
    rating: number;
    totalSales: number;
    responseTime: number;
    joinedDate: string;
    verificationLevel: 'basic' | 'verified' | 'superstar';
    lastActive: string;
}
interface Props {
    id: string;
    name: string;
    avatar?: string;
    stats: SellerStats;
    isFollowing?: boolean;
    onFollow?: () => void;
    onMessage?: () => void;
    onViewProfile?: () => void;
    showFullStats?: boolean;
    class?: string;
}
declare const SellerCard: import("svelte").Component<Props, {}, "">;
type SellerCard = ReturnType<typeof SellerCard>;
export default SellerCard;
//# sourceMappingURL=SellerCard.svelte.d.ts.map