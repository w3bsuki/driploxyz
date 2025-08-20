import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch products with discounts or marked as deals
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
			)
		`)
		.or('discount_percentage.gt.0,is_featured.eq.true')
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(50);

	return {
		products: products || []
	};
};