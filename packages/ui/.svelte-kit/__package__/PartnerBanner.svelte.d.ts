interface Partner {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    instagram?: string;
    category?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
}
interface Props {
    partner: Partner;
    size?: 'small' | 'medium' | 'large';
    variant?: 'banner' | 'compact' | 'featured';
    showDescription?: boolean;
}
declare const PartnerBanner: import("svelte").Component<Props, {}, "">;
type PartnerBanner = ReturnType<typeof PartnerBanner>;
export default PartnerBanner;
