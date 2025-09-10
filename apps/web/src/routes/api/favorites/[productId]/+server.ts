import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { enforceRateLimit } from '$lib/security/rate-limiter';

// In-memory cache to prevent duplicate requests
const processingRequests = new Map<string, Promise<any>>();

// GET - Check if product is favorited and get count
export const GET: RequestHandler = async ({ params, locals, request, getClientAddress }) => {
	// Generous rate limiting for read operations
	const rateLimitResponse = await enforceRateLimit(
		request, 
		getClientAddress, 
		'apiRead',
		`favorites-check:${getClientAddress()}`
	);
	if (rateLimitResponse) return rateLimitResponse;
	
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
export const POST: RequestHandler = async ({ params, locals, request, getClientAddress }) => {
	// Rate limiting for favorite actions
	const rateLimitResponse = await enforceRateLimit(
		request, 
		getClientAddress, 
		'favorites',
		`favorites-toggle:${getClientAddress()}`
	);
	if (rateLimitResponse) return rateLimitResponse;
	
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
				.select('id, is_sold, is_active')
				.eq('id', productId)
				.single();
			
			if (productError || !product) {
				console.error('Product not found or error:', productError);
				return json({ error: 'Product not found' }, { status: 404 });
			}
			
			// Prevent adding favorite to sold or inactive products (align with RLS)
			if (product.is_sold || product.is_active === false) {
				return json({ 
					error: 'Cannot favorite this item',
					message: product.is_sold ? 'This item has been sold and cannot be favorited' : 'This item is inactive and cannot be favorited'
				}, { status: 409 });
			}
			
			// Check if already favorited
			const { data: existingFavorite } = await locals.supabase
				.from('favorites')
				.select('id')
				.eq('user_id', session.user.id)
				.eq('product_id', productId)
				.single();
			
			if (existingFavorite) {
				// Remove favorite - atomic operation
				const { error: deleteError } = await locals.supabase
					.from('favorites')
					.delete()
					.eq('user_id', session.user.id)
					.eq('product_id', productId);
				
				if (deleteError) {
					if ((deleteError as any).code === '42501') {
						return json({ error: 'Not allowed', message: 'You are not allowed to modify this favorite' }, { status: 403 });
					}
					console.error('Failed to remove favorite:', deleteError);
					return json({ error: 'Failed to remove favorite', details: deleteError.message }, { status: 500 });
				}
				
				// Get updated count
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
				// Add favorite - use insert and handle unique constraint violation
				const { error: insertError } = await locals.supabase
					.from('favorites')
					.insert({
						user_id: session.user.id,
						product_id: productId
					});
				
				// If duplicate key error (23505), it's already favorited - ignore it
				if (insertError) {
					if (insertError.code === '23505') {
						// no-op, already favorited
					} else if (insertError.code === '42501') {
						// RLS not allowed
						return json({ error: 'Not allowed', message: 'You are not allowed to favorite this item' }, { status: 403 });
					} else {
						console.error('Failed to add favorite:', insertError);
						return json({ error: 'Failed to add favorite', details: insertError.message }, { status: 500 });
					}
				}
				
				// Get updated count
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