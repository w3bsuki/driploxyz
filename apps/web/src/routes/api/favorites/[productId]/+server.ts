import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

// GET - Check if product is favorited and get count
export const GET: RequestHandler = async ({ params, locals }) => {
	const { productId } = params;
	const { session } = await locals.safeGetSession();
	
	// Get total favorite count for this product
	const { data: product } = await locals.supabase
		.from('products')
		.select('favorite_count')
		.eq('id', productId)
		.single();
	
	let isFavorited = false;
	
	// Check if current user has favorited (if logged in)
	if (session?.user) {
		const { data: favorite } = await locals.supabase
			.from('favorites')
			.select('id')
			.eq('user_id', session.user.id)
			.eq('product_id', productId)
			.single();
		
		isFavorited = !!favorite;
	}
	
	return json({
		isFavorited,
		favoriteCount: product?.favorite_count || 0
	});
};

// POST - Toggle favorite
export const POST: RequestHandler = async ({ params, locals }) => {
	const { productId } = params;
	const { session } = await locals.safeGetSession();
	
	if (!session?.user) {
		return json({ error: 'Login required to favorite items' }, { status: 401 });
	}
	
	// Check if already favorited
	const { data: existingFavorite } = await locals.supabase
		.from('favorites')
		.select('id')
		.eq('user_id', session.user.id)
		.eq('product_id', productId)
		.single();
	
	if (existingFavorite) {
		// Remove favorite
		await locals.supabase
			.from('favorites')
			.delete()
			.eq('user_id', session.user.id)
			.eq('product_id', productId);
		
		// Decrement count
		await locals.supabase.rpc('decrement_favorite_count', { product_id: productId });
		
		return json({ 
			favorited: false,
			action: 'removed',
			message: 'Removed from favorites'
		});
	} else {
		// Add favorite
		await locals.supabase
			.from('favorites')
			.insert({
				user_id: session.user.id,
				product_id: productId
			});
		
		// Increment count
		await locals.supabase.rpc('increment_favorite_count', { product_id: productId });
		
		return json({ 
			favorited: true,
			action: 'added',
			message: 'Added to favorites'
		});
	}
};