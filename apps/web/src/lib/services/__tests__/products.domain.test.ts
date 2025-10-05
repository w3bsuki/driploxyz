import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductDomainAdapter } from '../products.domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { ProductWithImages } from '../products';

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient = {
    from: vi.fn(),
    rpc: vi.fn()
  } as unknown as SupabaseClient<Database>;

  return mockClient;
};

describe('ProductDomainAdapter', () => {
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockSupabase = createMockSupabaseClient();
  });

  describe('getProduct', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: 'test-product-id',
        title: 'Test Product',
        description: 'A test product',
        price: 29.99,
        condition: 'good',
        size: 'M',
        brand: 'Test Brand',
        color: 'Blue',
        material: 'Cotton',
        location: 'New York',
        country_code: 'US',
        region: 'NY',
        slug: 'test-product',
        seller_id: 'test-seller-id',
        category_id: 'test-category-id',
        is_active: true,
        is_sold: false,
        view_count: 0,
        favorite_count: 0,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        images: [],
        category_name: 'Test Category',
        seller_name: 'Test Seller',
        seller_username: 'testseller',
        seller_rating: 4.5
      } as unknown as ProductWithImages;

      // Mock the product repository
      const mockProductRepo = {
        getById: vi.fn().mockResolvedValue({
          success: true,
          data: mockProduct
        })
      };

      // Create a new adapter with mocked repository
      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { productRepo: typeof mockProductRepo }).productRepo = mockProductRepo;

      const result = await mockAdapter.getProduct('test-product-id');

      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.id).toBe('test-product-id');
        expect(result.data.title).toBe('Test Product');
      }
      expect(result.error).toBeNull();
    });

    it('should return error when product is not found', async () => {
      const mockProductRepo = {
        getById: vi.fn().mockResolvedValue({
          success: false,
          error: { message: 'Product not found' }
        })
      };

      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { productRepo: typeof mockProductRepo }).productRepo = mockProductRepo;

      const result = await mockAdapter.getProduct('nonexistent-id');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Product not found');
    });
  });

  describe('searchProductsWithFilters', () => {
    it('should search products with filters', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          title: 'Test Product',
          description: 'A test product',
          price: 29.99,
          condition: 'good',
          location: 'New York',
          country_code: 'US',
          created_at: new Date('2024-01-01'),
          images: [],
          category_name: 'Test Category',
          seller_username: 'testseller',
          seller_rating: 4.5
        } as unknown as ProductWithImages
      ];

      const mockSearchProducts = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: {
            products: mockProducts,
            total: 1,
            hasMore: false
          }
        })
      };

      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { searchProducts: typeof mockSearchProducts }).searchProducts = mockSearchProducts;

      const result = await mockAdapter.searchProductsWithFilters('test', {
        limit: 10,
        min_price: 10,
        max_price: 100,
        category_ids: ['cat1', 'cat2']
      });

      expect(result.data).toHaveLength(1);
      if (result.data && result.data.length > 0) {
        expect(result.data[0]?.title).toBe('Test Product');
      }
      expect(result.error).toBeNull();
      expect(mockSearchProducts.execute).toHaveBeenCalledWith({
        query: 'test',
        limit: 10,
        min_price: 10,
        max_price: 100,
        category_ids: ['cat1', 'cat2']
      });
    });

    it('should return error when search fails', async () => {
      const mockSearchProducts = {
        execute: vi.fn().mockResolvedValue({
          success: false,
          error: { message: 'Search failed' }
        })
      };

      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { searchProducts: typeof mockSearchProducts }).searchProducts = mockSearchProducts;

      const result = await mockAdapter.searchProductsWithFilters('test');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Search failed');
    });
  });

  describe('getPromotedProducts', () => {
    it('should get promoted products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          title: 'Featured Product',
          description: 'A featured product',
          price: 29.99,
          condition: 'good',
          location: 'New York',
          country_code: 'US',
          created_at: new Date('2024-01-01'),
          images: [],
          category_name: 'Test Category',
          seller_username: 'testseller',
          seller_rating: 4.5
        } as unknown as ProductWithImages
      ];

      const mockGetFeaturedProducts = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: mockProducts
        })
      };

      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { getFeaturedProducts: typeof mockGetFeaturedProducts }).getFeaturedProducts = mockGetFeaturedProducts;

      const result = await mockAdapter.getPromotedProducts(10);

      expect(result.data).toHaveLength(1);
      if (result.data && result.data.length > 0) {
        expect(result.data[0]?.title).toBe('Featured Product');
      }
      expect(result.error).toBeNull();
      expect(mockGetFeaturedProducts.execute).toHaveBeenCalledWith(10);
    });
  });

  describe('resolveCategorySegmentsFromPath', () => {
    it('should resolve category segments', async () => {
      const mockResolveCategorySegments = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: ['cat1', 'cat2', 'cat3']
        })
      };

      const mockAdapter = new ProductDomainAdapter(mockSupabase);
      (mockAdapter as unknown as { resolveCategorySegments: typeof mockResolveCategorySegments }).resolveCategorySegments = mockResolveCategorySegments;

      const result = await mockAdapter.resolveCategorySegmentsFromPath(['clothing', 'men', 'shirts']);

      expect(result.data).toEqual(['cat1', 'cat2', 'cat3']);
      expect(result.error).toBeNull();
      expect(mockResolveCategorySegments.execute).toHaveBeenCalledWith(['clothing', 'men', 'shirts']);
    });
  });
});