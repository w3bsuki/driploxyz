import type { PageLoad } from './$types.js';
import type { Product } from '@repo/ui';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		// Debug logging for product ID
		console.log('Checkout page - params.productId:', params.productId);
		console.log('Checkout page - typeof params.productId:', typeof params.productId);
		
		// Validate product ID
		if (!params.productId || params.productId === '[object Object]') {
			throw new Error('Invalid product ID');
		}
		
		// Get real product data from the API
		const response = await fetch(`/api/products/${params.productId}`);
		
		if (response.ok) {
			const productData = await response.json();
			return {
				product: productData.product
			};
		}
	} catch (error) {
		console.error('Failed to load product:', error);
	}

	// Fallback to test product with $0.01 price for testing
	const testProduct: Product = {
		id: params.productId,
		title: 'TEST PRODUCT - $0.01',
		description: 'Test product for payment testing - will charge $0.01',
		price: 1, // $0.01 in cents for testing
		images: ['/placeholder-product.jpg'],
		brand: 'Test Brand',
		size: 'M',
		condition: 'new',
		category: 'test',
		sellerId: 'test-seller',
		sellerName: 'test_user',
		sellerRating: 5.0,
		createdAt: new Date().toISOString(),
		location: 'Test Location',
		tags: ['test', 'payment']
	};

	return {
		product: testProduct
	};
};