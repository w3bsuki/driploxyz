import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../+server';

// Test interface for ProductDomainAdapter
interface ProductDomainAdapterLike {
  resolveCategorySegments: {
    execute: ReturnType<typeof vi.fn>;
  };
  searchProductsWithFilters: ReturnType<typeof vi.fn>;
}

// Mock ProductDomainAdapter
vi.mock('$lib/services/products.domain', () => {
  const mockAdapter = {
    resolveCategorySegments: {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: []
      })
    },
    searchProductsWithFilters: vi.fn().mockResolvedValue({
      data: [],
      error: null
    })
  };

  return {
    ProductDomainAdapter: vi.fn().mockImplementation(() => mockAdapter)
  };
});

// Mock request
function createMockRequestEvent(url: string, method = 'GET') {
  const urlObj = new URL(url);
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return {
    request,
    url: urlObj,
    params: {},
    route: {
      id: null
    },
    fetch: global.fetch,
    getClientAddress: () => '127.0.0.1',
    cookies: {
      get: vi.fn(),
      getAll: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn()
    },
    locals: {
      country: 'US',
      supabase: {}
    },
    setHeaders: vi.fn(),
    isDataRequest: false,
    isSubRequest: false,
    platform: undefined
  } as unknown;
}

describe('/api/search endpoint', () => {
  let mockAdapter: ProductDomainAdapterLike;

  beforeEach(async () => {
    vi.resetAllMocks();
    
    // Get the mocked ProductDomainAdapter
    const { ProductDomainAdapter } = await import('$lib/services/products.domain');
    const ProductDomainAdapterMock = vi.mocked(ProductDomainAdapter);
    
    // Create a mock adapter instance with only the methods we need
    mockAdapter = {
      resolveCategorySegments: {
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: []
        })
      },
      searchProductsWithFilters: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    };

    // Mock the constructor with a properly typed return
    ProductDomainAdapterMock.mockImplementation(
      () => mockAdapter as unknown as InstanceType<typeof ProductDomainAdapterMock>
    );
  });

  it('should search products successfully', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: [
        {
          id: 'product-1',
          title: 'Test Product',
          description: 'A test product',
          price: 29.99,
          condition: 'good',
          location: 'New York',
          country_code: 'US',
          created_at: '2024-01-01T00:00:00Z',
          images: [
            { id: 'img-1', image_url: 'http://example.com/img1.jpg' }
          ],
          category_name: 'Test Category',
          seller_username: 'seller1',
          seller_rating: 4.5
        }
      ],
      error: null
    });

    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&pageSize=10');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe('Test Product');
    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 10,
      country_code: 'US',
      category_ids: [],
      sort: { by: 'relevance', direction: 'desc' }
    });
  });

  it('should handle missing query parameter', async () => {
    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it('should validate pageSize parameter', async () => {
    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&pageSize=101');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 101,
      country_code: 'US',
      category_ids: [],
      sort: { by: 'relevance', direction: 'desc' }
    });
  });

  it('should apply category filter', async () => {
    mockAdapter.resolveCategorySegments.execute.mockResolvedValue({
      success: true,
      data: ['cat1', 'cat2']
    });

    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&category=cat1&subcategory=cat2');
    await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'US',
      category_ids: ['cat1', 'cat2'],
      sort: { by: 'relevance', direction: 'desc' }
    });
  });

  it('should apply price range filter', async () => {
    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&min_price=10&max_price=100');
    await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'US',
      category_ids: [],
      min_price: 10,
      max_price: 100,
      sort: { by: 'relevance', direction: 'desc' }
    });
  });

  it('should apply sorting', async () => {
    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&sort=price-low');
    await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'US',
      category_ids: [],
      sort: { by: 'price', direction: 'asc' }
    });
  });

  it('should handle database errors', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: [],
      error: 'Database connection failed'
    });

    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle empty search results', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: [],
      error: null
    });

    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=nonexistent');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('should handle pagination', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        title: `Product ${i}`
      })),
      error: null
    });

    const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&page=2&pageSize=10');
    const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(10);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.total).toBe(100);
    expect(data.pagination.hasMore).toBe(true);
  });
});