interface SellerData {
    id: string;
    username: string;
    avatar_url: string;
    itemCount: number;
    created_at?: string;
    bio?: string;
    location?: string;
    totalSales?: number;
    rating?: number;
    recentProducts?: Array<{
        id: string;
        title: string;
        price: number;
        image: string;
    }>;
}
interface Props {
    seller: SellerData | null;
    isOpen: boolean;
    onClose: () => void;
    onViewProfile: (sellerId: string) => void;
    onFollow?: (sellerId: string) => void;
    isFollowing?: boolean;
}
declare const SellerQuickView: import("svelte").Component<Props, {}, "isOpen">;
type SellerQuickView = ReturnType<typeof SellerQuickView>;
export default SellerQuickView;
//# sourceMappingURL=SellerQuickView.svelte.d.ts.map