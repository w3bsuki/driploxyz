import type {
  CategoryWithChildren,
  SearchMainCategory,
  SearchAppliedFilters
} from './types.js';

export interface CategoryBreadcrumbItem {
  key: string;
  label: string;
  level: number;
}

export interface FlatCategoryItem {
  level: number;
  name: string;
  slug: string;
  path: string[];
}

interface CategoryNodeResult {
  node: CategoryWithChildren;
  level: number;
  path: CategoryWithChildren[];
}

function findCategoryNode(
  categories: CategoryWithChildren[] | undefined,
  slug: string,
  level = 1,
  path: CategoryWithChildren[] = []
): CategoryNodeResult | null {
  if (!categories || categories.length === 0) return null;

  for (const category of categories) {
    if (!category) continue;
    if (category.slug === slug || category.key === slug) {
      return { node: category, level, path: [...path, category] };
    }

    if (category.children && category.children.length > 0) {
      const childResult = findCategoryNode(category.children, slug, level + 1, [...path, category]);
      if (childResult) {
        return childResult;
      }
    }
  }

  return null;
}

function resolveCategoryLabel(
  mainCategories: SearchMainCategory[] | undefined,
  slug: string,
  fallback?: string
): string {
  const match = mainCategories?.find(category => category.key === slug);
  if (match?.label) return match.label;
  return fallback ?? slug;
}

export function buildCategoryBreadcrumbs(
  appliedFilters: SearchAppliedFilters | undefined,
  megaMenuData: CategoryWithChildren[] | undefined,
  mainCategories: SearchMainCategory[] | undefined
): CategoryBreadcrumbItem[] {
  if (!appliedFilters) return [];

  const breadcrumbs: CategoryBreadcrumbItem[] = [];
  const seen = new Set<string>();
  const { category, subcategory, specific } = appliedFilters;

  if (category) {
    const categoryNode = findCategoryNode(megaMenuData, category);
    const label = categoryNode?.node.name ?? resolveCategoryLabel(mainCategories, category);
    breadcrumbs.push({ key: category, label, level: 1 });
    seen.add(category);
  }

  if (subcategory && !seen.has(subcategory)) {
    const subcategoryNode = findCategoryNode(megaMenuData, subcategory);
    const label = subcategoryNode?.node.name ?? subcategory;
    const level = Math.min(Math.max(subcategoryNode?.level ?? 2, 2), 3);
    breadcrumbs.push({ key: subcategory, label, level });
    seen.add(subcategory);
  }

  if (specific && !seen.has(specific)) {
    const specificNode = findCategoryNode(megaMenuData, specific);
    const label = specificNode?.node.name ?? specific;
    const level = Math.min(Math.max(specificNode?.level ?? breadcrumbs.length + 1, 3), 3);
    breadcrumbs.push({ key: specific, label, level });
    seen.add(specific);
  }

  return breadcrumbs;
}

export function flattenCategoryHierarchy(
  categories: CategoryWithChildren[] | undefined
): FlatCategoryItem[] {
  const flat: FlatCategoryItem[] = [];

  function walk(nodes: CategoryWithChildren[] | undefined, level: number, path: string[]) {
    if (!nodes) return;
    for (const node of nodes) {
      if (!node) continue;
      const slug = node.slug ?? node.key ?? node.name;
      if (!slug) continue;

      const currentPath = [...path, slug];
      flat.push({
        level,
        name: node.name,
        slug,
        path: currentPath
      });

      if (node.children && node.children.length > 0) {
        walk(node.children, level + 1, currentPath);
      }
    }
  }

  walk(categories, 1, []);
  return flat;
}
