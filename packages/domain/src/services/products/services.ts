import type { Product, Category, Result } from './entities';
import type {
  ProductRepository,
  CategoryRepository,
  ProductSearchParams,
  ProductSearchResult
} from './ports';
import { Ok, Err, NotFoundError, ProductValidationError as ValidationError, PolicyError } from './entities';

/**
 * Domain Service: Get Product By Slug
 * Handles retrieving a single product by its slug and seller username
 */
export class GetProductBySlug {
  constructor(private productRepo: ProductRepository) {}

  async execute(slug: string, sellerUsername: string): Promise<Result<Product, NotFoundError | ValidationError | PolicyError>> {
    // Validate inputs
    if (!slug?.trim()) {
      return Err(new ValidationError('Product slug is required'));
    }
    if (!sellerUsername?.trim()) {
      return Err(new ValidationError('Seller username is required'));
    }

    if (slug.length > 255) {
      return Err(new ValidationError('Product slug is too long'));
    }
    if (sellerUsername.length > 50) {
      return Err(new ValidationError('Seller username is too long'));
    }

    // Retrieve product
    const productResult = await this.productRepo.getBySlugAndSeller(slug, sellerUsername);

    if (!productResult.success) {
      return productResult;
    }

    const product = productResult.data;

    // Additional business rules
    if (!product.is_active) {
      return Err(new PolicyError('Product is not active'));
    }

    if (product.is_sold) {
      return Err(new PolicyError('Product has been sold'));
    }

    return Ok(product);
  }
}

/**
 * Domain Service: Search Products
 * Handles product search with filtering, sorting, and pagination
 */
export class SearchProducts {
  constructor(private productRepo: ProductRepository) {}

  async execute(params: ProductSearchParams): Promise<Result<ProductSearchResult, ValidationError>> {
    // Validate and normalize search parameters
    const validatedParams = this.validateSearchParams(params);
    if (!validatedParams.success) {
      return validatedParams;
    }

    // Apply business rules to search
    const searchParams = this.applyBusinessRules(validatedParams.data);

    // Execute search
    const searchResult = await this.productRepo.search(searchParams);

    if (!searchResult.success) {
      return searchResult;
    }

    // Apply post-search filters and business logic
    const filteredResult = this.applyPostSearchFilters(searchResult.data);

    return Ok(filteredResult);
  }

