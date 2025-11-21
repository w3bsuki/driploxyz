import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test interface for ProductDomainAdapter
interface ProductDomainAdapterLike {
  resolveCategorySegments: ReturnType<typeof vi.fn>;
  searchProductsWithFilters: ReturnType<typeof vi.fn>;
}

// Prepare variable to hold mock adapter accessible in tests
let mockAdapter: ProductDomainAdapterLike;

// Mock ProductDomainAdapter (must be hoisted before importing GET)
vi.mock('@repo/core/services', () => {
  return {
    ProductDomainAdapter: vi.fn().mockImplementation(() => mockAdapter as any)
  };
});

// Mock request
async function importHandler() {
  // dynamic import to bind mocks
  const mod = await import('../+server');
  return mod.GET;
}

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
      country: 'BG',
      supabase: {}
    },
    setHeaders: vi.fn(),
    isDataRequest: false,
    isSubRequest: false,
    platform: undefined
  } as unknown;
}

describe('/api/search endpoint', () => {

  beforeEach(async () => {
    vi.resetAllMocks();
    // Recreate mock adapter for direct control in tests
    mockAdapter = {
      resolveCategorySegments: vi.fn().mockResolvedValue({ success: true, data: [] }),
      searchProductsWithFilters: vi.fn().mockResolvedValue({ data: [], error: null })
    } as unknown as ProductDomainAdapterLike;
    // Update the mocked constructor to return our instance
    const { ProductDomainAdapter } = await import('@repo/core/services');
    vi.mocked(ProductDomainAdapter).mockImplementation(() => mockAdapter as any);
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

  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&pageSize=10');
  const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe('Test Product');
    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 10,
      country_code: 'BG',
      category_ids: undefined,
      min_price: undefined,
      max_price: undefined,
      conditions: undefined,
      brands: undefined,
      sizes: undefined,
      sort: { by: 'relevance', direction: 'desc' },
      offset: 0
    });
  });

  it('should handle missing query parameter', async () => {
  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search');
  const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it('should validate pageSize parameter', async () => {
  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&pageSize=101');
  const response = await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 100,
      country_code: 'BG',
      category_ids: undefined,
      min_price: undefined,
      max_price: undefined,
      conditions: undefined,
      brands: undefined,
      sizes: undefined,
      sort: { by: 'relevance', direction: 'desc' },
      offset: 0
    });
  });

  it('should apply category filter', async () => {
    mockAdapter.resolveCategorySegments.mockResolvedValue({
      success: true,
      data: ['cat1', 'cat2']
    });

  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&category=cat1&subcategory=cat2');
  await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'BG',
      category_ids: ['cat1', 'cat2'],
      min_price: undefined,
      max_price: undefined,
      conditions: undefined,
      brands: undefined,
      sizes: undefined,
      sort: { by: 'relevance', direction: 'desc' },
      offset: 0
    });
  });

  it('should apply price range filter', async () => {
  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&min_price=10&max_price=100');
  await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'BG',
      category_ids: undefined,
      min_price: 10,
      max_price: 100,
      conditions: undefined,
      brands: undefined,
      sizes: undefined,
      sort: { by: 'relevance', direction: 'desc' },
      offset: 0
    });
  });

  it('should apply sorting', async () => {
  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&sort=price-low');
  await GET(requestEvent as Parameters<typeof GET>[0]);

    expect(mockAdapter.searchProductsWithFilters).toHaveBeenCalledWith('test', {
      limit: 50,
      country_code: 'BG',
      category_ids: undefined,
      min_price: undefined,
      max_price: undefined,
      conditions: undefined,
      brands: undefined,
      sizes: undefined,
      sort: { by: 'price', direction: 'asc' },
      offset: 0
    });
  });

  it('should handle database errors', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: [],
      error: 'Database connection failed'
    });

  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test');
  const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Search temporarily unavailable');
  });

  it('should handle empty search results', async () => {
    mockAdapter.searchProductsWithFilters.mockResolvedValue({
      data: [],
      error: null
    });

  const GET = await importHandler();
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

  const GET = await importHandler();
  const requestEvent = createMockRequestEvent('http://localhost:5173/api/search?q=test&page=2&pageSize=10');
  const response = await GET(requestEvent as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
  // Route returns full data, not sliced; it computes pagination flags
  expect(data.data).toHaveLength(100);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.total).toBe(100);
    expect(data.pagination.hasMore).toBe(false);
  });
});