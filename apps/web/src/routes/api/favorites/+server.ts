import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await locals.supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) {
      return json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return json({ favorites: data?.map(f => f.product_id) || [] });
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await locals.supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        product_id: productId
      });

    if (error) {
      
      return json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return json({ success: true });
  } catch {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await locals.supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      
      return json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    return json({ success: true });
  } catch {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};