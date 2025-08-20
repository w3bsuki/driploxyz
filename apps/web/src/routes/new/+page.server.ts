import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch newest products from the last 7 days
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
		.gte('created_at', sevenDaysAgo.toISOString())
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(50);

	return {
		products: products || []
	};
};