import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../products';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient = {
    from: vi.fn(),
    rpc: vi.fn()
  } as unknown as SupabaseClient<Database>;

  return mockClient;
};

// Mock product data
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
  archived_at: null,
  auto_archive_after_days: null,
  boost_history_id: null,
  boost_priority: null,
  boost_expires_at: null,
  is_boosted: false,
  is_featured: false,
  is_verified: false,
  is_draft: false,
  is_pending: false,
  is_rejected: false,
  rejection_reason: null,
  moderation_notes: null,
  moderation_status: 'approved' as const,
  moderation_updated_at: null,
  moderation_updated_by: null,
  shipping_type: null,
  shipping_cost: null,
  shipping_width: null,
  shipping_height: null,
  shipping_length: null,
  shipping_weight: null,
  boost_type: null,
  boosted_until: null,
  brand_collection_id: null,
  commission_rate: null,
  custom_subcategory: null,
  drip_admin_notes: null,
  drip_approved_at: null,
  drip_nominated_at: null,
  drip_nominated_by: null,
  drip_quality_score: null,
  drip_rejected_at: null,
  drip_rejection_reason: null,
  drip_reviewed_by: null,
  drip_status: null,
  is_drip_candidate: false,
  net_earnings: null,
  platform_fee: null,
  search_vector: null,
  slug_locked: false,
  sold_at: null,
  status: null,
  tags: null,
  images: [],
  category_name: 'Test Category',
  seller_name: 'Test Seller',
  seller_username: 'testseller',
  seller_rating: 4.5
};

describe('ProductService', () => {
  let service: ProductService;
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new ProductService(mockSupabase);
  });

  describe('getProduct', () => {
    it('should return product when found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockProduct,
            product_images: [
              { id: 'img1', image_url: 'http://example.com/img1.jpg', alt_text: 'Image 1', display_order: 0, created_at: new Date(), product_id: 'test-product-id', sort_order: 0 }
            ],
            categories: { name: 'Test Category' },
            profiles: { username: 'testseller', rating: 4.5, avatar_url: 'http://example.com/avatar.jpg' }
          },
          error: null
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.getProduct('test-product-id');

      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.id).toBe('test-product-id');
        expect(result.data.title).toBe('Test Product');
        expect(result.data.images).toHaveLength(1);
      }
      expect(result.error).toBeNull();
    });

    it('should return error when product ID is empty', async () => {
      const result = await service.getProduct('');
      
      expect(result.data).toBeNull();
      expect(result.error).toBe('Product ID is required');
    });

    it('should return error when product is not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.getProduct('nonexistent-id');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Product not found');
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.getProduct('test-product-id');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getProducts', () => {
    it('should return products with default options', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [
            {
              ...mockProduct,
              product_images: [],
              categories: { name: 'Test Category' },
              profiles: { username: 'testseller', rating: 4.5 }
            }
          ],
          error: null,
          count: 1
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.getProducts();

      expect(result.data).toHaveLength(1);
      if (result.data && result.data.length > 0) {
        expect(result.data[0]?.id).toBe('test-product-id');
      }
      expect(result.error).toBeNull();
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should apply filters correctly', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      await service.getProducts({
        filters: {
          category_ids: ['cat1', 'cat2'],
          min_price: 10,
          max_price: 100,
          search: 'test query',
          country_code: 'US'
        }
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockQuery.eq).toHaveBeenCalledWith('is_sold', false);
      expect(mockQuery.eq).toHaveBeenCalledWith('country_code', 'US');
      expect(mockQuery.in).toHaveBeenCalledWith('category_id', ['cat1', 'cat2']);
      expect(mockQuery.gte).toHaveBeenCalledWith('price', 10);
      expect(mockQuery.lte).toHaveBeenCalledWith('price', 100);
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test query%,description.ilike.%test query%,brand.ilike.%test query%');
    });

    it('should apply sorting correctly', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      await service.getProducts({
        sort: { by: 'price', direction: 'asc' }
      });

      expect(mockQuery.order).toHaveBeenCalledWith('price', { ascending: true });
    });

    it('should handle cursor-based pagination', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      // Create a valid cursor
      const timestamp = new Date('2024-01-01').toISOString();
      const id = 'test-product-id';
      const cursor = Buffer.from(`${timestamp}:${id}`).toString('base64');

      await service.getProducts({
        cursor,
        limit: 10
      });

      expect(mockQuery.or).toHaveBeenCalledWith(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const productData = {
        title: 'Test Product',
        description: 'A test product',
        price: 29.99,
        condition: 'good' as const,
        location: 'New York',
        country_code: 'US',
        seller_id: 'test-seller-id',
        category_id: 'test-category-id',
        slug: 'test-product'
      };

      const result = await service.createProduct(productData);

      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.title).toBe('Test Product');
      }
      expect(result.error).toBeNull();
    });

    it('should handle creation errors', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to insert product' }
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const productData = {
        title: 'Test Product',
        description: 'A test product',
        price: 29.99,
        condition: 'good' as const,
        location: 'New York',
        country_code: 'US',
        seller_id: 'test-seller-id',
        category_id: 'test-category-id',
        slug: 'test-product'
      };

      const result = await service.createProduct(productData);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to insert product');
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockProduct, title: 'Updated Product' },
          error: null
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const updates = { title: 'Updated Product' };

      const result = await service.updateProduct('test-product-id', updates, 'test-seller-id');

      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.title).toBe('Updated Product');
      }
      expect(result.error).toBeNull();
      expect(mockQuery.eq).toHaveBeenCalledWith('seller_id', 'test-seller-id');
    });

    it('should handle update errors', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to update product' }
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const updates = { title: 'Updated Product' };

      const result = await service.updateProduct('test-product-id', updates, 'test-seller-id');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to update product');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product successfully', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn()
          .mockReturnThis()
          .mockReturnThis()
          .mockResolvedValue({
            data: null,
            error: null
          })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.deleteProduct('test-product-id', 'test-seller-id');

      expect(result.error).toBeNull();
      expect(mockQuery.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockQuery.eq).toHaveBeenCalledWith('seller_id', 'test-seller-id');
    });

    it('should handle delete errors', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn()
          .mockReturnThis()
          .mockReturnThis()
          .mockResolvedValue({
            data: null,
            error: { message: 'Failed to delete product' }
          })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.deleteProduct('test-product-id', 'test-seller-id');

      expect(result.error).toBe('Failed to delete product');
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              ...mockProduct,
              product_images: [],
              profiles: { username: 'testseller', full_name: 'Test Seller', rating: 4.5 },
              categories: { name: 'Test Category' }
            }
          ],
          error: null
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.searchProducts('test query');

      expect(result.data).toHaveLength(1);
      if (result.data && result.data.length > 0) {
        expect(result.data[0]?.title).toBe('Test Product');
      }
      expect(result.error).toBeNull();
      expect(mockQuery.ilike).toHaveBeenCalledWith('title', '%test query%');
    });

    it('should handle search errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Search failed' }
        })
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as unknown);

      const result = await service.searchProducts('test query');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Search failed');
    });
  });
});