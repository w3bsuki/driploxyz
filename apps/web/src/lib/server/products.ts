import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { ProductSchema, ProductCondition } from '$lib/validation/product';

export async function searchProducts(
  supabase: SupabaseClient<Database>,
  filters: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular';
    condition?: string[];
    brands?: string[];
    sizes?: string[];
  }
) {
  const { query, category, minPrice, maxPrice, page = 1, limit = 20, sortBy = 'newest' } = filters;

  let dbQuery = supabase
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
  if (query) {
    dbQuery = dbQuery.textSearch('fts', query.trim(), {
      config: 'english',
      type: 'websearch'
    });
  }

  // Category filter
  if (category) {
    dbQuery = dbQuery.eq('category_id', category);
  }

  // Price range filter
  if (minPrice) {
    dbQuery = dbQuery.gte('price', minPrice);
  }
  if (maxPrice) {
    dbQuery = dbQuery.lte('price', maxPrice);
  }

  // Condition filter
  if (filters.condition && filters.condition.length > 0) {
    dbQuery = dbQuery.in('condition', filters.condition);
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    dbQuery = dbQuery.in('brand', filters.brands);
  }

  // Size filter
  if (filters.sizes && filters.sizes.length > 0) {
    dbQuery = dbQuery.in('size', filters.sizes);
  }

  // Sorting
  switch (sortBy) {
    case 'price_low':
      dbQuery = dbQuery.order('price', { ascending: true });
      break;
    case 'price_high':
      dbQuery = dbQuery.order('price', { ascending: false });
      break;
    case 'popular':
      dbQuery = dbQuery.order('views', { ascending: false });
      break;
    case 'newest':
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return {
    products: data || [],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function createProduct(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: z.infer<typeof ProductSchema> & { photos: File[] }
) {
  // Upload images first
  const imageUrls = [];
  for (const [index, photo] of data.photos.entries()) {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, photo, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('product-images').getPublicUrl(fileName);

    imageUrls.push({
      url: publicUrl,
      is_primary: index === 0,
      storage_path: fileName
    });
  }

  // Create product
  const { data: product, error: productError } = await supabase
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
      seller_id: userId,
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

  const { error: imagesError } = await supabase
    .from('product_images')
    .insert(imageInserts);

  if (imagesError) throw imagesError;

  // Apply premium boost if requested
  if (data.use_premium_boost) {
    const { error: boostError } = await supabase.rpc('decrement_premium_boosts', {
      user_id: userId
    });

    if (!boostError) {
      await supabase.from('product_boosts').insert({
        product_id: product.id,
        boost_type: 'premium',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  return { success: true, product };
}

export async function getPriceSuggestions(
  supabase: SupabaseClient<Database>,
  params: {
    categoryId: string;
    brand?: string;
    condition: z.infer<typeof ProductCondition>;
    size?: string;
  }
) {
  const { categoryId, brand, condition, size } = params;

  // Get similar products for price analysis
  let query = supabase
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