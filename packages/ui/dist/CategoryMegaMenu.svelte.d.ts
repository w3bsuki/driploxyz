interface Subcategory {
    id: string;
    name: string;
    slug: string;
}
interface Props {
    isOpen?: boolean;
    subcategories?: Subcategory[];
    onClose?: () => void;
    onSubcategorySelect?: (slug: string) => void;
    translateSubcategory?: (name: string) => string;
}
declare const CategoryMegaMenu: import("svelte").Component<Props, {}, "">;
type CategoryMegaMenu = ReturnType<typeof CategoryMegaMenu>;
export default CategoryMegaMenu;
//# sourceMappingURL=CategoryMegaMenu.svelte.d.ts.map