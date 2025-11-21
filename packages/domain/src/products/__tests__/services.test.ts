import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Product, Category, Result } from '../types';
import type { ProductRepository, CategoryRepository } from '../types';
import { NotFoundError, ProductValidationError as ValidationError } from '../types';
import {
  GetProductBySlug,
  SearchProducts,
  ResolveCategorySegments,
  createGetProductBySlug,
  createSearchProducts,
  createResolveCategorySegments
} from '../services';

// Mock implementations for testing
const mockProduct: Product = {
  id: 'test-product-id',
  title: 'Test Product',
  description: 'A test product',
  price: { amount: 29.99, currency: 'USD' },
  condition: 'good',
  location: 'New York',
  country_code: 'US',
  slug: { value: 'test-product' },
  seller_id: 'test-seller-id',
  category_id: 'test-category-id',
  is_active: true,
  is_sold: false,
  view_count: 0,
  favorite_count: 0,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  images: [],
  seller_username: 'test-seller'
};

const mockCategory: Category = {
  id: 'test-category-id',
  name: 'Test Category',
  slug: { value: 'test-category' },
  level: 1,
  sort_order: 1,
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
};

describe('GetProductBySlug', () => {
  let service: GetProductBySlug;
  let mockRepo: vi.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = {
      getBySlugAndSeller: vi.fn()
    } as any;
    service = createGetProductBySlug(mockRepo);
  });

  it('should return product when found and active', async () => {
    mockRepo.getBySlugAndSeller.mockResolvedValue({ success: true, data: mockProduct });

    const result = await service.execute('test-product', 'test-seller');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockProduct);
    }
    expect(mockRepo.getBySlugAndSeller).toHaveBeenCalledWith('test-product', 'test-seller');
  });

  it('should return validation error for empty slug', async () => {
    const result = await service.execute('', 'test-seller');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('slug is required');
    }
  });

  it('should return validation error for empty seller username', async () => {
    const result = await service.execute('test-product', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('username is required');
    }
  });

  it('should return not found error when product does not exist', async () => {
    mockRepo.getBySlugAndSeller.mockResolvedValue({
      success: false,
      error: new NotFoundError('Product', 'test-product')
    });

    const result = await service.execute('nonexistent', 'test-seller');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it('should return policy error when product is sold', async () => {
    const soldProduct = { ...mockProduct, is_sold: true };
    mockRepo.getBySlugAndSeller.mockResolvedValue({ success: true, data: soldProduct });

    const result = await service.execute('test-product', 'test-seller');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('sold');
    }
  });
});

describe('SearchProducts', () => {
  let service: SearchProducts;
  let mockRepo: vi.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = {
      search: vi.fn()
    } as any;
    service = createSearchProducts(mockRepo);
  });

  it('should search products successfully', async () => {
    const mockSearchResult = {
      products: [mockProduct],
      total: 1,
      hasMore: false
    };
    mockRepo.search.mockResolvedValue({ success: true, data: mockSearchResult });

    const result = await service.execute({ query: 'test', limit: 10 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockSearchResult);
    }
  });

  it('should validate search parameters', async () => {
    const result = await service.execute({
      query: 'x'.repeat(300), // Too long
      limit: 0 // Invalid limit
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('should apply default business rules', async () => {
    const mockSearchResult = {
      products: [mockProduct],
      total: 1,
      hasMore: false
    };
    mockRepo.search.mockResolvedValue({ success: true, data: mockSearchResult });

    await service.execute({});

    expect(mockRepo.search).toHaveBeenCalledWith({
      limit: 20,
      sort: { by: 'created_at', direction: 'desc' }
    });
  });
});

describe('ResolveCategorySegments', () => {
  let service: ResolveCategorySegments;
  let mockRepo: vi.Mocked<CategoryRepository>;

  beforeEach(() => {
    mockRepo = {
      getBySlug: vi.fn(),
      getBreadcrumb: vi.fn(),
      search: vi.fn()
    } as any;
    service = createResolveCategorySegments(mockRepo);
  });

  it('should resolve category segments successfully', async () => {
    mockRepo.getBySlug.mockResolvedValue({ success: true, data: mockCategory });
    mockRepo.getBreadcrumb.mockResolvedValue({ success: true, data: [mockCategory] });

    const result = await service.execute(['test-category']);

    expect(result?.success).toBe(true);
    if (result?.success) {
      expect(result.data).toEqual(['test-category-id']);
    }
  });

  it('should return empty array for no segments', async () => {
    const result = await service.execute([]);

    expect(result?.success).toBe(true);
    if (result?.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should validate segment format', async () => {
    const result = await service.execute(['invalid segment!', 'another-one']);

    expect(result?.success).toBe(false);
    if (!result?.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('invalid characters');
    }
  });

  it('should return not found when category does not exist', async () => {
    mockRepo.getBySlug.mockResolvedValue({
      success: false,
      error: new NotFoundError('Category', 'nonexistent')
    });
    mockRepo.search.mockResolvedValue({
      success: true,
      data: [] // Empty search results
    });

    const result = await service.execute(['nonexistent']);

    expect(result?.success).toBe(false);
    if (!result?.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });
});