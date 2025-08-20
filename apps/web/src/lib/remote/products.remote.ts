import { query, form, command, prerender } from '@sveltejs/kit/remote';
import { z } from 'zod';
import type { Database } from '@repo/database';
import { ProductSchema, ProductCondition } from '$lib/validation/product';

// Query functions (read operations)
export const getCategories = query(async ({ locals }) => {
	const { data, error } = await locals.supabase
		.from('categories')
		.select('*')
		.order('sort_order');

	if (error) throw error;
	return data;
});

export const getProduct = query(
	z.object({ id: z.string().uuid() }),
	async ({ locals }, { id }) => {
		const { data, error } = await locals.supabase
			.from('products')
			.select(`
        *,
        seller:profiles(*),
        category:categories(*),
        images:product_images(*)
      `)
			.eq('id', id)
			.single();

		if (error) throw error;
		return data;
	}
);

export const searchProducts = query(
	z.object({
		query: z.string().optional(),
		category: z.string().optional(),
		minPrice: z.number().optional(),
		maxPrice: z.number().optional(),
		page: z.number().default(1),
		limit: z.number().default(20),
		sortBy: z.enum(['newest', 'price_low', 'price_high', 'popular']).default('newest'),
		condition: z.array(z.enum(['new', 'like-new', 'good', 'fair'])).optional(),
		brands: z.array(z.string()).optional(),
		sizes: z.array(z.string()).optional()
	}),
	async ({ locals }, filters) => {
		let query = locals.supabase
			.from('products')
			.select(
				`
        *,
        seller:profiles(id, username, avatar_url, account_type, rating),
        category:categories(name, slug),
        images:product_images(url, is_primary)
      `,
				{ count: 'exact' }
			)
			.eq('status', 'active')
			.eq('is_sold', false);

		// Full text search
		if (filters.query) {
			query = query.textSearch('fts', filters.query.trim(), {
				config: 'english',
				type: 'websearch'
			});
		}

		// Category filter
		if (filters.category) {
			query = query.eq('category_id', filters.category);
		}

		// Price range filter
		if (filters.minPrice) {
			query = query.gte('price', filters.minPrice);
		}
		if (filters.maxPrice) {
			query = query.lte('price', filters.maxPrice);
		}

		// Condition filter
		if (filters.condition && filters.condition.length > 0) {
			query = query.in('condition', filters.condition);
		}

		// Brand filter
		if (filters.brands && filters.brands.length > 0) {
			query = query.in('brand', filters.brands);
		}

		// Size filter
		if (filters.sizes && filters.sizes.length > 0) {
			query = query.in('size', filters.sizes);
		}

		// Sorting
		switch (filters.sortBy) {
			case 'price_low':
				query = query.order('price', { ascending: true });
				break;
			case 'price_high':
				query = query.order('price', { ascending: false });
				break;
			case 'popular':
				query = query.order('views', { ascending: false });
				break;
			case 'newest':
			default:
				query = query.order('created_at', { ascending: false });
		}

		// Pagination
		const from = (filters.page - 1) * filters.limit;
		const to = from + filters.limit - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) throw error;

		return {
			products: data || [],
			totalCount: count || 0,
			page: filters.page,
			limit: filters.limit,
			totalPages: Math.ceil((count || 0) / filters.limit)
		};
	}
);

export const getFeaturedProducts = query(
	z.object({
		limit: z.number().default(8)
	}),
	async ({ locals }, { limit }) => {
		const { data, error } = await locals.supabase
			.from('products')
			.select(
				`
        *,
        seller:profiles(id, username, avatar_url, account_type),
        category:categories(name, slug),
        images:product_images(url, is_primary)
      `
			)
			.eq('status', 'active')
			.eq('is_sold', false)
			.eq('is_featured', true)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;
		return data || [];
	}
);

