import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, locals: { supabase, session } }) => {
  if (!session) {
    throw redirect(303, `/login?redirect=/product/${params.id}/edit`);
  }

  const services = createServices(supabase, null); // No stripe needed for product editing

  // Get the product
  const { data: product, error } = await services.products.getProduct(params.id);

  if (error || !product) {
    throw redirect(303, '/dashboard');
  }

  // Check if user owns this product
  if (product.seller_id !== session.user.id) {
    throw redirect(303, `/product/${params.id}`);
  }

  // Get categories for the form
  const { data: categories } = await services.categories.getCategories();

  return {
    product,
    categories: categories || []
  };
};

export const actions: Actions = {
  update: async ({ request, params, locals: { supabase, session } }) => {
    if (!session) {
      return fail(401, { error: 'Not authenticated' });
    }

    const formData = await request.formData();
    const services = createServices(supabase, null); // No stripe needed for product updates

    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string,
      condition: formData.get('condition') as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair',
      brand: formData.get('brand') as string || null,
      size: formData.get('size') as string || null,
      color: formData.get('color') as string || null,
      material: formData.get('material') as string || null,
      shipping_cost: parseFloat(formData.get('shipping_cost') as string || '0'),
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || null
    };

    const { data, error } = await services.products.updateProduct(
      params.id,
      updates,
      session.user.id
    );

    if (error) {
      return fail(400, { error });
    }

    throw redirect(303, `/product/${params.id}`);
  },

  delete: async ({ params, locals: { supabase, session } }) => {
    if (!session) {
      return fail(401, { error: 'Not authenticated' });
    }

    const services = createServices(supabase, null); // No stripe needed for product deletion
    const { error } = await services.products.deleteProduct(params.id, session.user.id);

    if (error) {
      return fail(400, { error });
    }

    throw redirect(303, '/dashboard');
  }
};