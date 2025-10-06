import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { withTimeout } from '@repo/core/utils';
import { getProductAdapter } from '@repo/domain/services/adapters';
import { isUUID } from '$lib/utils/seo-urls';

export const load = (async ({ params, locals, depends, setHeaders }) => {
	const { session, user } = await locals.safeGetSession();
	const { id } = params;

	// Validate that the id is a UUID
	if (!isUUID(id)) {
		throw error(404, 'Product not found');
	}

	// Mark dependencies for intelligent invalidation
	depends('app:product');
	depends('app:products');
	depends('app:reviews');

	// Optimize caching for product pages
	setHeaders({
		'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
		'vary': 'Accept-Encoding',
		'x-cache-strategy': 'product-page-legacy'
	});

	// Initialize domain adapter
	const productAdapter = getProductAdapter(locals);

	try {
		// Get product by ID using domain service
		const productResult = await withTimeout(
			productAdapter.getProduct(id),
			5000,
			{ data: null, error: 'Product not found' }
		);

		if (!productResult.data || productResult.error) {
			throw error(404, 'Product not found');
		}

		const product = productResult.data;

		if (!product) {
			throw error(404, 'Product not found');
		}

		// Check if product has slug and seller_username for better URL
		if (product.slug && product.seller_username) {
			// Redirect to the SEO-friendly URL
			const seoUrl = `/product/${product.seller_username}/${product.slug}`;
			throw redirect(301, seoUrl);
		}

		// Load additional data in parallel for better performance
		const [
			sellerProductsResult,
		] = await Promise.all([
			// Seller's other products (optional, can fail gracefully)
			withTimeout(
				productAdapter.getSellerProducts(product.seller_id, { limit: 6 }),
				3000,
				{ data: [], error: null }
			),
		]);

		const similarProducts: unknown[] = [];
		const sellerProfile = null as {
			username?: string;
			full_name?: string;
			avatar_url?: string;
			rating?: number;
			sales_count?: number;
			bio?: string;
		} | null;
		const userFavorite = false;

		// Transform data for frontend
		const transformedProduct = {
			...product,
			images: product.images?.map((img: { image_url: string }) => img.image_url) || [],
			main_category_name: product.category_name,
			category_name: product.category_name,
			subcategory_name: null,
			seller_name: sellerProfile?.username || sellerProfile?.full_name || 'Unknown Seller',
			seller_username: sellerProfile?.username,
			seller_avatar: sellerProfile?.avatar_url,
			seller_rating: sellerProfile?.rating,
			seller_sales_count: sellerProfile?.sales_count,
			seller_bio: sellerProfile?.bio,
			seller: sellerProfile,
			isFavorited: userFavorite,
			category_slug: null, // Not available in legacy route
			parent_category: null,
			top_level_category: null
		};

		return {
			product: transformedProduct,
			similarProducts,
			sellerProducts: sellerProductsResult?.data || [],
			user,
			session,
			// Legacy route indicator
			isLegacyRoute: true
		};

	} catch (err) {
		// If it's already a SvelteKit error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Log error for debugging
		console.error('Error loading product:', err);
		throw error(500, 'Failed to load product');
	}
}) satisfies PageServerLoad;