import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch trending products based on views, favorites, and recent activity
	const { data: products, error } = await supabase
		.from('products')
		.select(`
			*,
			profiles!products_seller_id_fkey (
				username,
				avatar_url
			),
			product_images (
				image_url,
				is_primary
			),
			favorites (count)
		`)
		.eq('status', 'active')
		.order('view_count', { ascending: false })
		.limit(50);

	return {
		products: products || []
	};
};