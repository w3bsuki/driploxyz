import type { PageLoad } from './$types.js';
import type { Product } from '@repo/ui';

export const load = (async ({ params, fetch }) => {
  try {
    if (!params.productId || params.productId === '[object Object]') {
      throw new Error('Invalid product ID');
    }

    const response = await fetch(`/api/products/${params.productId}`);

    if (response.ok) {
      const productData = await response.json();
      if (productData && typeof productData === 'object' && 'product' in productData) {
        return {
          product: productData.product as Product
        };
      }
    }
  } catch {
    // TODO: integrate logging once server logger is wired up
  }

  const testProduct = {
    id: params.productId,
    title: 'TEST PRODUCT - $0.01',
    description: 'Test product for payment testing - will charge $0.01',
    price: 1,
    currency: 'eur',
    images: ['/placeholder-product.jpg'],
    brand: 'Test Brand',
    size: 'M',
    condition: 'new_without_tags' as const,
    seller_id: 'test-seller',
    category_id: 'test-category',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_sold: false,
    favorite_count: 0,
    view_count: 0,
    location: 'Test Location',
    sellerName: 'test_user',
    sellerRating: 5.0,
    // Required ProductUIFields
    sellerId: 'test-seller', // Legacy compatibility
    createdAt: new Date().toISOString(), // Legacy compatibility
    slug: 'test-product-001',
    availableSizes: ['M'],
    // Database fields that might be required
    country_code: 'BG',
    status: 'active' as const,
    tags: null,
    is_featured: false,
    is_boosted: false,
    boosted_until: null,
    material: null,
    color: null
  } satisfies Product;

  return {
    product: testProduct
  };
}) satisfies PageLoad;
