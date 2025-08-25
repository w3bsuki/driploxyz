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
        console.error('Error fetching categories:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getCategories:', error);
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
        console.error('Error fetching category:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getCategory:', error);
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
        console.error('Error fetching category by slug:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
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
      console.error('Error in getCategoryTree:', error);
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
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Error fetching main categories:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getMainCategories:', error);
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
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Error fetching subcategories:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getSubcategories:', error);
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
      console.error('Error in getCategoryBreadcrumb:', error);
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
        .select('id, name, description, slug, parent_id, sort_order, is_active, image_url, created_at, updated_at')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')
        .limit(20);

      if (error) {
        console.error('Error searching categories:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in searchCategories:', error);
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
        console.error('Error creating category:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createCategory:', error);
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
        console.error('Error updating category:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateCategory:', error);
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
        console.error('Error deleting category:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteCategory:', error);
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
      console.error('Error in getPopularCategories:', error);
      return { data: [], error: 'Failed to fetch popular categories' };
    }
  }
}