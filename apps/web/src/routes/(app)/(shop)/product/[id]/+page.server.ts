import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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

	// Get product directly from Supabase (domain adapter not fully implemented)
	const productResult = await locals.supabase
		.from('products')
		.select(`
			*,
			product_images (image_url, sort_order),
			profiles!products_seller_id_fkey (username, full_name, avatar_url),
			categories (id, name, slug, parent_id, level)
		`)
		.eq('id', id)
		.single();

	const { data: product, error: productError } = productResult;

	if (productError || !product) {
		throw error(404, 'Product not found');
	}

	// Extract seller username
	const sellerProfile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
	const sellerUsername = sellerProfile?.username;

	// Check if product has slug and seller_username for better URL
	if (product.slug && sellerUsername) {
		// Redirect to the SEO-friendly URL
		const seoUrl = `/product/${sellerUsername}/${product.slug}`;
		throw redirect(301, seoUrl);
	}

	try {
		// Load additional data: seller's other products
		const sellerProductsResult = await locals.supabase
			.from('products')
			.select('id, title, price, slug, product_images(image_url)')
			.eq('seller_id', product.seller_id)
			.eq('is_active', true)
			.eq('is_sold', false)
			.neq('id', product.id)
			.limit(6);
		
		const sellerProducts = sellerProductsResult.data || [];

		const similarProducts: unknown[] = [];
		const userFavorite = false;

		// Extract category info
		const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;

		// Transform data for frontend
		const transformedProduct = {
			...product,
			images: product.product_images?.map((img: { image_url: string }) => img.image_url) || [],
			main_category_name: category?.name || 'Uncategorized',
			category_name: category?.name || 'Uncategorized',
			subcategory_name: null,
			seller_name: sellerProfile?.username || sellerProfile?.full_name || 'Unknown Seller',
			seller_username: sellerProfile?.username,
			seller_avatar: sellerProfile?.avatar_url,
			seller_rating: null,
			seller_sales_count: null,
			seller_bio: null,
			seller: sellerProfile,
			isFavorited: userFavorite,
			category_slug: category?.slug || null,
			parent_category: null,
			top_level_category: null
		};

		return {
			product: transformedProduct,
			similarProducts,
			sellerProducts: sellerProducts || [],
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