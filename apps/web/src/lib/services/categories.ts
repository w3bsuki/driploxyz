import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  product_count?: number;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  product_count: number;
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  level: number;
}

export class CategoryService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get all active categories
   */
  async getCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch categories' };
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(id: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      
      return { data: null, error: 'Failed to fetch category' };
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      
      return { data: null, error: 'Failed to fetch category' };
    }
  }

  /**
   * Get categories organized as a tree structure
   */
  async getCategoryTree(): Promise<{ data: CategoryTree[]; error: string | null }> {
    try {
      const { data: categories, error } = await this.getCategories();
      
      if (error) {
        return { data: [], error };
      }

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count } = await this.supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true)
            .eq('is_sold', false);

          return {
            ...category,
            product_count: count || 0,
            children: [] as CategoryTree[]
          };
        })
      );

      // Build tree structure
      const tree: CategoryTree[] = [];
      const categoryMap = new Map<string, CategoryTree>();

      // First pass: create map of all categories
      categoriesWithCounts.forEach(category => {
        categoryMap.set(category.id, category);
      });

      // Second pass: build tree
      categoriesWithCounts.forEach(category => {
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children.push(category);
          }
        } else {
          tree.push(category);
        }
      });

      return { data: tree, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to build category tree' };
    }
  }

  /**
   * Get main categories (no parent)
   */
  async getMainCategories(): Promise<{ data: CategoryWithChildren[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at, level')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch main categories' };
    }
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(parentId: string): Promise<{ data: Category[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at, level')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch subcategories' };
    }
  }

  /**
   * Get category breadcrumb trail
   */
  async getCategoryBreadcrumb(categoryId: string): Promise<{ data: Category[]; error: string | null }> {
    try {
      const breadcrumb: Category[] = [];
      let currentId: string | null = categoryId;

      while (currentId) {
        const { data: category, error } = await this.getCategory(currentId);
        
        if (error || !category) {
          break;
        }

        breadcrumb.unshift(category);
        currentId = category.parent_id;
      }

      return { data: breadcrumb, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to build breadcrumb' };
    }
  }

  /**
   * Search categories
   */
  async searchCategories(query: string): Promise<{ data: Category[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at, level')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')
        .limit(20);

      if (error) {
        
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to search categories' };
    }
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(category: Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>): Promise<{ 
    data: Category | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      
      return { data: null, error: 'Failed to create category' };
    }
  }

  /**
   * Update a category (admin only)
   */
  async updateCategory(id: string, updates: CategoryUpdate): Promise<{ 
    data: Category | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      
      return { data: null, error: 'Failed to update category' };
    }
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: string): Promise<{ error: string | null }> {
    try {
      // Check if category has products
      const { count } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)
        .eq('is_active', true);

      if (count && count > 0) {
        return { error: 'Cannot delete category with active products' };
      }

      // Check if category has subcategories
      const { count: subCount } = await this.supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id)
        .eq('is_active', true);

      if (subCount && subCount > 0) {
        return { error: 'Cannot delete category with subcategories' };
      }

      // Soft delete the category
      const { error } = await this.supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      
      return { error: 'Failed to delete category' };
    }
  }

  /**
   * Get popular categories with product counts
   */
  async getPopularCategories(limit = 10): Promise<{ data: CategoryWithChildren[]; error: string | null }> {
    try {
      const { data: categories, error } = await this.getCategories();
      
      if (error) {
        return { data: [], error };
      }

      // Get product counts and sort by popularity
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count } = await this.supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true)
            .eq('is_sold', false);

          return {
            ...category,
            product_count: count || 0
          };
        })
      );

      // Sort by product count and take top categories
      const popular = categoriesWithCounts
        .sort((a, b) => b.product_count - a.product_count)
        .slice(0, limit);

      return { data: popular, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch popular categories' };
    }
  }

  // ===== NEW HIERARCHICAL METHODS =====

  /**
   * Get all descendant categories (children, grandchildren, etc.)
   */
  async getDescendants(categoryId: string): Promise<{ data: Category[]; error: string | null }> {
    try {
      // Get direct children first
      const { data: children, error: childrenError } = await this.supabase
        .from('categories')
        .select('*')
        .eq('parent_id', categoryId)
        .eq('is_active', true)
        .order('sort_order');

      if (childrenError) {
        
        return { data: [], error: childrenError.message };
      }

      if (!children || children.length === 0) {
        return { data: [], error: null };
      }

      // Get grandchildren
      const childIds = children.map(c => c.id);
      const { data: grandchildren, error: grandchildrenError } = await this.supabase
        .from('categories')
        .select('*')
        .in('parent_id', childIds)
        .eq('is_active', true)
        .order('sort_order');

      if (grandchildrenError) {
        
        return { data: children, error: null }; // Return children even if grandchildren fail
      }

      // Combine children and grandchildren
      const allDescendants = [...children, ...(grandchildren || [])];

      return { data: allDescendants, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch descendants' };
    }
  }

  /**
   * Get all ancestor categories (parent, grandparent, etc.) for breadcrumbs
   */
  async getAncestors(categoryId: string): Promise<{ data: CategoryBreadcrumb[]; error: string | null }> {
    try {
      // Get category details first
      const { data: currentCategory, error: currentError } = await this.supabase
        .from('categories')
        .select('id, name, slug, level, parent_id')
        .eq('id', categoryId)
        .eq('is_active', true)
        .single();

      if (currentError || !currentCategory) {
        return { data: [], error: currentError?.message || 'Category not found' };
      }

      const breadcrumbs: CategoryBreadcrumb[] = [];
      let currentCat: typeof currentCategory | null = currentCategory;

      // Walk up the hierarchy
      while (currentCat && currentCat.id) {
        breadcrumbs.unshift({
          id: currentCat.id,
          name: currentCat.name,
          slug: currentCat.slug,
          level: currentCat.level || 1
        });

        if (currentCat.parent_id) {
          const { data: parentCat }: { data: Category | null } = await this.supabase
            .from('categories')
            .select('id, name, slug, level, parent_id')
            .eq('id', currentCat.parent_id)
            .eq('is_active', true)
            .single();

          currentCat = parentCat || null;
        } else {
          currentCat = null;
        }
      }


      return { data: breadcrumbs, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch ancestors' };
    }
  }

  /**
   * Get product count for a category (including descendants)
   */
  async getHierarchicalProductCount(categoryId: string): Promise<{ count: number; error: string | null }> {
    try {
      const { data, error } = await this.supabase.rpc('get_products_in_category_tree', {
        category_id: categoryId
      });

      if (error) {
        
        return { count: 0, error: error.message };
      }

      return { count: data?.length || 0, error: null };
    } catch (error) {
      
      return { count: 0, error: 'Failed to get product count' };
    }
  }

  /**
   * Get categories by level with hierarchical product counts
   */
  async getCategoriesByLevelWithCounts(level: number): Promise<{ data: CategoryWithChildren[]; error: string | null }> {
    try {
      const { data: categories, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('level', level)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        
        return { data: [], error: error.message };
      }

      if (!categories) {
        return { data: [], error: null };
      }

      // Get hierarchical product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count } = await this.getHierarchicalProductCount(category.id);
          return {
            ...category,
            product_count: count,
            children: []
          };
        })
      );

      return { data: categoriesWithCounts, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to fetch categories with counts' };
    }
  }

  /**
   * Determine category level from slug pattern
   */
  getCategoryLevelFromSlug(slug: string): number {
    const parts = slug.split('-');
    
    // Level 1: women, men, kids, unisex (single word)
    if (['women', 'men', 'kids', 'unisex'].includes(slug)) {
      return 1;
    }
    
    // Level 2: women-clothing, men-shoes (gender + type)
    if (parts.length === 2) {
      const [gender, type] = parts;
      if (gender && type &&
          ['women', 'men', 'kids', 'unisex'].includes(gender) &&
          ['clothing', 'shoes', 'accessories', 'bags'].includes(type)) {
        return 2;
      }
    }
    
    // Level 3: everything else (women-clothing-dresses, etc.)
    return 3;
  }

  /**
   * Build complete breadcrumb trail including current category
   */
  async getCompleteBreadcrumb(categoryId: string): Promise<{ data: CategoryBreadcrumb[]; error: string | null }> {
    try {
      // Get ancestors
      const { data: ancestors, error: ancestorsError } = await this.getAncestors(categoryId);

      if (ancestorsError) {
        return { data: [], error: ancestorsError };
      }

      // Get current category
      const { data: currentCategory, error: currentError } = await this.getCategory(categoryId);

      if (currentError || !currentCategory) {
        return { data: ancestors, error: null };
      }

      // Combine ancestors + current category
      const breadcrumb = [
        ...ancestors,
        {
          id: currentCategory.id,
          name: currentCategory.name,
          slug: currentCategory.slug,
          level: currentCategory.level || 1
        }
      ];

      return { data: breadcrumb, error: null };
    } catch (error) {
      
      return { data: [], error: 'Failed to build complete breadcrumb' };
    }
  }

}