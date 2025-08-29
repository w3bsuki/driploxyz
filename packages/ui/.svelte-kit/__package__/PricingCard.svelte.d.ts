interface Props {
    title?: string;
    price?: string;
    description?: string;
    features?: string[];
    buttonText?: string;
    featured?: boolean;
    onclick?: () => void;
}
declare const PricingCard: import("svelte").Component<Props, {}, "">;
type PricingCard = ReturnType<typeof PricingCard>;
export default PricingCard;