export const getSimilarProducts = query(
	z.object({
		productId: z.string().uuid(),
		categoryId: z.string().uuid(),
		limit: z.number().default(4)
	}),
	async ({ locals }, { productId, categoryId, limit }) => {
		const { data, error } = await locals.supabase
			.from('products')
			.select(
				`
        *,
        seller:profiles(id, username, avatar_url),
        images:product_images(url, is_primary)
      `
			)
			.eq('status', 'active')
			.eq('is_sold', false)
			.eq('category_id', categoryId)
			.neq('id', productId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;
		return data || [];
	}
);

// Form functions (write via forms)
export const createProduct = form(
	ProductSchema.extend({
		photos: z.array(z.instanceof(File)).min(1, 'At least one photo is required')
	}),
	async ({ locals }, data) => {
		// Verify user is authenticated
		const { user } = await locals.safeGetSession();
		if (!user) throw new Error('Unauthorized');

		// Upload images first
		const imageUrls = [];
		for (const [index, photo] of data.photos.entries()) {
			const fileExt = photo.name.split('.').pop();
			const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

			const { data: uploadData, error: uploadError } = await locals.supabase.storage
				.from('product-images')
				.upload(fileName, photo, {
					cacheControl: '3600',
					upsert: false
				});

			if (uploadError) throw uploadError;

			// Get public URL
			const {
				data: { publicUrl }
			} = locals.supabase.storage.from('product-images').getPublicUrl(fileName);

			imageUrls.push({
				url: publicUrl,
				is_primary: index === 0,
				storage_path: fileName
			});
		}

		// Create product
		const { data: product, error: productError } = await locals.supabase
			.from('products')
			.insert({
				title: data.title,
				description: data.description,
				price: data.price,
				shipping_cost: data.shipping_cost,
				category_id: data.category_id,
				subcategory_id: data.subcategory_id,
				brand: data.brand,
				size: data.size,
				condition: data.condition,
				color: data.color,
				material: data.material,
				tags: data.tags,
				seller_id: user.id,
				status: 'active'
			})
			.select()
			.single();

		if (productError) throw productError;

		// Insert product images
		const imageInserts = imageUrls.map((img) => ({
			product_id: product.id,
			...img
		}));

		const { error: imagesError } = await locals.supabase
			.from('product_images')
			.insert(imageInserts);

		if (imagesError) throw imagesError;

		// Apply premium boost if requested
		if (data.use_premium_boost) {
			const { error: boostError } = await locals.supabase
				.from('profiles')
				.update({
					premium_boosts_remaining: locals.supabase.sql`premium_boosts_remaining - 1`
				})
				.eq('id', user.id);

			if (!boostError) {
				await locals.supabase.from('product_boosts').insert({
					product_id: product.id,
					boost_type: 'premium',
					expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
				});
			}
		}

		return { success: true, product };
	}
);

export const updateProduct = form(
	z.object({
		id: z.string().uuid(),
		title: z.string().min(3).max(50),
		description: z.string().max(500).optional(),
		price: z.number().positive(),
		shipping_cost: z.number().min(0),
		condition: ProductCondition,
		tags: z.array(z.string()).max(10).optional()
	}),
	async ({ locals }, data) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw new Error('Unauthorized');

		// Verify ownership
		const { data: product, error: fetchError } = await locals.supabase
			.from('products')
			.select('seller_id')
			.eq('id', data.id)
			.single();

		if (fetchError || product.seller_id !== user.id) {
			throw new Error('Product not found or unauthorized');
		}

		// Update product
		const { data: updatedProduct, error } = await locals.supabase
			.from('products')
			.update({
				title: data.title,
				description: data.description,
				price: data.price,
				shipping_cost: data.shipping_cost,
				condition: data.condition,
				tags: data.tags,
				updated_at: new Date().toISOString()
			})
			.eq('id', data.id)
			.select()
			.single();

		if (error) throw error;
		return { success: true, product: updatedProduct };
	}
);

// Command functions (write from anywhere)
export const toggleFavorite = command(
	z.object({ productId: z.string().uuid() }),
	async ({ locals }, { productId }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw new Error('Unauthorized');

		// Check if already favorited
		const { data: existing } = await locals.supabase
			.from('favorites')
			.select('id')
			.eq('product_id', productId)
			.eq('user_id', user.id)
			.single();

		if (existing) {
			// Remove favorite
			await locals.supabase.from('favorites').delete().eq('id', existing.id);
			return { favorited: false };
		} else {
			// Add favorite
			await locals.supabase.from('favorites').insert({
				product_id: productId,
				user_id: user.id
			});
			return { favorited: true };
		}
	}
);

export const reportProduct = command(
	z.object({
		productId: z.string().uuid(),
		reason: z.enum(['inappropriate', 'fake', 'spam', 'other']),
		details: z.string().max(500).optional()
	}),
	async ({ locals }, { productId, reason, details }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw new Error('Unauthorized');

		const { error } = await locals.supabase.from('product_reports').insert({
			product_id: productId,
			reporter_id: user.id,
			reason,
			details
		});

		if (error) throw error;
		return { success: true };
	}
);

export const incrementViews = command(
	z.object({ productId: z.string().uuid() }),
	async ({ locals }, { productId }) => {
		// Increment view count (no auth required)
		const { error } = await locals.supabase
			.from('products')
			.update({
				views: locals.supabase.sql`views + 1`
			})
			.eq('id', productId);

		if (error) throw error;
		return { success: true };
	}
);

export const getPriceSuggestions = command(
	z.object({
		categoryId: z.string().uuid(),
		brand: z.string().optional(),
		condition: ProductCondition,
		size: z.string().optional()
	}),
	async ({ locals }, { categoryId, brand, condition, size }) => {
		// Get similar products for price analysis
		let query = locals.supabase
			.from('products')
			.select('price')
			.eq('category_id', categoryId)
			.eq('condition', condition)
			.eq('is_sold', true) // Only sold items for accurate pricing
			.not('price', 'is', null)
			.order('sold_at', { ascending: false })
			.limit(50); // Recent sold items

		if (brand) {
			query = query.ilike('brand', `%${brand}%`);
		}

		if (size) {
			query = query.eq('size', size);
		}

		const { data, error } = await query;

		if (error || !data || data.length === 0) {
			return {
				suggested: null,
				range: null,
				confidence: 'low'
			};
		}

		const prices = data.map((p) => p.price).sort((a, b) => a - b);
		const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
		const median = prices[Math.floor(prices.length / 2)];
		const min = Math.min(...prices);
		const max = Math.max(...prices);

		const suggested = Math.round((avg + median) / 2);
		const confidence = data.length >= 10 ? 'high' : data.length >= 5 ? 'medium' : 'low';

		return {
			suggested,
			range: { min, max },
			confidence,
			sampleSize: data.length
		};
	}
);

// Prerender function for static data
export const getStaticCategories = prerender(async ({ locals }) => {
	const { data } = await locals.supabase
		.from('categories')
		.select('*')
		.eq('is_active', true)
		.order('sort_order');

	return data || [];
});