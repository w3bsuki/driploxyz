import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch popular brands based on product count and activity
	const { data: brands, error } = await supabase
		.from('brands')
		.select(`
			*,
			products (count)
		`)
		.order('popularity_score', { ascending: false })
		.limit(50);

	// If brands table doesn't exist, fetch unique brands from products
	if (error || !brands) {
		const { data: products } = await supabase
			.from('products')
			.select('brand')
			.not('brand', 'is', null)
			.eq('status', 'active');

		const brandCounts: Record<string, number> = {};
		products?.forEach(p => {
			if (p.brand) {
				brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
			}
		});

		const popularBrands = Object.entries(brandCounts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 50);

		return {
			brands: popularBrands
		};
	}

	return {
		brands: brands || []
	};
};