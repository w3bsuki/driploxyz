import type { CategoryData } from '../types';
interface Props {
    categories: CategoryData;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
    appliedFilters?: {
        size?: string;
        brand?: string;
        condition?: string;
        priceMin?: string;
        priceMax?: string;
    };
    onCategorySelect?: (category: string) => void;
    onSubcategorySelect?: (subcategory: string, category: string) => void;
    onFilterRemove?: (filterType: string) => void;
    onClearAll?: () => void;
    translations?: {
        categories?: string;
        filters?: string;
        clearAll?: string;
        size?: string;
        brand?: string;
        condition?: string;
        priceRange?: string;
        allCategories?: string;
    };
    class?: string;
}
declare const CategorySidebar: import("svelte").Component<Props, {}, "">;
type CategorySidebar = ReturnType<typeof CategorySidebar>;
export default CategorySidebar;
