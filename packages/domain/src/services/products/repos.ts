import type {
  Product,
  Category,
  ProductImage,
  DbProduct,
  DbCategory,
  DbProductImage,
  Result,
  Money,
  Slug
} from './entities';
import type { SupabasePort, ProductRepository, CategoryRepository, ProductSearchParams, ProductSearchFilters, ProductListOptions, ProductSearchResult } from './ports';
import { MoneyValueObject, SlugValueObject } from './value-objects';
import { Ok, Err, NotFoundError, ProductValidationError as ValidationError } from './entities';

/**
 * Product Repository Implementation
 */
export class SupabaseProductRepository implements ProductRepository {
  constructor(private db: SupabasePort) {}

  async getById(id: string): Promise<Result<Product, NotFoundError | ValidationError>> {
    try {
      const result = await this.db.select(
        'products',
        `
          *,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `,
        { id, is_active: true },
        { single: true }
      );

      if (result.error) {
        const err: any = result.error as any;
        if (err?.code === 'PGRST116') {
          return Err(new NotFoundError('Product', id));
        }
        return Err(new ValidationError(`Database error: ${err?.message ?? 'Unknown error'}`));
      }

      if (!result.data) {
        return Err(new NotFoundError('Product', id));
      }

      const product = this.mapDbProductToProduct(result.data as any);
      return Ok(product);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getBySlugAndSeller(slug: string, sellerUsername: string): Promise<Result<Product, NotFoundError | ValidationError>> {
    try {
      const result = await this.db.select(
        'products',
        `
          *,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `,
        { slug, is_active: true },
        { single: true }
      );

      if (result.error) {
        const err: any = result.error as any;
        if (err?.code === 'PGRST116') {
          return Err(new NotFoundError('Product', `${slug} by ${sellerUsername}`));
        }
        return Err(new ValidationError(`Database error: ${err?.message ?? 'Unknown error'}`));
      }

      if (!result.data) {
        return Err(new NotFoundError('Product', `${slug} by ${sellerUsername}`));
      }

      // Verify the seller username matches
      const productData = result.data as any;
      if (productData.profiles?.username !== sellerUsername) {
        return Err(new NotFoundError('Product', `${slug} by ${sellerUsername}`));
      }

      const product = this.mapDbProductToProduct(productData);
      return Ok(product);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async search(params: ProductSearchParams): Promise<Result<ProductSearchResult, ValidationError>> {
    try {
      let query = `
        *,
        product_images!product_id (
          id, image_url, alt_text, display_order, created_at, product_id, sort_order
        ),
        categories!category_id (name),
        profiles!seller_id (username, rating, avatar_url)
      `;

      const filters: Record<string, any> = { is_active: true, is_sold: false };

      // Build filters
      if (params.query) {
        filters.or = `title.ilike.%${params.query}%,description.ilike.%${params.query}%,brand.ilike.%${params.query}%`;
      }
      if (params.category_ids?.length) {
        filters.category_id = params.category_ids;
      }
      if (params.category_id) {
        // For hierarchical search, we'd need an RPC function
        // For now, just filter by exact category
        filters.category_id = params.category_id;
      }
      if (params.min_price !== undefined) {
        filters.price = { ...filters.price, gte: params.min_price };
      }
      if (params.max_price !== undefined) {
        filters.price = { ...filters.price, lte: params.max_price };
      }
      if (params.conditions?.length) {
        filters.condition = params.conditions;
      }
      if (params.sizes?.length) {
        filters.size = params.sizes;
      }
      if (params.brands?.length) {
        filters.brand = params.brands;
      }
      if (params.location) {
        filters.location = { ilike: `%${params.location}%` };
      }
      if (params.seller_id) {
        filters.seller_id = params.seller_id;
      }
      if (params.country_code) {
        filters.country_code = params.country_code;
      }

      // Ordering
      const orderBy = [];
      if (params.sort) {
        if (params.sort.by === 'popularity') {
          orderBy.push({ column: 'favorite_count', ascending: params.sort.direction === 'asc' });
        } else {
          orderBy.push({ column: params.sort.by, ascending: params.sort.direction === 'asc' });
        }
      }
      orderBy.push({ column: 'created_at', ascending: false }); // Fallback sort

      // Handle cursor-based pagination
      let cursorFilter = {};
      let actualOffset = params.offset || 0;

      if (params.cursor) {
        try {
          const [timestamp, id] = Buffer.from(params.cursor, 'base64').toString().split(':');
          if (params.sort?.by === 'created_at' || !params.sort) {
            cursorFilter = {
              or: `created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`
            };
            actualOffset = 0; // Reset offset when using cursor
          }
        } catch {
          // Invalid cursor, use offset-based pagination
        }
      }

      const result = await this.db.select(
        'products',
        query,
        { ...filters, ...cursorFilter },
        {
          orderBy,
          limit: params.limit || 20,
          offset: actualOffset,
          count: 'exact'
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Search failed: ${err?.message ?? 'Unknown error'}`));
      }

      const products = (result.data as any[])?.map(item => this.mapDbProductToProduct(item)) || [];
      const total = result.count || 0;
      const hasMore = products.length === (params.limit || 20);

      // Generate next cursor
      let nextCursor: string | undefined;
      if (hasMore && products.length > 0) {
        const lastProduct = products[products.length - 1];
        nextCursor = Buffer.from(`${lastProduct.created_at.getTime()}:${lastProduct.id}`).toString('base64');
      }

      return Ok({
        products,
        total,
        hasMore,
        nextCursor
      });
    } catch (error) {
      return Err(new ValidationError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getPromoted(limit = 10): Promise<Result<Product[], ValidationError>> {
    try {
      const result = await this.db.select(
        'products',
        `
          *,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `,
        { is_active: true, is_sold: false },
        {
          orderBy: [{ column: 'created_at', ascending: false }],
          limit
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Failed to fetch promoted products: ${err?.message ?? 'Unknown error'}`));
      }

      const products = (result.data as any[])?.map(item => this.mapDbProductToProduct(item)) || [];
      return Ok(products);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch promoted products: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getBySeller(sellerId: string, options: ProductListOptions = {}): Promise<Result<Product[], ValidationError>> {
    try {
      const result = await this.db.select(
        'products',
        `
          *,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `,
        { seller_id: sellerId, ...(options.include_inactive ? {} : { is_active: true }) },
        {
          orderBy: options.sort ? [{
            column: options.sort.by,
            ascending: options.sort.direction === 'asc'
          }] : [{ column: 'created_at', ascending: false }],
          limit: options.limit
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Failed to fetch seller products: ${err?.message ?? 'Unknown error'}`));
      }

      const products = (result.data as any[])?.map(item => this.mapDbProductToProduct(item)) || [];
      return Ok(products);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch seller products: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getByCategoryTree(categoryId: string, options: ProductListOptions = {}): Promise<Result<ProductSearchResult, ValidationError>> {
    // For now, just search by exact category. Hierarchical search would need RPC function.
    return this.search({
      category_id: categoryId,
      include_descendants: true,
      limit: options.limit,
      sort: options.sort
    });
  }

  async count(filters: ProductSearchFilters): Promise<Result<number, ValidationError>> {
    try {
      const searchFilters: Record<string, any> = {
        ...filters,
        is_active: filters.is_active !== false ? true : false,
        is_sold: filters.is_sold || false
      };

      const result = await this.db.count('products', searchFilters);

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Count failed: ${err?.message ?? 'Unknown error'}`));
      }

      return Ok(result.count || 0);
    } catch (error) {
      return Err(new ValidationError(`Count failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Map database product to domain product
   */
  private mapDbProductToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description,
      price: { amount: dbProduct.price, currency: 'USD' },
      condition: dbProduct.condition,
      size: dbProduct.size,
      brand: dbProduct.brand,
      color: dbProduct.color,
      material: dbProduct.material,
      location: dbProduct.location,
      country_code: dbProduct.country_code,
      region: dbProduct.region,
      slug: { value: dbProduct.slug },
      seller_id: dbProduct.seller_id,
      category_id: dbProduct.category_id,
      is_active: dbProduct.is_active,
      is_sold: dbProduct.is_sold,
      view_count: dbProduct.view_count || 0,
      favorite_count: dbProduct.favorite_count || 0,
      created_at: new Date(dbProduct.created_at),
      updated_at: new Date(dbProduct.updated_at),
      images: Array.isArray(dbProduct.product_images)
        ? dbProduct.product_images.map(this.mapDbImageToImage)
        : [],
      category_name: dbProduct.categories?.name || undefined,
      seller_username: dbProduct.profiles?.username || undefined,
      seller_rating: dbProduct.profiles?.rating || undefined
    };
  }

  private mapDbImageToImage(dbImage: any): ProductImage {
    return {
      id: dbImage.id,
      product_id: dbImage.product_id,
      image_url: dbImage.image_url,
      alt_text: dbImage.alt_text,
      display_order: dbImage.display_order,
      sort_order: dbImage.sort_order,
      created_at: new Date(dbImage.created_at)
    };
  }
}

/**
 * Category Repository Implementation
 */
export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private db: SupabasePort) {}

  async getById(id: string): Promise<Result<Category, NotFoundError>> {
    try {
      const result = await this.db.single('categories', id, '*');

      if (result.error) {
        const err: any = result.error as any;
        if (err?.code === 'PGRST116') {
          return Err(new NotFoundError('Category', id));
        }
        throw new Error(`Database error: ${err?.message ?? 'Unknown error'}`);
      }

      if (!result.data) {
        return Err(new NotFoundError('Category', id));
      }

      const category = this.mapDbCategoryToCategory(result.data as DbCategory);
      return Ok(category);
    } catch (error) {
      return Err(new NotFoundError('Category', id));
    }
  }

  async getBySlug(slug: string): Promise<Result<Category, NotFoundError>> {
    try {
      const result = await this.db.select(
        'categories',
        '*',
        { slug, is_active: true },
        { single: true }
      );

      if (result.error) {
        const err: any = result.error as any;
        if (err?.code === 'PGRST116') {
          return Err(new NotFoundError('Category', slug));
        }
        throw new Error(`Database error: ${err?.message ?? 'Unknown error'}`);
      }

      if (!result.data) {
        return Err(new NotFoundError('Category', slug));
      }

      const category = this.mapDbCategoryToCategory(result.data as DbCategory);
      return Ok(category);
    } catch (error) {
      return Err(new NotFoundError('Category', slug));
    }
  }

  async getAll(): Promise<Result<Category[], ValidationError>> {
    try {
      const result = await this.db.list(
        'categories',
        { is_active: true },
        '*',
        {
          orderBy: [
            { column: 'sort_order', ascending: true },
            { column: 'name', ascending: true }
          ]
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Failed to fetch categories: ${err?.message ?? 'Unknown error'}`));
      }

      const categories = (result.data as DbCategory[])?.map(cat => this.mapDbCategoryToCategory(cat)) || [];
      return Ok(categories);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getTree(): Promise<Result<Category[], ValidationError>> {
    try {
      // Get all categories first
      const allCategoriesResult = await this.getAll();
      if (!allCategoriesResult.success) {
        return allCategoriesResult;
      }

      const categories = allCategoriesResult.data;
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // Create map and find root categories
      categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
        if (!category.parent_id) {
          rootCategories.push(categoryMap.get(category.id)!);
        }
      });

      // Build tree structure
      categories.forEach(category => {
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children!.push(categoryMap.get(category.id)!);
          }
        }
      });

      return Ok(rootCategories);
    } catch (error) {
      return Err(new ValidationError(`Failed to build category tree: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getBreadcrumb(categoryId: string): Promise<Result<Category[], ValidationError>> {
    try {
      const breadcrumb: Category[] = [];
      let currentId: string | null = categoryId;

      while (currentId) {
        const categoryResult = await this.getById(currentId);
        if (!categoryResult.success) {
          break;
        }

        breadcrumb.unshift(categoryResult.data);
        currentId = categoryResult.data.parent_id || null;
      }

      return Ok(breadcrumb);
    } catch (error) {
      return Err(new ValidationError(`Failed to build breadcrumb: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getDescendants(categoryId: string): Promise<Result<Category[], ValidationError>> {
    try {
      const result = await this.db.list(
        'categories',
        { parent_id: categoryId, is_active: true },
        '*',
        {
          orderBy: [{ column: 'sort_order', ascending: true }]
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Failed to fetch descendants: ${err?.message ?? 'Unknown error'}`));
      }

      const descendants = (result.data as DbCategory[])?.map(cat => this.mapDbCategoryToCategory(cat)) || [];
      return Ok(descendants);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch descendants: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getByLevel(level: number): Promise<Result<Category[], ValidationError>> {
    try {
      const result = await this.db.list(
        'categories',
        { level, is_active: true },
        '*',
        {
          orderBy: [{ column: 'sort_order', ascending: true }]
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Failed to fetch categories by level: ${err?.message ?? 'Unknown error'}`));
      }

      const categories = (result.data as DbCategory[])?.map(cat => this.mapDbCategoryToCategory(cat)) || [];
      return Ok(categories);
    } catch (error) {
      return Err(new ValidationError(`Failed to fetch categories by level: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async search(query: string, limit = 20): Promise<Result<Category[], ValidationError>> {
    try {
      const result = await this.db.select(
        'categories',
        '*',
        {
          is_active: true,
          or: `name.ilike.%${query}%,description.ilike.%${query}%`
        },
        {
          orderBy: [{ column: 'name', ascending: true }],
          limit
        }
      );

      if (result.error) {
        const err: any = result.error as any;
        return Err(new ValidationError(`Category search failed: ${err?.message ?? 'Unknown error'}`));
      }

      const categories = (result.data as DbCategory[])?.map(cat => this.mapDbCategoryToCategory(cat)) || [];
      return Ok(categories);
    } catch (error) {
      return Err(new ValidationError(`Category search failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async resolveSegments(segments: string[]): Promise<Result<string[], ValidationError>> {
    try {
      if (segments.length === 0) {
        return Ok([]);
      }

      // For now, just resolve the last segment to a category
      // In a full implementation, this would traverse the hierarchy
      const lastSegment = segments[segments.length - 1];
      const categoryResult = await this.getBySlug(lastSegment);

      if (!categoryResult.success) {
        return Err(new ValidationError(`Category not found: ${lastSegment}`));
      }

      return Ok([categoryResult.data.id]);
    } catch (error) {
      return Err(new ValidationError(`Failed to resolve segments: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Map database category to domain category
   */
  private mapDbCategoryToCategory(dbCategory: DbCategory): Category {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      description: dbCategory.description || undefined,
      slug: { value: dbCategory.slug },
      parent_id: dbCategory.parent_id || undefined,
      level: dbCategory.level || 1,
      sort_order: dbCategory.sort_order || 0,
      is_active: dbCategory.is_active || false,
      image_url: dbCategory.image_url || undefined,
      created_at: new Date(dbCategory.created_at || Date.now()),
      updated_at: new Date(dbCategory.updated_at || Date.now())
    };
  }
}

/**
 * Factory functions for creating repositories
 */
export function createProductRepository(db: SupabasePort): ProductRepository {
  return new SupabaseProductRepository(db);
}

export function createCategoryRepository(db: SupabasePort): CategoryRepository {
  return new SupabaseCategoryRepository(db);
}
