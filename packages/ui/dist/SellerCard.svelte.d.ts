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
    translations?: {
        soldBy?: string;
        message?: string;
        follow?: string;
        following?: string;
        viewFullProfile?: string;
        sales?: string;
        activeNow?: string;
        activeAgo?: string;
        memberFor?: string;
        newMember?: string;
        trustedSeller?: string;
        superstarSeller?: string;
        verified?: string;
        positiveReviews?: string;
        avgShipping?: string;
        recentActivity?: string;
    };
}
declare const SellerCard: import("svelte").Component<Props, {}, "">;
type SellerCard = ReturnType<typeof SellerCard>;
export default SellerCard;
//# sourceMappingURL=SellerCard.svelte.d.ts.map