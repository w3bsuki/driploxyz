interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

interface NavigationLevel {
  level: number;
  category: Category | null;
  subcategories: Category[];
}

export class CategoryNavigationService {
  private categories: Category[] = [];
  private navigationStack: NavigationLevel[] = [];

  constructor(categories: Category[]) {
    this.categories = categories.filter(cat => cat.is_active);
  }

  /**
   * Get top-level categories (demographics + premium collections)
   */
  getTopLevelCategories(): Category[] {
    return this.categories
      .filter(cat => !cat.parent_id) // Categories without parent_id are level 1
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }

  /**
   * Get subcategories for a given parent category
   */
  getSubcategories(parentId: string): Category[] {
    return this.categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Category | null {
    return this.categories.find(cat => cat.id === id) || null;
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug: string): Category | null {
    return this.categories.find(cat => cat.slug === slug) || null;
  }

  /**
   * Navigate to a category and push to navigation stack
   */
  navigateToCategory(categoryId: string): NavigationLevel | null {
    const category = this.getCategoryById(categoryId);
    if (!category) return null;

    const subcategories = this.getSubcategories(categoryId);
    const level: NavigationLevel = {
      level: category.level,
      category,
      subcategories
    };

    this.navigationStack.push(level);
    return level;
  }

  /**
   * Go back in navigation stack
   */
  goBack(): NavigationLevel | null {
    if (this.navigationStack.length > 1) {
      this.navigationStack.pop();
      return this.navigationStack[this.navigationStack.length - 1] || null;
    }
    return null;
  }

  /**
   * Get current navigation level
   */
  getCurrentLevel(): NavigationLevel | null {
    return this.navigationStack[this.navigationStack.length - 1] || null;
  }

  /**
   * Get previous navigation level
   */
  getPreviousLevel(): NavigationLevel | null {
    if (this.navigationStack.length > 1) {
      return this.navigationStack[this.navigationStack.length - 2] || null;
    }
    return null;
  }

  /**
   * Clear navigation stack
   */
  clearNavigation(): void {
    this.navigationStack = [];
  }

  /**
   * Get breadcrumb path for current navigation
   */
  getBreadcrumb(): Category[] {
    return this.navigationStack
      .filter(level => level.category)
      .map(level => level.category!);
  }

  /**
   * Check if category has subcategories
   */
  hasSubcategories(categoryId: string): boolean {
    return this.getSubcategories(categoryId).length > 0;
  }

  /**
   * Initialize navigation with top-level categories
   */
  initializeNavigation(): NavigationLevel {
    const topLevel: NavigationLevel = {
      level: 0,
      category: null,
      subcategories: this.getTopLevelCategories()
    };

    this.navigationStack = [topLevel];
    return topLevel;
  }

  /**
   * Get navigation depth
   */
  getNavigationDepth(): number {
    return this.navigationStack.length;
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.navigationStack.length > 1;
  }
}

// Export types for use in other packages
export type { Category, NavigationLevel };