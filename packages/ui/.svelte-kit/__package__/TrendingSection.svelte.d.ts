interface Props {
    trends: string[];
    title?: string;
    onTrendClick: (trend: string) => void;
}
declare const TrendingSection: import("svelte").Component<Props, {}, "">;
type TrendingSection = ReturnType<typeof TrendingSection>;
export default TrendingSection;
