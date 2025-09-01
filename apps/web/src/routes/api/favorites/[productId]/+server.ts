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
	
	// Check if this exact request is already being processed
	if (processingRequests.has(requestKey)) {
		return processingRequests.get(requestKey)!;
	}
	
	// Create the processing promise
	const processRequest = async () => {
		try {
			// Check if product exists and if it's sold
			const { data: product, error: productError } = await locals.supabase
				.from('products')
				.select('id, is_sold')
				.eq('id', productId)
				.single();
			
			if (productError || !product) {
				console.error('Product not found or error:', productError);
				return json({ error: 'Product not found' }, { status: 404 });
			}
			
			// Check if already favorited
			const { data: existingFavorite, error: favoriteError } = await locals.supabase
				.from('favorites')
				.select('id')
				.eq('user_id', session.user.id)
				.eq('product_id', productId)
				.single();

			// Note: favoriteError is expected when no favorite exists (PGRST116)
			
			if (existingFavorite) {
				// Remove favorite
				const { error: deleteError } = await locals.supabase
					.from('favorites')
					.delete()
					.eq('user_id', session.user.id)
					.eq('product_id', productId);
				
				if (deleteError) {
					console.error('Failed to remove favorite:', deleteError);
					return json({ error: 'Failed to remove favorite', details: deleteError.message }, { status: 500 });
				}
				
				// Get updated count (trigger automatically decrements)
				const { data: updatedProduct } = await locals.supabase
					.from('products')
					.select('favorite_count')
					.eq('id', productId)
					.single();
				
					
				return json({ 
					favorited: false,
					action: 'removed',
					message: 'Removed from favorites',
					favoriteCount: updatedProduct?.favorite_count || 0
				});
			} else {
				// Prevent adding favorite to sold products
				if (product.is_sold) {
					return json({ 
						error: 'Cannot favorite sold items',
						message: 'This item has been sold and cannot be favorited'
					}, { status: 409 });
				}
				
				// Add favorite
				const { error: insertError } = await locals.supabase
					.from('favorites')
					.insert({
						user_id: session.user.id,
						product_id: productId
					});
				
				if (insertError) {
					console.error('Failed to add favorite:', insertError);
					return json({ error: 'Failed to add favorite', details: insertError.message }, { status: 500 });
				}
				
				// Get updated count (trigger automatically increments)
				const { data: updatedProduct } = await locals.supabase
					.from('products')
					.select('favorite_count')
					.eq('id', productId)
					.single();
				
					
				return json({ 
					favorited: true,
					action: 'added',
					message: 'Added to favorites',
					favoriteCount: updatedProduct?.favorite_count || 1
				});
			}
		} catch (error) {
			console.error('Favorites API error:', error);
			return json({ 
				error: 'Internal server error', 
				message: 'An error occurred while processing your request' 
			}, { status: 500 });
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