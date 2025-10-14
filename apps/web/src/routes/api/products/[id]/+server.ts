import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import type { Database } from '@repo/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductImageRow = { image_url: string; sort_order?: number | null };
type SellerProfile = { username?: string | null; full_name?: string | null; avatar_url?: string | null; rating?: number | null };
type CategorySummary = { id: string; name: string; slug: string };
type ProductJoined = ProductRow & {
	product_images?: ProductImageRow[] | null;
	profiles?: SellerProfile | SellerProfile[] | null;
	categories?: CategorySummary | null;
};

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
	try {
		// Get the product with images and seller info directly
			const { data: product, error: productError } = await supabase
			.from('products')
			.select(`
				*,
				product_images (image_url, sort_order),
				profiles!products_seller_id_fkey (username, full_name, avatar_url, rating),
				categories (id, name, slug)
			`)
			.eq('id', params.id)
			.single();

		if (productError || !product) {
			error(404, 'Product not found');
		}

				// Transform product data to match the UI Product interface
				const joined = product as unknown as ProductJoined;
				const seller = Array.isArray(joined.profiles) ? joined.profiles[0] : joined.profiles;
				const images = Array.isArray(joined.product_images)
					? joined.product_images
							.sort((a: ProductImageRow, b: ProductImageRow) => (a.sort_order || 0) - (b.sort_order || 0))
							.map((img: ProductImageRow) => img.image_url)
							.filter((u): u is string => Boolean(u))
					: [];

				const productData = {
					id: joined.id,
					title: joined.title,
					description: joined.description,
					price: Math.round((joined.price || 0) * 100), // Convert to cents
					images: images.length ? images : ['/placeholder-product.jpg'],
					brand: joined.brand,
					size: joined.size,
					condition: joined.condition,
					category: joined.categories?.name || 'clothing',
					sellerId: joined.seller_id,
					sellerName: seller?.username || 'Unknown',
					sellerRating: seller?.rating || 0,
					createdAt: joined.created_at,
					location: joined.location,
					tags: joined.tags || []
				};

		return json({ product: productData });
			} catch (_e) {
		
		return json({ error: 'Failed to load product' }, { status: 500 });
	}
};