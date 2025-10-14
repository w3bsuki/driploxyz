import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Database } from '@repo/database';

type ProductOwnership = { seller_id?: string | null };

export const load = (async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    redirect(303, `/login?redirect=/product/${params.id}/edit`);
  }

  // Get the product directly from Supabase (domain method not implemented yet)
  const { data: product, error } = await locals.supabase
    .from('products')
    .select('id, seller_id, title, description, price, category_id, condition, brand, size, color, material, shipping_cost, tags')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    redirect(303, '/dashboard');
  }

  // Check if user owns this product
  // Ensure product has seller_id shape; unknown from adapter is tolerated via runtime check
  if ((product as ProductOwnership)?.seller_id !== user.id) {
    redirect(303, `/product/${params.id}`);
  }

  // Get categories for the form
  const { data: categories } = await locals.supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true });

  return {
    product,
    categories: categories || []
  };
}) satisfies PageServerLoad;

export const actions = {
  update: async ({ request, params, locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return fail(401, { error: 'Not authenticated' });
    }

    const formData = await request.formData();
    const updates: Partial<Database['public']['Tables']['products']['Update']> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string,
      condition: formData.get('condition') as Database['public']['Enums']['product_condition'],
      brand: (formData.get('brand') as string) || null,
      size: (formData.get('size') as string) || null,
      color: (formData.get('color') as string) || null,
      material: (formData.get('material') as string) || null,
      shipping_cost: parseFloat((formData.get('shipping_cost') as string) || '0'),
      tags: ((formData.get('tags') as string) || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20) || null,
      updated_at: new Date().toISOString()
    };

    // Ensure ownership before update
    const { data: ownership } = await locals.supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', params.id)
      .single();

    if (!ownership || ownership.seller_id !== user.id) {
      return fail(403, { error: 'Forbidden' });
    }

    const { error } = await locals.supabase
      .from('products')
      .update(updates)
      .eq('id', params.id);

    if (error) {
      return fail(400, { error });
    }

    redirect(303, `/product/${params.id}`);
  },

  delete: async ({ params, locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return fail(401, { error: 'Not authenticated' });
    }

    // Ensure ownership before delete
    const { data: ownership } = await locals.supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', params.id)
      .single();

    if (!ownership || ownership.seller_id !== user.id) {
      return fail(403, { error: 'Forbidden' });
    }

    const { error } = await locals.supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      return fail(400, { error });
    }

    redirect(303, '/dashboard');
  }
} satisfies Actions;