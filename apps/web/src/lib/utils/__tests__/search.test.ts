import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performSearch, performQuickSearch, type QuickSearchResult } from '../search';

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

import { goto } from '$app/navigation';

describe('Search Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('performSearch', () => {
    it('should navigate to search page with query', async () => {
      await performSearch('shoes');
      expect(goto).toHaveBeenCalledWith('/search?q=shoes');
    });

    it('should encode special characters in query', async () => {
      await performSearch('nike air max');
      expect(goto).toHaveBeenCalledWith('/search?q=nike%20air%20max');
    });

    it('should trim whitespace from query', async () => {
      await performSearch('  shoes  ');
      expect(goto).toHaveBeenCalledWith('/search?q=shoes');
    });

    it('should not navigate for empty query', async () => {
      await performSearch('');
      expect(goto).not.toHaveBeenCalled();
    });

    it('should not navigate for whitespace-only query', async () => {
      await performSearch('   ');
      expect(goto).not.toHaveBeenCalled();
    });

    it('should handle null query', async () => {
      await performSearch(null as unknown as string);
      expect(goto).not.toHaveBeenCalled();
    });

    it('should handle undefined query', async () => {
      await performSearch(undefined as unknown as string);
      expect(goto).not.toHaveBeenCalled();
    });

    it('should encode URL-unsafe characters', async () => {
      await performSearch('test&query=value');
      expect(goto).toHaveBeenCalledWith('/search?q=test%26query%3Dvalue');
    });

    it('should handle unicode characters', async () => {
      await performSearch('тениска');
      expect(goto).toHaveBeenCalledWith('/search?q=%D1%82%D0%B5%D0%BD%D0%B8%D1%81%D0%BA%D0%B0');
    });
  });

  describe('performQuickSearch', () => {
    const createMockSupabase = (mockResponse: { data: any; error: any }) => ({
      rpc: vi.fn().mockResolvedValue(mockResponse)
    });

    it('should return empty results for empty query', async () => {
      const mockSupabase = createMockSupabase({ data: [], error: null });
      const result = await performQuickSearch(mockSupabase as any, '');
      
      expect(result).toEqual({ data: [], error: null });
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should return empty results for whitespace query', async () => {
      const mockSupabase = createMockSupabase({ data: [], error: null });
      const result = await performQuickSearch(mockSupabase as any, '   ');
      
      expect(result).toEqual({ data: [], error: null });
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should return empty results when supabase is null', async () => {
      const result = await performQuickSearch(null, 'shoes');
      expect(result).toEqual({ data: [], error: null });
    });

    it('should call search_products_fast RPC with correct parameters', async () => {
      const mockSupabase = createMockSupabase({ data: [], error: null });
      await performQuickSearch(mockSupabase as any, 'test query');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('search_products_fast', {
        query_text: 'test query',
        result_limit: 6
      });
    });

    it('should transform results with first_image_url to images array', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Nike Shoes',
          price: 99.99,
          first_image_url: 'https://example.com/image1.jpg',
          slug: 'nike-shoes'
        },
        {
          id: '2',
          title: 'Adidas Jacket',
          price: 149.99,
          first_image_url: 'https://example.com/image2.jpg',
          slug: 'adidas-jacket'
        }
      ];

      const mockSupabase = createMockSupabase({ data: mockData, error: null });
      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].images).toEqual([{ image_url: 'https://example.com/image1.jpg' }]);
      expect(result.data[1].images).toEqual([{ image_url: 'https://example.com/image2.jpg' }]);
    });

    it('should handle results without first_image_url', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Product without image',
          price: 50,
          first_image_url: null,
          slug: 'product-without-image'
        }
      ];

      const mockSupabase = createMockSupabase({ data: mockData, error: null });
      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data[0].images).toEqual([]);
    });

    it('should return error message when RPC fails', async () => {
      const mockSupabase = createMockSupabase({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });

    it('should handle exception during search', async () => {
      const mockSupabase = {
        rpc: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Search failed');
    });

    it('should trim query before searching', async () => {
      const mockSupabase = createMockSupabase({ data: [], error: null });
      await performQuickSearch(mockSupabase as any, '  shoes  ');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('search_products_fast', {
        query_text: 'shoes',
        result_limit: 6
      });
    });

    it('should handle non-array response gracefully', async () => {
      const mockSupabase = createMockSupabase({ data: null, error: null });
      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should preserve all original result properties', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Product',
          price: 100,
          first_image_url: 'https://example.com/image.jpg',
          slug: 'test-product',
          category: 'shoes',
          brand: 'Nike'
        }
      ];

      const mockSupabase = createMockSupabase({ data: mockData, error: null });
      const result = await performQuickSearch(mockSupabase as any, 'test');

      expect(result.data[0]).toMatchObject({
        id: '1',
        title: 'Test Product',
        price: 100,
        slug: 'test-product',
        category: 'shoes',
        brand: 'Nike'
      });
    });
  });

  describe('QuickSearchResult type', () => {
    it('should have correct structure', () => {
      const validResult: QuickSearchResult = {
        id: '123',
        title: 'Test Product',
        price: 99.99,
        images: [{ image_url: 'https://example.com/image.jpg' }],
        slug: 'test-product',
        first_image_url: 'https://example.com/image.jpg'
      };

      expect(validResult.id).toBeDefined();
      expect(validResult.title).toBeDefined();
      expect(validResult.price).toBeDefined();
      expect(validResult.images).toBeInstanceOf(Array);
    });
  });
});
