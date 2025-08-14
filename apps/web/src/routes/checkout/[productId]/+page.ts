import type { PageLoad } from './$types.js';
import type { Product } from '@repo/ui';

export const load: PageLoad = async ({ params }) => {
	// This is a mock product for now - replace with actual Supabase query
	const mockProduct: Product = {
		id: params.productId,
		title: 'Vintage Denim Jacket',
		description: 'Classic 90s style denim jacket in excellent condition',
		price: 4500, // €45.00 in cents
		images: ['/placeholder-product.jpg'],
		brand: 'Levi\'s',
		size: 'M',
		condition: 'good',
		category: 'jackets',
		sellerId: 'seller-123',
		sellerName: 'fashionista_jane',
		sellerRating: 4.8,
		createdAt: new Date().toISOString(),
		location: 'Paris, France',
		tags: ['vintage', 'denim', 'casual']
	};

	return {
		product: mockProduct
	};
};