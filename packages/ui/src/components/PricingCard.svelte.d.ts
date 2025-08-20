interface Props {
    class?: string;
    planName: string;
    planIcon?: string;
    badge?: string;
    price: number;
    period?: string;
    originalPrice?: number;
    buttonText?: string;
    features: string[];
    lockedFeatures?: string[];
    onSelect?: () => void;
    glassEffect?: boolean;
}
declare const PricingCard: import("svelte").Component<Props, {}, "">;
type PricingCard = ReturnType<typeof PricingCard>;
export default PricingCard;
//# sourceMappingURL=PricingCard.svelte.d.ts.map