import type { CategoryData } from './types.js';
interface Props {
    isOpen?: boolean;
    categories: CategoryData;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
    onCategorySelect?: (category: string | null) => void;
    onSubcategorySelect?: (subcategory: string | null, category: string) => void;
    onClose?: () => void;
    class?: string;
}
declare const MegaMenu: import("svelte").Component<Props, {}, "">;
type MegaMenu = ReturnType<typeof MegaMenu>;
export default MegaMenu;
//# sourceMappingURL=MegaMenu.svelte.d.ts.map