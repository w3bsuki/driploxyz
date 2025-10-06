import { json, error } from '@sveltejs/kit';
import { createServices } from '@repo/core/services';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
	try {
		const services = createServices(supabase, null); // No stripe needed for product API
		
		// Get the product with images and seller info
		const { data: product, error: productError } = await services.products.getProduct(params.id);

		if (productError || !product) {
			error(404, 'Product not found');
		}

		// Transform product data to match the UI Product interface
		const productData = {
			id: product.id,
			title: product.title,
			description: product.description,
			price: Math.round(product.price * 100), // Convert to cents
			images: product.images || ['/placeholder-product.jpg'],
			brand: product.brand,
			size: product.size,
			condition: product.condition,
			category: product.category_name || 'clothing',
			sellerId: product.seller_id,
			sellerName: product.seller_username || 'Unknown',
			sellerRating: product.seller_rating || 0,
			createdAt: product.created_at,
			location: product.location,
			tags: product.tags || []
		};

		return json({ product: productData });
	} catch {
		
		return json({ error: 'Failed to load product' }, { status: 500 });
	}
};