import type { LayoutServerLoad } from './$types';
import type { Database } from '@repo/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryHierarchyL3 {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface CategoryHierarchyL2 {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level3: CategoryHierarchyL3[];
}

interface CategoryHierarchyL1 {
  id: string;
  name: string;
  slug: string;
  level2: Record<string, CategoryHierarchyL2>;
}

function buildCategoryHierarchy(categories: Category[]): Record<string, CategoryHierarchyL1> {
  const hierarchy: Record<string, CategoryHierarchyL1> = {};
  const level1Map = new Map<string, CategoryHierarchyL1>();
  const level2Map = new Map<string, CategoryHierarchyL2>();

  categories.filter(c => c.level === 1 && c.is_active).forEach(l1 => {
    const l1Data = {
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      level2: {}
    };
    hierarchy[l1.slug] = l1Data;
    level1Map.set(l1.id, l1Data);
  });

  categories.filter(c => c.level === 2 && c.is_active).forEach(l2 => {
    const parent = level1Map.get(l2.parent_id!);
    if (parent) {
      const l2Data = {
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        parentId: l2.parent_id,
        level3: []
      };
      parent.level2[l2.slug] = l2Data;
      level2Map.set(l2.id, l2Data);
    }
  });

  categories.filter(c => c.level === 3 && c.is_active).forEach(l3 => {
    const parent = level2Map.get(l3.parent_id!);
    if (parent) {
      parent.level3.push({
        id: l3.id,
        name: l3.name,
        slug: l3.slug,
        parentId: l3.parent_id
      });
    }
  });

  return hierarchy;
}

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    if (!locals.supabase) {
      return { categoryHierarchy: {}, categories: [] };
    }

    const { data: categories } = await locals.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('sort_order');

    const categoryHierarchy = categories ? buildCategoryHierarchy(categories) : {};

    return {
      categoryHierarchy,
      categories: categories || []
    };
  } catch (e) {
    console.error('Error loading categories in shop layout:', e);
    return { categoryHierarchy: {}, categories: [] };
  }
};
