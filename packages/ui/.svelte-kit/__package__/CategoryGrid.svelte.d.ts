interface Props {
    onCategoryClick: (category: string) => void;
    compact?: boolean;
    translations?: {
        women?: string;
        men?: string;
        kids?: string;
        pets?: string;
    };
}
declare const CategoryGrid: import("svelte").Component<Props, {}, "">;
type CategoryGrid = ReturnType<typeof CategoryGrid>;
export default CategoryGrid;
