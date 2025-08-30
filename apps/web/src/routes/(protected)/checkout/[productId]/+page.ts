import type { PageLoad } from './$types.js';
import type { Product } from '@repo/ui';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		// Product ID passed from route parameters
		
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
		currency: 'eur',
		images: ['/placeholder-product.jpg'],
		brand: 'Test Brand',
		size: 'M',
		condition: 'new',
		seller_id: 'test-seller',
		category_id: 'test-category',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		sold: false,
		favorites_count: 0,
		views_count: 0,
		location: 'Test Location',
		seller_name: 'test_user',
		seller_rating: 5.0
	};

	return {
		product: testProduct
	};
};