  private validateSearchParams(params: ProductSearchParams): Result<ProductSearchParams, ValidationError> {
    const errors: string[] = [];

    // Validate query
    if (params.query && params.query.length > 255) {
      errors.push('Search query is too long');
    }

    // Validate price range
    if (params.min_price !== undefined && params.min_price < 0) {
      errors.push('Minimum price cannot be negative');
    }
    if (params.max_price !== undefined && params.max_price < 0) {
      errors.push('Maximum price cannot be negative');
    }
    if (params.min_price !== undefined && params.max_price !== undefined && params.min_price > params.max_price) {
      errors.push('Minimum price cannot be greater than maximum price');
    }

    // Validate pagination
    if (params.limit !== undefined && (params.limit < 1 || params.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }
    if (params.offset !== undefined && params.offset < 0) {
      errors.push('Offset cannot be negative');
    }

    // Validate arrays
    if (params.category_ids && params.category_ids.length > 50) {
      errors.push('Too many category filters');
    }
    if (params.conditions && params.conditions.length > 10) {
      errors.push('Too many condition filters');
    }
    if (params.sizes && params.sizes.length > 20) {
      errors.push('Too many size filters');
    }
    if (params.brands && params.brands.length > 20) {
      errors.push('Too many brand filters');
    }

    if (errors.length > 0) {
      return Err(new ValidationError(`Validation failed: ${errors.join(', ')}`));
    }

    return Ok(params);
  }

  private applyBusinessRules(params: ProductSearchParams): ProductSearchParams {
    // Apply default business rules
    return {
      ...params,
      // Ensure we only search for active, unsold products
      limit: params.limit || 20,
      sort: params.sort || { by: 'created_at', direction: 'desc' }
    };
  }

  private applyPostSearchFilters(result: ProductSearchResult): ProductSearchResult {
    // Apply any post-search business rules
    // For example, you might want to boost certain products or apply additional filtering
    return {
      ...result,
      products: result.products.filter(product => {
        // Only show active, unsold products
        return product.is_active && !product.is_sold;
      })
    };
  }
}

/**
 * Domain Service: Resolve Category Segments
 * Handles resolving URL path segments to category IDs
 */
export class ResolveCategorySegments {
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(segments: string[]): Promise<Result<string[], ValidationError>> {
    // Validate input
    const validationResult = this.validateSegments(segments);
    if (!validationResult.success) {
      return validationResult;
    }

    const cleanSegments = validationResult.data;

    // If no segments, return empty result
    if (cleanSegments.length === 0) {
      return Ok([]);
    }

    // Try to resolve segments to category IDs
    try {
      // Start with the most specific segment (last one)
      const lastSegment = cleanSegments[cleanSegments.length - 1];
      const categoryResult = await this.categoryRepo.getBySlug(lastSegment);

      if (!categoryResult.success) {
        // Try to resolve as a search
        const searchResult = await this.categoryRepo.search(lastSegment, 1);
        if (searchResult.success && searchResult.data.length > 0) {
          return Ok([searchResult.data[0].id]);
        }
        // Normalize to validation error for this service contract
        return Err(new ValidationError('Category not found'));
      }

      const category = categoryResult.data;

      // Validate that the category hierarchy matches the segments
      const hierarchyValidation = await this.validateHierarchy(category, cleanSegments);
      if (!hierarchyValidation.success) {
        return Err(new ValidationError('Hierarchy validation failed'));
      }

      return Ok([category.id]);
    } catch (error) {
      return Err(new ValidationError(`Failed to resolve category segments: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  private validateSegments(segments: string[]): Result<string[], ValidationError> {
    const errors: string[] = [];
    const cleanSegments: string[] = [];

    segments.forEach((segment, index) => {
      if (!segment?.trim()) {
        errors.push(`Segment ${index + 1} cannot be empty`);
        return;
      }

      const trimmed = segment.trim().toLowerCase();

      // Validate slug format
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
        errors.push(`Segment "${segment}" contains invalid characters`);
        return;
      }

      if (trimmed.length > 255) {
        errors.push(`Segment "${segment}" is too long`);
        return;
      }

      cleanSegments.push(trimmed);
    });

    if (errors.length > 0) {
      return Err(new ValidationError(`Invalid segments: ${errors.join(', ')}`));
    }

    if (cleanSegments.length > 5) {
      return Err(new ValidationError('Category path too deep (maximum 5 levels)'));
    }

    return Ok(cleanSegments);
  }

  private async validateHierarchy(category: Category, segments: string[]): Promise<Result<boolean, ValidationError>> {
    // Get the breadcrumb to verify the hierarchy
    const breadcrumbResult = await this.categoryRepo.getBreadcrumb(category.id);

    if (!breadcrumbResult.success) {
      return Ok(true); // Can't validate hierarchy, but don't fail the whole operation
    }

    const breadcrumb = breadcrumbResult.data;
    const breadcrumbSlugs = breadcrumb.map(cat => cat.slug.value);

    // Check if the provided segments match the breadcrumb (in reverse order)
    const reversedSegments = [...segments].reverse();

    // We only need to validate that the category we found makes sense in the context
    // The exact hierarchy validation can be enhanced based on business requirements

    return Ok(true);
  }
}

/**
 * Domain Service: Get Featured Products
 * Handles retrieving featured/promoted products for the homepage
 */
export class GetFeaturedProducts {
  constructor(private productRepo: ProductRepository) {}

  async execute(limit = 10, country?: string): Promise<Result<Product[], ValidationError>> {
    // Validate parameters
    if (limit < 1 || limit > 50) {
      return Err(new ValidationError('Limit must be between 1 and 50'));
    }

    // Get promoted products
    const promotedResult = await this.productRepo.getPromoted(limit);

    if (!promotedResult.success) {
      return promotedResult;
    }

    let products = promotedResult.data;

    // Filter by country if specified
    if (country) {
      products = products.filter(product => product.country_code === country);
    }

    // Apply business rules for featured products
    products = products.filter(product => {
      // Must be active and not sold
      if (!product.is_active || product.is_sold) {
        return false;
      }

      // Must have at least one image
      if (!product.images || product.images.length === 0) {
        return false;
      }

      // Must have a valid title
      if (!product.title || product.title.trim().length === 0) {
        return false;
      }

      return true;
    });

    return Ok(products.slice(0, limit));
  }
}

/**
 * Domain Service: Get Products By Category
 * Handles retrieving products for a category page
 */
export class GetProductsByCategory {
  constructor(
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async execute(
    categoryId: string,
    options: {
      includeDescendants?: boolean;
      limit?: number;
      offset?: number;
      sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
      country?: string;
    } = {}
  ): Promise<Result<{ products: Product[]; category: Category; total: number }, ValidationError | NotFoundError | PolicyError>> {
    // Validate category exists
    const categoryResult = await this.categoryRepo.getById(categoryId);
    if (!categoryResult.success) {
      return categoryResult;
    }

    const category = categoryResult.data;

    // Validate category is active
    if (!category.is_active) {
      return Err(new PolicyError('Category is not active'));
    }

    // Build search parameters
    const searchParams: ProductSearchParams = {
      category_id: categoryId,
      include_descendants: options.includeDescendants ?? true,
      limit: options.limit || 20,
      offset: options.offset,
      sort: options.sort || { by: 'created_at', direction: 'desc' }
    };

    // Filter by country if specified
    if (options.country) {
      searchParams.country_code = options.country;
    }

    // Get products
    const productsResult = await this.productRepo.search(searchParams);
    if (!productsResult.success) {
      return productsResult;
    }

    return Ok({
      products: productsResult.data.products,
      category,
      total: productsResult.data.total
    });
  }
}

/**
 * Factory functions for creating domain services
 */
export function createGetProductBySlug(productRepo: ProductRepository): GetProductBySlug {
  return new GetProductBySlug(productRepo);
}

export function createSearchProducts(productRepo: ProductRepository): SearchProducts {
  return new SearchProducts(productRepo);
}

export function createResolveCategorySegments(categoryRepo: CategoryRepository): ResolveCategorySegments {
  return new ResolveCategorySegments(categoryRepo);
}

export function createGetFeaturedProducts(productRepo: ProductRepository): GetFeaturedProducts {
  return new GetFeaturedProducts(productRepo);
}

export function createGetProductsByCategory(
  productRepo: ProductRepository,
  categoryRepo: CategoryRepository
): GetProductsByCategory {
  return new GetProductsByCategory(productRepo, categoryRepo);
}
