interface Partner {
    id: string;
    name: string;
    logo: string;
    website?: string;
    instagram?: string;
    category?: string;
    description?: string;
}
interface Props {
    partners: Partner[];
    title?: string;
    variant?: 'horizontal' | 'marquee' | 'grid';
    showTitle?: boolean;
    autoScroll?: boolean;
    scrollSpeed?: number;
}
declare const PartnerShowcase: import("svelte").Component<Props, {}, "">;
type PartnerShowcase = ReturnType<typeof PartnerShowcase>;
export default PartnerShowcase;
