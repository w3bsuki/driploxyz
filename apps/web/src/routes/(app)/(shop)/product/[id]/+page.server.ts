import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUUID } from '$lib/utils/seo-urls';

export const load = (async ({ params, locals }) => {
	const { id } = params;

	// 1. Try to find the product
	let query = locals.supabase
		.from('products')
		.select(`
			id,
			slug,
			seller:profiles!products_seller_id_fkey (username),
			category:categories (slug)
		`)
		.limit(1);

	if (isUUID(id)) {
		query = query.eq('id', id);
	} else {
		query = query.eq('slug', id);
	}

	const { data: product, error: err } = await query.maybeSingle();

	if (err || !product) {
		throw error(404, 'Product not found');
	}

	// 2. Construct the new SEO URL
	// Pattern: /product/[seller_username]/[category_slug]/[product_slug]
	const sellerUsername = Array.isArray(product.seller) 
		? product.seller[0]?.username 
		: product.seller?.username;

	const categorySlug = Array.isArray(product.category)
		? product.category[0]?.slug
		: product.category?.slug;

	if (product.slug && sellerUsername) {
		const targetUrl = categorySlug
			? `/product/${sellerUsername}/${categorySlug}/${product.slug}`
			: `/product/${sellerUsername}/${product.slug}`;
			
		// 3. Perform the permanent redirect (301)
		throw redirect(301, targetUrl);
	}

	// 4. Fallback if data is missing (shouldn't happen for valid products)
	throw error(404, 'Product URL could not be resolved');

}) satisfies PageServerLoad;
