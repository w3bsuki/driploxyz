import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

// In-memory cache to prevent duplicate requests
const processingRequests = new Map<string, Promise<any>>();

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
	
	const requestKey = `${session.user.id}:${productId}`;
	console.log(`[FAVORITE API] User ${session.user.id} requesting favorite toggle for product ${productId}`);
	
	// Check if this exact request is already being processed
	if (processingRequests.has(requestKey)) {
		console.log(`[FAVORITE API] Duplicate request detected, returning cached promise`);
		return processingRequests.get(requestKey)!;
	}
	
	// Create the processing promise
	const processRequest = async () => {
		try {
			// Check if already favorited
			const { data: existingFavorite } = await locals.supabase
				.from('favorites')
				.select('id')
				.eq('user_id', session.user.id)
				.eq('product_id', productId)
				.single();
			
			if (existingFavorite) {
				// Remove favorite
				const { error: deleteError } = await locals.supabase
					.from('favorites')
					.delete()
					.eq('user_id', session.user.id)
					.eq('product_id', productId);
				
				if (deleteError) {
					console.error('Error removing favorite:', deleteError);
					throw new Error('Failed to remove favorite');
				}
				
				// Decrement count
				const { error: rpcError } = await locals.supabase.rpc('decrement_favorite_count', { product_uuid: productId });
				
				if (rpcError) {
					console.error('Error decrementing count:', rpcError);
				}
				
				// Get updated count
				const { data: updatedProduct } = await locals.supabase
					.from('products')
					.select('favorite_count')
					.eq('id', productId)
					.single();
				
				console.log(`[FAVORITE API] Removed favorite. New count: ${updatedProduct?.favorite_count || 0}`);
				
				return json({ 
					favorited: false,
					action: 'removed',
					message: 'Removed from favorites',
					favoriteCount: updatedProduct?.favorite_count || 0
				});
			} else {
				// Add favorite
				const { error: insertError } = await locals.supabase
					.from('favorites')
					.insert({
						user_id: session.user.id,
						product_id: productId
					});
				
				if (insertError) {
					console.error('Error adding favorite:', insertError);
					throw new Error('Failed to add favorite');
				}
				
				// Get count BEFORE increment for debugging
				const { data: beforeProduct } = await locals.supabase
					.from('products')
					.select('favorite_count')
					.eq('id', productId)
					.single();
				
				console.log(`[FAVORITE API] Before increment: Product ${productId} has ${beforeProduct?.favorite_count || 0} favorites`);
				
				// Increment count
				const { error: rpcError } = await locals.supabase.rpc('increment_favorite_count', { product_uuid: productId });
				
				if (rpcError) {
					console.error('Error incrementing count:', rpcError);
				}
				
				// Get updated count
				const { data: updatedProduct } = await locals.supabase
					.from('products')
					.select('favorite_count')
					.eq('id', productId)
					.single();
				
				console.log(`[FAVORITE API] After increment: Product ${productId} has ${updatedProduct?.favorite_count || 0} favorites`);
				
				return json({ 
					favorited: true,
					action: 'added',
					message: 'Added to favorites',
					favoriteCount: updatedProduct?.favorite_count || 1
				});
			}
		} finally {
			// Clean up the request cache
			processingRequests.delete(requestKey);
		}
	};
	
	// Store the promise in cache and execute
	const promise = processRequest();
	processingRequests.set(requestKey, promise);
	
	return promise;
};