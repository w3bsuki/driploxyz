interface Category {
    id: string;
    name: string;
    parent_id: string | null;
}
interface Props {
    categories: Category[];
    gender?: string;
    type?: string;
    specific?: string;
    onGenderSelect?: (id: string) => void;
    onTypeSelect?: (id: string) => void;
    onSpecificSelect?: (id: string) => void;
    whoIsItForLabel?: string;
    categoryLabel?: string;
    translateCategory?: (categoryName: string) => string;
    includesText?: string;
    selectedText?: string;
    accessoriesListText?: string;
}
declare const CategorySelector: import("svelte").Component<Props, {}, "type" | "gender" | "specific">;
type CategorySelector = ReturnType<typeof CategorySelector>;
export default CategorySelector;
